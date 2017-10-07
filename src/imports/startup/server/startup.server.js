import './authorizations.js';
import '../i18n.js';
import '/imports/api/server/publish.server.js';
import '/imports/api/server/methods.server.js';
import '/imports/api/server/userhooks.server.js';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

Meteor.startup(() => {
    // Initiate demo account
    const email = "demo@passtis.pw";
    let demo = Meteor.users.findOne({"emails.address": email});
    if (!demo) {
        console.log(`Demo account not found, creating one`);
        Accounts.createUser({email: email, password: "demo1234"});
    }

    // Listen to incoming HTTP requests, can only be used on the server
    WebApp.rawConnectHandlers.use(function(req, res, next) {
        // Enable CORS for Cordova access
        // cross-origin resource sharing http://enable-cors.org/index.html
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
})
