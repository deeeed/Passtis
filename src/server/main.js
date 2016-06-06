import '/imports/startup/server/index.js';
import '/imports/startup/i18n.js';


Meteor.startup(() => {
    // Listen to incoming HTTP requests, can only be used on the server
    WebApp.rawConnectHandlers.use(function(req, res, next) {
        // Enable CORS for Cordova access
        // cross-origin resource sharing http://enable-cors.org/index.html
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
});
