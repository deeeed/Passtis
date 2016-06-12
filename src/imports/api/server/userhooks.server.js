import CryptoJS from 'crypto-js';
import log from '/imports/util/loggers.js';

import { Meteor } from 'meteor/meteor';

if(Meteor.isServer) {
    /**
     * Special hook for automatically associating a salt to each newly created user.
     */
    Accounts.onCreateUser((options, user) => {
        log.info("New user creation, adding automatic salt");
        // Use the default salt example from CryptoJS documentation
        let config = {
            salt: CryptoJS.lib.WordArray.random(128 / 8).toString(),
            passphrase: null,
            pincode: null
        }
        user.config = config;
        return user;
    });
}

