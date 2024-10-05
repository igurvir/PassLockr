import React, { useState } from 'react';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState('Weak');

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

  const generatePassword = async () => {
    const response = await fetch('/api/generate-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ length, includeUpper, includeNumbers, includeSymbols }),
    });
    const data = await response.json();
    console.log('Password:', data.password, 'Strength:', calculateStrength(data.password)); // Added this line for debugging
    setPassword(data.password);
    setStrength(calculateStrength(data.password));
  };

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
        <button onClick={generatePassword}>Generate Password</button>
        <div>
          <h2>Generated Password: {password}</h2>
          <h3>Password Strength: {strength}</h3>
        </div>
      </header>
    </div>
  );
}

export default App;
