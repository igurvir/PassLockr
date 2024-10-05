const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // Import bcrypt for password hashing
const Password = require('./models/Password');
require('dotenv').config();  // Load environment variables

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// MongoDB connection
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passlockr'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Encryption setup
const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'utf8');

// In-memory storage for master password (store this in the database in real use case)
let masterPasswordHash = '';

// Function to encrypt passwords
const encryptPassword = (password) => {
  const iv = crypto.randomBytes(16); // Generate a unique IV for each password
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Function to decrypt passwords
const decryptPassword = (encryptedPassword, iv) => {
  try {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    throw new Error('Decryption failed');
  }
};

// Route to set the master password (hash it)
app.post('/api/set-master-password', async (req, res) => {
  const { masterPassword } = req.body;
  if (!masterPassword) {
    return res.status(400).json({ message: 'Master password is required' });
  }

  const saltRounds = 10;
  try {
    masterPasswordHash = await bcrypt.hash(masterPassword, saltRounds);
    res.json({ message: 'Master password set successfully' });
  } catch (err) {
    console.error('Error setting master password:', err.message);
    res.status(500).json({ message: 'Error setting master password' });
  }
});

// Route to verify the master password
app.post('/api/verify-master-password', async (req, res) => {
  const { masterPassword } = req.body;
  if (!masterPassword) {
    return res.status(400).json({ message: 'Master password is required' });
  }

  try {
    const match = await bcrypt.compare(masterPassword, masterPasswordHash);
    if (match) {
      res.json({ message: 'Master password verified' });
    } else {
      res.status(401).json({ message: 'Incorrect master password' });
    }
  } catch (err) {
    console.error('Error verifying master password:', err.message);
    res.status(500).json({ message: 'Error verifying master password' });
  }
});

// API route for generating passwords
app.post('/api/generate-password', (req, res) => {
  const length = parseInt(req.body.length, 10);
  const { includeUpper, includeNumbers, includeSymbols } = req.body;

  if (isNaN(length) || length < 8 || length > 32) {
    return res.status(400).json({ error: 'Invalid length. Must be between 8 and 32.' });
  }

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

  let charset = lowercase;
  if (includeUpper) charset += uppercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (charset.length === 0) {
    return res.status(400).json({ error: 'No character types selected.' });
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  res.json({ password });
});

// API route for saving encrypted passwords to MongoDB
app.post('/api/save-password', async (req, res) => {
  const { password, website } = req.body;
  
  if (!password || !website) {
    return res.status(400).json({ message: 'Password and Website are required' });
  }

  const encryptedPassword = encryptPassword(password);
  
  try {
    const newPassword = new Password({
      website,
      encryptedPassword: encryptedPassword.encryptedData,
      iv: encryptedPassword.iv
    });

    await newPassword.save();
    res.json({ message: 'Password saved successfully to the database' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error saving password to the database' });
  }
});

// API route for retrieving saved passwords (only if master password is valid)
app.post('/api/get-passwords', async (req, res) => {
  const { masterPassword } = req.body;
  try {
    const match = await bcrypt.compare(masterPassword, masterPasswordHash);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect master password' });
    }

    const passwords = await Password.find({});
    const decryptedPasswords = passwords.map(pwd => ({
      website: pwd.website,
      password: decryptPassword(pwd.encryptedPassword, pwd.iv)
    }));
    res.json(decryptedPasswords);  // Return decrypted passwords
  } catch (err) {
    console.log('Error retrieving passwords:', err.message);
    res.status(500).json({ message: 'Error retrieving passwords' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to PassLockr!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
