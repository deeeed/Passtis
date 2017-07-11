# Passtis 
## Manage and synchronize your passwords anywhere securely

![Passtis on MacOS](/docs/images/passtis_macos.png?raw=true "Passtis running on MacOS")

### Description:
Passtis is an extremely simple password manager, while trying to be secure and portable.

It has been created for a Meteor demo during a week-end project, so it is certainly not meant to be run in production anytime soon.

My goal, thanks to Meteor and Electron, has been to run the same codebase on Windows, MacOS, Linux, Android, IOS, and on any browser. 

Here is a list of Passtis features:

- Manage passwords securely
- Automatically synchronize your accounts between devices
- Multiple User/Password per account (useful for system admin)
- Can be self hosted on your own servers
- Native app on Android and Iphone (using Cordova)
- Native app on Windows, MacOS, and Linux (using electron)
- i18n

### TODO:
- Unit Tests
- Import/export passwords from the system (Keychains, Chrome, Firefox, ...) 
- Import from other Password Managers
- Shareable accounts (between users / organizations)
- Mobile Friendly password generator (plugable rule engine)
- Configurable password policy (expiration, etc..)
- eslint, add es6 rules
- keep track of password history
- visual password strength (which account has a weak / expired password?) 
- Improve the translations
- Migrate to React
- Deployment/Configuration Documentation
- Browser Plugin to synchronize the browser with Passtis
- Infinite scrolling instead of paginated view (on accounts page)

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

Additionally, I wanted to see how to migrate my current Password Manager that I created in 2009 using Java (GUI) and PHP (backend and account synchronization).

It’s not meant to replace any commercial solution (1Pass, LastPass, etc..), but I think it can become quite useful 
if you’re looking for a free secure native synchronized solution, open-source, and self-hosted. 
Plus I like to use my own stuff...
Obviously this version is extremely basic, but with a few new features, it could become interesting.

You can do whatever you want with the source code, and you are most welcome to submit pull requests! 

### How does it work ?
Passtis has been designed to work offline and uses LocalForage (ground:db) to store your accounts.
When you start having a lot of accounts (500+), the UI can become much slower (all the accounts are kept in memory). 
I still have to think of a better way to handle all these accounts. I am thinking to create an hybrid storage mode to solve this problem. 
It would use a "vault" (AES encrypted file) and could allow grouping of accounts, but I don't mind the slow UI for now.


### Security
Passtis should be deployed over ssl, which is very easy to setup with letsencrypt and meteor-up.  
The data model for each accounts contains a clear (data visible in the db) and a secure section (encrypted in the database).
The secure section contains your {host, description, [ login + password ]} and is encrypted with AES-256.

**Even if the database were compromised, it would be impossible for an attacker to access your login / password.**

![Example of an account in MongoDB](/docs/images/account_dbmodel.png?raw=true "Example of an account in MongoDB")

In order to avoid brute force and dictionary attacks, Your passphrase is not directly applied for encryption, 
Passtis uses **PBKDF2 for key stretching**. A seed is randomly created and associated to each user upon registration,
and then added to the passphrase during the key generation.

Below is an example of key generation and encryption / decryption using CryptoJS:
```
var account = {name: "some_remote_server", users: [{login: "demo", password: "demo1234"}]};
try {
    // Key Generation
    var passphrase = "user-defined value";
    // seed is specific to each user and is created during registration
    var seed = CryptoJS.lib.WordArray.random(128 / 8).toString();
    // Generate an encryption/decryption key from the passphrase and the user seed
    var key = CryptoJS.PBKDF2(passphrase, seed, {keySize: 512 / 32, iterations: 10}).toString();

    // Encrypt our account
    var secure = CryptoJS.AES.encrypt(EJSON.stringify(account), key).toString();

    // Decrypt our secure data
    var decrypted = CryptoJS.AES.decrypt(secure, key).toString();

    // Back to our initial account
    account = EJSON.parse(decrypted);
} catch (err) {
    console.error("oups...", err);
}
``` 

For PBKDF2, I changed the number of iterations from 1000 (recommended in CryptoJS) to 10, because it was putting too much stress on the phone when testing with Cordova.
Feel free to adjust the value according to your security preferences.
Your encryption key is never stored on the servers, the encryption/decryption is done locally directly in your browser/webview.
Once the key is generated, it is kept in the client memory as a javascript variable. 

You can read more about password-based cryptography on RFC2898  http://www.ietf.org/rfc/rfc2898.txt .

_A few more things to investigate:_

+ Is it possible to dump the memory to access the key ?
+ Is there any kind of protection that could be added ? 

### Architecture Choices / Problems

##### How do you ensure all the accounts are available offline if the client looses its connection ?
At the moment, a client is subscribing to the server to receive all the accounts on the initial connection.
It's fine if there are only a few accounts, but will quickly become a problem if you have thousands of accounts.
It would be much better to use a paginated subscription, but then there would be no way to ensure all the data are loaded for a mobile usage.

##### How to change the passphrase ?
Two possibilities, it could be done locally or on the server.

1) Locally: It would be more secure because the key or passphrase would never go over the wire but extremely slow if a lot of accounts were to be migrated.

2) Remotely: The problem is that the passphrase or the key would have to be transferred on the wire, it's definitely not as safe but would be much faster.    

How to ensure atomicity of the operation (migration with new encryption key)?
Maybe using the password history feature and rollback if one of the account didn't migrate successfully.
Should have a versioning mechanism to each account for the rollback.