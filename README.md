# Passtis 
## Manage and synchronize your passwords anywhere securely

### Description:
Passtis is a very very simple password manager (<2000 lines of JS), while trying to be secure simple and portable.

It was created for a Meteor demo during a week-end project, so it is certainly not meant to be run in production anytime soon.

My goal, thanks to Meteor and Electron, has been to run the same codebase on Windows, MacOs, Android, IOS, and on any browser. 

Here is a list of Passtis features:

- Manage passwords securely
- Copy username / password to clipboard
- Automatically synchronize your accounts between devices
- Multiple User/Password per account (useful for system admin)
- Can be self hosted on your own servers
- Native app on Android and Iphone (using Cordova)
- Native app on Windows and MacOS (using electron)

### TODO:
- Import/export passwords from the system (Keychains, Chrome, Firefox, ...) 
- Shareable accounts (between users)
- Mobile Friendly password generator (rule engine)
- Configurable password policy (expiration, etc..)
- eslint, add es6 rules
- keep track of password history
- visual password strengh (which account has a weak / expired password?) 
- Improve the translations

### Usage



### Why Passtis ?
There are plenty of other more advanced Password Management Software, but I could never find one that fit all my requirements together:

- Multi user per accounts (very useful for sysadmins)
- Natively running on mobile and desktop
- Synchronized

Additionally, I wanted to see how to migrate my current Password Manager that I created in 2009 using Java (client UI) and PHP (backend and account synchronization).

It’s not meant to replace any commercial solution (1Pass, LastPass, etc..), but I think it can become quite useful if you’re looking for a free secure native synchronized solution, open-source, and self-hosted. Plus I like to use my own stuff...
Obviously this version is extremely basic, but with a few new features, it could become interesting...

You can do whatever you want with the source code, and you are most welcome to submit pull requests! 

### How does it work ?
Passtis has been designed to work offline first and uses LocalForage (ground:db) to store your information.
When you start having a lot accounts (500+), the UI can become much slower (all the accounts are kept in memory). 
I still have to think of a better way to handle all these accounts. I am thinking to create an hybrid storage mode to solve this problem. 
it would use a "vault" (AES encrypted file) and could allow grouping of accounts, but I don't mind the slow UI for now.


### Security
Passtis should be deployed over ssl, which is very easy to setup with letsencrypt and meteor-up.  
The data model for each accounts contains a clear and a secure section (host, description, [ login + password ]), which are **AES-256 encrypted**.
In order to avoid brute force and dictionary attack, Your passphrase is not directly applied for encryption, Passtis uses **PBKDF2 for key stretching**.
A random seed is associated to each user on registration, added to the passphrase through for key generation.

```CryptoJS.PBKDF2(passphrase, userseed, {keySize: 512 / 32, iterations: 10})``` 

I changed the number of iterations from 1000 (recommended in CryptoJS) to 10, because it was putting too much stress on the phone when testing with Cordova.
Feel free to adjust the value according to your security preferences ;)

You can read more about password-based cryptography on RFC2898  http://www.ietf.org/rfc/rfc2898.txt .

Your encryption key is never stored on the servers, the encryption/decryption is done locally directly in your browser/webview.
**Even if the database were compromised, it would be impossible for an attacker to access your login / password.**

Once the key is generated, it is kept in the client memory as a javascript variable. Is it possible to dump the memory to access the key ?
Is there any kind of protection that could be added ? 

