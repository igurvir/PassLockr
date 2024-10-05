import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [website, setWebsite] = useState('');  
  const [strength, setStrength] = useState('Weak');
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [masterPassword, setMasterPassword] = useState(''); // State for master password
  const [isVerified, setIsVerified] = useState(false); // To track if master password is verified

  // New states for changing master password
  const [currentMasterPassword, setCurrentMasterPassword] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');

  const calculateStrength = (pwd) => {
    let strengthLevel = 0;
    if (pwd.length >= 8) strengthLevel++;
    if (/[A-Z]/.test(pwd)) strengthLevel++; 
    if (/[0-9]/.test(pwd)) strengthLevel++; 
    if (/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(pwd)) strengthLevel++; 

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

      isValid = checkPasswordPattern(validPassword);
    }

    setPassword(validPassword);
    setStrength(calculateStrength(validPassword));
  };

  const savePassword = async () => {
    const response = await fetch('/api/save-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, website }),
    });
    const result = await response.json();
    alert(result.message);
  };

  // Fetch passwords after verifying the master password
  const fetchSavedPasswords = async () => {
    const response = await fetch('/api/get-passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterPassword }), // Send the master password for verification
    });

    const data = await response.json();

    if (response.status === 200) {
      setSavedPasswords(data);
      setIsVerified(true); // Mark master password as verified
    } else {
      alert('Invalid master password');
    }
  };

  // Change master password logic
  const changeMasterPassword = async () => {
    if (newMasterPassword !== confirmMasterPassword) {
      return alert('New passwords do not match');
    }

    const response = await fetch('/api/change-master-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentMasterPassword,
        newMasterPassword,
      }),
    });

    if (response.ok) {
      alert('Master password changed successfully');
      setCurrentMasterPassword('');
      setNewMasterPassword('');
      setConfirmMasterPassword('');
    } else {
      alert('Failed to change master password');
    }
  };

  // Delete password by website
  const deletePassword = async (websiteToDelete) => {
    const response = await fetch('/api/delete-password', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website: websiteToDelete }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      setSavedPasswords(savedPasswords.filter(pwd => pwd.website !== websiteToDelete));
    } else {
      alert(result.message);
    }
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
        <button onClick={savePassword}>Save Password</button>

        <div>
          <h2>Generated Password: {password}</h2>
          <h3>Password Strength: {strength}</h3>
        </div>

        {/* Prompt for master password */}
        <div>
          <h2>Enter Master Password to View Saved Passwords</h2>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter master password"
          />
          <button onClick={fetchSavedPasswords}>Verify Master Password</button>
        </div>

        {/* Display saved passwords if verified */}
        {isVerified && (
          <div>
            <h2>Saved Passwords:</h2>
            <ul>
              {Array.isArray(savedPasswords) && savedPasswords.length > 0 ? (
                savedPasswords.map((pwd, index) => (
                  <li key={index}>
                    <strong>Website:</strong> {pwd.website} <br />
                    <strong>Password:</strong> {pwd.password}
                    <button onClick={() => deletePassword(pwd.website)}>Delete</button>
                  </li>
                ))
              ) : (
                <li>No saved passwords found.</li>
              )}
            </ul>
          </div>
        )}

        {/* Change Master Password Section */}
        <div>
          <h2>Change Master Password</h2>
          <input
            type="password"
            value={currentMasterPassword}
            onChange={(e) => setCurrentMasterPassword(e.target.value)}
            placeholder="Current Master Password"
          />
          <input
            type="password"
            value={newMasterPassword}
            onChange={(e) => setNewMasterPassword(e.target.value)}
            placeholder="New Master Password"
          />
          <input
            type="password"
            value={confirmMasterPassword}
            onChange={(e) => setConfirmMasterPassword(e.target.value)}
            placeholder="Confirm New Master Password"
          />
          <button onClick={changeMasterPassword}>Change Master Password</button>
        </div>
      </header>
    </div>
  );
}

export default App;
