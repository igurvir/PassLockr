const mongoose = require('mongoose');
const masterPasswordSchema = new mongoose.Schema({
  passwordHash: { type: String, required: true },
});

module.exports = mongoose.model('MasterPassword', masterPasswordSchema);
