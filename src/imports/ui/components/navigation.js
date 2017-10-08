import './navigation.html';
import {localSession} from "../../api/client/LocalSession";
import {ClientScope} from "../../api/client/ClientScope";

Template.navigation.helpers({
    isDebug() {
        return localSession.equals("debug", true)
    },
    version() {
        let version = lodash.get(Meteor.settings, "public.version");
        if (version) {
            return `v${version}`;
        }
    }
})

/**
 * Used for managing coerdova version on double click on the logo
 */
let lastClick = new Date().getTime();
let clickCount = -1;


Template.navigation.events({
    "click .js-nav-menu": (evt, tpl) => {
        // Close slideout after a click on navigation menu
        if (ClientScope.slideout != null) {
            ClientScope.slideout.close();
        }
    },
    'click .js-cordova-version'(evt, tpl) {
        evt.preventDefault();

        let now = new Date().getTime();
        let elapsed = now - lastClick;

        if (elapsed < 2000) {
            if (clickCount > 2) {
                let debug = !!localSession.get("debug");
                // Reverse debug status
                localSession.set("debug", !debug);
                if (Meteor.isCordova) {
                    window.plugins.toast.showShortBottom(`Cordova ${AppVersion.version}`);
                }
                // Reset click count
                clickCount = 0;
            } else {
                clickCount = clickCount + 1;
            }
        } else {
            // reset click count
            clickCount = 1;
            lastClick = now;
        }
    },
    'click .js-logout'(evt) {
        evt.preventDefault();
        // Display logging out template
        AccountsTemplates.logout();
        Router.go("logout");
    }
});