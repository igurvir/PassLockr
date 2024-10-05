// models/Password.js
const mongoose = require('mongoose');

// Define the schema for the password
const passwordSchema = new mongoose.Schema({
  website: { type: String, required: true },
  encryptedPassword: { type: String, required: true },
  iv: { type: String, required: true }
});

// Create the model
const Password = mongoose.model('Password', passwordSchema);

module.exports = Password;
