import React, { useState } from 'react';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = async () => {
    const response = await fetch('/api/generate-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ length, includeUpper, includeNumbers, includeSymbols }),
    });
    const data = await response.json();
    setPassword(data.password);
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
        </div>
      </header>
    </div>
  );
}

export default App;
