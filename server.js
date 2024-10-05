const express = require('express');
const cors = require('cors'); // Add CORS middleware
const crypto = require('crypto'); // Add crypto for encryption
const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32);  // Secret key for encryption
const iv = crypto.randomBytes(16);         // Initialization vector

// Function to encrypt passwords
const encryptPassword = (password) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
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

// API route for saving encrypted passwords
app.post('/api/save-password', (req, res) => {
  const { password, website } = req.body;
  
  if (!password || !website) {
    return res.status(400).json({ message: 'Password and Website are required' });
  }

  const encryptedPassword = encryptPassword(password);
  console.log(`Website: ${website}, Encrypted Password: ${encryptedPassword.encryptedData}, IV: ${encryptedPassword.iv}`);

  res.json({ message: 'Password saved successfully (encrypted)' });
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to PassLockr!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
