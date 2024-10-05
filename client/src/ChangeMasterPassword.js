import React, { useState } from 'react';

function ChangeMasterPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const changePassword = async () => {
    const response = await fetch('/api/change-master-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const result = await response.json();
    alert(result.message);
  };

  return (
    <div>
      <h2>Change Master Password</h2>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Current password"
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
      />
      <button onClick={changePassword}>Change Password</button>
    </div>
  );
}

export default ChangeMasterPassword;
