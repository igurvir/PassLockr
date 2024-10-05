import React, { useState } from 'react';

function SetMasterPassword() {
  const [masterPassword, setMasterPassword] = useState('');

  const setPassword = async () => {
    const response = await fetch('/api/set-master-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterPassword }),
    });
    const result = await response.json();
    alert(result.message);
  };

  return (
    <div>
      <h2>Set Master Password</h2>
      <input
        type="password"
        value={masterPassword}
        onChange={(e) => setMasterPassword(e.target.value)}
        placeholder="Enter master password"
      />
      <button onClick={setPassword}>Set Password</button>
    </div>
  );
}

export default SetMasterPassword;
