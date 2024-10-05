const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Password = require('./models/Password');
require('dotenv').config();  // Load environment variables

const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// MongoDB connection
const dbURI = 'mongodb://localhost:27017/passlockr'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Encryption setup
const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'utf8');

// Function to encrypt passwords
const encryptPassword = (password) => {
  const iv = crypto.randomBytes(16); // Generate a unique IV for each password
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  console.log(`Encrypted password: ${encrypted}, IV: ${iv.toString('hex')}`);
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Function to decrypt passwords
const decryptPassword = (encryptedPassword, iv) => {
  try {
    console.log(`Decrypting with IV: ${iv}`);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(`Decrypted password: ${decrypted}`);
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    throw new Error('Decryption failed');
  }
};

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

// API route for retrieving saved passwords from MongoDB and decrypting
app.get('/api/get-passwords', async (req, res) => {
  try {
    const passwords = await Password.find({});
    const decryptedPasswords = passwords.map(pwd => ({
      website: pwd.website,
      password: decryptPassword(pwd.encryptedPassword, pwd.iv) // Decrypt before sending
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
