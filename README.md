# PassLockr - Password Manager & Generator
Overview
PassLockr is a secure web application that generates strong, customizable passwords and manages user passwords securely using encryption. This project showcases a secure password management system with AES-256 encryption, bcrypt hashing for master password protection, and a streamlined web interface built with React and Node.js. It also provides the ability to change master passwords and delete saved passwords securely. PassLockr stores all data in MongoDB, offering users peace of mind by ensuring sensitive data is encrypted and secure.

Features
Password Generation:

Generate strong, random passwords with customizable options.
Passwords can be customized to include uppercase letters, numbers, and symbols.
The length of the password is adjustable from 8 to 32 characters.
Password Strength Calculation:

Real-time evaluation of password strength based on length and character types.
Displays password strength (Weak, Moderate, Strong, or Very Strong) to help users choose secure passwords.
Master Password Protection:

Users must set a master password to access saved passwords.
The master password is hashed with bcrypt to provide additional security.
Users can change the master password at any time.
Password Storage and Encryption:

Passwords are stored securely in MongoDB, encrypted with AES-256 encryption.
Each password entry includes an IV (Initialization Vector) for unique encryption.
Passwords are decrypted only after the user enters the correct master password.
Password Management:

Users can view, manage, and delete saved passwords.
Passwords are associated with a website/service name for easy identification.
Password deletion is allowed after master password verification.
Secure Data Handling:

AES-256 encryption ensures the security of stored passwords.
Bcrypt ensures secure storage of the master password.
MongoDB is used to store the encrypted data securely.
Tech Stack
Frontend:

React
Bootstrap (for improved UI styling)
Backend:

Node.js
Express.js
Database:

MongoDB
Security:

AES-256 encryption for password storage.
Bcrypt hashing for master password protection.
Installation & Setup
Prerequisites
Node.js (v14.x or above)
MongoDB (local or cloud instance)
npm (Node Package Manager)
Instructions
Clone the Repository:

bash
Copy code
git clone https://github.com/yourusername/passlockr.git
cd passlockr
Install Dependencies:

bash
Copy code
npm install
Set up Environment Variables: Create a .env file in the root directory and add the following values:

makefile
Copy code
MONGODB_URI=<your_mongodb_connection_string>
SECRET_KEY=<32_character_secret_key_for_aes>
Run the Application: Start the development server:

bash
Copy code
npm start
By default, the application will run on http://localhost:5001. You can access the frontend by running it on port 3000.

Run the Frontend: Open a new terminal window, navigate to the client folder, and start the React application:

bash
Copy code
cd client
npm start
API Endpoints
Set Master Password
Endpoint: POST /api/set-master-password
Description: Set the master password for the first time.
Body:
json
Copy code
{
  "masterPassword": "your_master_password"
}
Verify Master Password
Endpoint: POST /api/verify-master-password
Description: Verify the master password before accessing passwords.
Body:
json
Copy code
{
  "masterPassword": "your_master_password"
}
Change Master Password
Endpoint: POST /api/change-master-password
Description: Change the master password.
Body:
json
Copy code
{
  "currentMasterPassword": "current_password",
  "newMasterPassword": "new_password"
}
Generate Password
Endpoint: POST /api/generate-password
Description: Generate a new password with custom options.
Body:
json
Copy code
{
  "length": 12,
  "includeUpper": true,
  "includeNumbers": true,
  "includeSymbols": true
}
Save Password
Endpoint: POST /api/save-password
Description: Save a generated password for a website or service.
Body:
json
Copy code
{
  "password": "generated_password",
  "website": "example.com"
}
Get Saved Passwords
Endpoint: POST /api/get-passwords
Description: Retrieve saved, encrypted passwords after verifying the master password.
Body:
json
Copy code
{
  "masterPassword": "your_master_password"
}
Delete Saved Password
Endpoint: DELETE /api/delete-password
Description: Delete a saved password for a specific website.
Body:
json
Copy code
{
  "website": "example.com"
}
Future Improvements
Add multi-factor authentication (MFA) for enhanced security.
Implement password history to prevent reuse of old passwords.
Add a password expiration policy.
