const express = require('express');
const cors = require('cors'); // Add CORS middleware
const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

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

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to PassLockr!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
