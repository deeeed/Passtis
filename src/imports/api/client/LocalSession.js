/**
 * Prevent using Session from the window scope.
 *
 * export a singleton instance of a ReactiveDict to be used instead of the Session object.
 *
 * example:
 * import LocalSession from '/imports/api/client/LocalSession.js';
 * LocalSession.set("key", value);
 *
 */

import {ReactiveDict} from 'meteor/reactive-dict';

// ReactiveDict needs to be called with an argument to persist across hotcode push.
const dict = new ReactiveDict('persist');

// Add an abstraction layer for the session object to allow changing the persistance layer.
export const localSession = {
    set(key, value, persist=false) {
        // console.debug("setting local session item", key, value);
        if(persist) {
            window.sessionStorage.setItem(key, value);
        }

        dict.set(key, value);
    },
    /**
     * Must be reactive
     *
     * @param key
     */
    get(key) {
        // Use dict to make it reactive
        let value = dict.get(key);
        if(!value) {
            // Also try to find it from session storage.
            value = sessionStorage.getItem(key);
        }
        return value;
    },
    equals(key, value) {
        return this.get(key) == value;
    }
};

if (Meteor.isDevelopment) {
    // FIXME remove, allow to modifiy the key from the console
    window.localSession = localSession;
}

