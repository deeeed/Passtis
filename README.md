# Passtis 
## Manage and synchronize your passwords anywhere securely

![Passtis on MacOS](/docs/image/passtis_macos.png?raw=true "Passtis running on MacOS")

### Description:
Passtis is a very very simple password manager (<2000 lines of JS), while trying to be secure simple and portable.

It was created for a Meteor demo during a week-end project, so it is certainly not meant to be run in production anytime soon.

My goal, thanks to Meteor and Electron, has been to run the same codebase on Windows, MacOS, Linux, Android, IOS, and on any browser. 

Here is a list of Passtis features:

- Manage passwords securely
- Copy username / password to clipboard
- Automatically synchronize your accounts between devices
- Multiple User/Password per account (useful for system admin)
- Can be self hosted on your own servers
- Native app on Android and Iphone (using Cordova)
- Native app on Windows and MacOS (using electron)

### TODO:
- Unit Tests
- Import/export passwords from the system (Keychains, Chrome, Firefox, ...) 
- Shareable accounts (between users)
- Mobile Friendly password generator (rule engine)
- Configurable password policy (expiration, etc..)
- eslint, add es6 rules
- keep track of password history
- visual password strengh (which account has a weak / expired password?) 
- Improve the translations
- Migrate to React
- Deployment/Configuration Documentation

### Usage


```
seyan:temp deeeed$ git clone https://github.com/deeeed/Passtis.git
Cloning into 'Passtis'...
remote: Counting objects: 117, done.
remote: Compressing objects: 100% (104/104), done.
remote: Total 117 (delta 4), reused 117 (delta 4), pack-reused 0
Receiving objects: 100% (117/117), 101.61 KiB | 100.00 KiB/s, done.
Resolving deltas: 100% (4/4), done.
Checking connectivity... done.
seyan:temp deeeed$ cd Passtis/src/
seyan:src deeeed$ npm install
/Users/deeeed/temp/Passtis/src
...
seyan:src deeeed$ meteor run
[[[[[ ~/temp/Passtis/src ]]]]]

=> Started proxy.
=> Started MongoDB.
I20160607-01:05:47.720(8)? init logger in msgfmt.js { name: 'msgfmt',
I20160607-01:05:47.722(8)?   _events: { warn: [Function], info: [Function], error: [Function] } }
I20160607-01:05:48.135(8)? 2016-06-07 01:05:47.587 info:  [msgfmt]  syncAll() (from mfAll.js) updating...
I20160607-01:05:48.473(8)? 2016-06-07 01:05:48.470 info:  [msgfmt]  addNative() (from extracts.msgfmt~) updating...
I20160607-01:05:48.905(8)? Starting publish in Filter Collections fc-filtered_accounts-results
=> Started your app.

=> App running at: http://localhost:3000/
I20160607-01:05:49.738(8)? 2016-06-07 01:05:49.736 info:  [msgfmt:extracts]  14 string(s) added, 1 changed, and 1 marked as removed.
I20160607-01:05:49.738(8)? 2016-06-07 01:05:49.736 info:  [msgfmt]  addNative() (from extracts.msgfmt~) updating...
```

You can also create native builds with electron:

```
seyan:electron_src deeeed$ ./build.sh
Packaging app for platform linux ia32 using electron v0.36.2
Packaging app for platform win32 ia32 using electron v0.36.2
Packaging app for platform darwin x64 using electron v0.36.2
Packaging app for platform linux x64 using electron v0.36.2
Packaging app for platform win32 x64 using electron v0.36.2
Wrote new apps to:
/Users/deeeed/WebstormProjects/Passtis/PasstisApp/electron_src/PasstisApp-linux-ia32
/Users/deeeed/WebstormProjects/Passtis/PasstisApp/electron_src/PasstisApp-win32-ia32
/Users/deeeed/WebstormProjects/Passtis/PasstisApp/electron_src/PasstisApp-darwin-x64
/Users/deeeed/WebstormProjects/Passtis/PasstisApp/electron_src/PasstisApp-linux-x64
/Users/deeeed/WebstormProjects/Passtis/PasstisApp/electron_src/PasstisApp-win32-x64
seyan:electron_src deeeed$ ls
PasstisApp-darwin-x64 PasstisApp-linux-ia32 PasstisApp-linux-x64  PasstisApp-win32-ia32 PasstisApp-win32-x64  build.sh              index.js              node_modules          package.json          passtis.icns          passtis.png
seyan:electron_src deeeed$ 
```

### Why Passtis ?
There are plenty of other more advanced Password Management Software, but I could not find one that fit all my requirements together:

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

