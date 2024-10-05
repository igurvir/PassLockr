import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [website, setWebsite] = useState('');  // State for website input
  const [strength, setStrength] = useState('Weak');
  const [savedPasswords, setSavedPasswords] = useState([]);  // State to store retrieved passwords

  const calculateStrength = (pwd) => {
    let strengthLevel = 0;
    if (pwd.length >= 8) strengthLevel++;
    if (/[A-Z]/.test(pwd)) strengthLevel++;  // Uppercase check
    if (/[0-9]/.test(pwd)) strengthLevel++;  // Numbers check
    if (/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(pwd)) strengthLevel++;  // Symbols check

    switch (strengthLevel) {
      case 1:
        return 'Weak';
      case 2:
        return 'Moderate';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return 'Weak';
    }
  };

  const checkPasswordPattern = (pwd) => {
    for (let i = 2; i < pwd.length; i++) {
      const isUppercase = (char) => /[A-Z]/.test(char);
      const isNumber = (char) => /[0-9]/.test(char);
      const isSymbol = (char) => /[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(char);

      const char1 = pwd[i - 2];
      const char2 = pwd[i - 1];
      const char3 = pwd[i];

      // If three consecutive characters are from the same set, return false
      if (
        (isUppercase(char1) && isUppercase(char2) && isUppercase(char3)) ||
        (isNumber(char1) && isNumber(char2) && isNumber(char3)) ||
        (isSymbol(char1) && isSymbol(char2) && isSymbol(char3))
      ) {
        return false;
      }
    }
    return true;
  };

  const generatePassword = async () => {
    let validPassword = '';
    let isValid = false;

    while (!isValid) {
      const response = await fetch('/api/generate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length, includeUpper, includeNumbers, includeSymbols }),
      });
      const data = await response.json();
      validPassword = data.password;

      // Validate password pattern
      isValid = checkPasswordPattern(validPassword);
    }

    console.log('Password:', validPassword, 'Strength:', calculateStrength(validPassword));
    setPassword(validPassword);
    setStrength(calculateStrength(validPassword));
  };

  // Save password functionality to store password with website name
  const savePassword = async () => {
    const response = await fetch('/api/save-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, website }),  // Send password and website
    });
    const result = await response.json();
    alert(result.message);  // Show success message
  };

  // Fetch saved passwords from the backend
  const fetchSavedPasswords = async () => {
    const response = await fetch('/api/get-passwords');
    const data = await response.json();
    setSavedPasswords(data);  // Store the retrieved passwords
  };

  // Fetch saved passwords on component mount
  useEffect(() => {
    fetchSavedPasswords();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PassLockr - Password Generator</h1>
        <label>Password Length: {length}</label>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={() => setIncludeUpper(!includeUpper)}
            />
            Include Uppercase Letters
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={() => setIncludeNumbers(!includeNumbers)}
            />
            Include Numbers
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={() => setIncludeSymbols(!includeSymbols)}
            />
            Include Symbols
          </label>
        </div>

        {/* Website Input */}
        <div>
          <label>Website/Service Name:</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Enter website or service name"
          />
        </div>

        <button onClick={generatePassword}>Generate Password</button>
        <button onClick={savePassword}>Save Password</button>  {/* Save Button */}
        <div>
          <h2>Generated Password: {password}</h2>
          <h3>Password Strength: {strength}</h3>
        </div>

        {/* Display saved passwords */}
        <h2>Saved Passwords:</h2>
        <ul>
          {Array.isArray(savedPasswords) && savedPasswords.length > 0 ? (
            savedPasswords.map((pwd, index) => (
              <li key={index}>
                <strong>Website:</strong> {pwd.website} <br />
                <strong>Password:</strong> {pwd.password}
              </li>
            ))
          ) : (
            <li>No saved passwords found.</li>
          )}
        </ul>
      </header>
    </div>
  );
}

export default App;
