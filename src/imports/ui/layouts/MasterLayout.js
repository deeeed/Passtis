import './MasterLayout.html';
import './navigation.js';
import './top-navbar.js';


import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Template} from 'meteor/templating';
import {$} from 'meteor/jquery';

import SyncManager from '/imports/api/client/SyncManager.js';
import ClientScope from '/imports/api/client/ClientScope.js';

const SLIDEOUT_THRESHOLD_SIZE = 768;

Template.MasterLayout.onRendered(function () {
    // Setup code for the Slideout menu
    // It will automatically appear on mobile and when the window size is below 768px.
    let f = () => {
        let currentWindowWidth = $('html').width();
        if (isMobile.any || currentWindowWidth < SLIDEOUT_THRESHOLD_SIZE) {
            if (ClientScope.slideout == null) {
                ClientScope.slideout = new Slideout({
                    'panel': this.find('#main'),
                    'menu': this.find('#slideout-menu'),
                    'tolerance': 70,
                    'padding': 220,
                    'touch': false
                });
                $(".js-toggle-menu").removeClass("hidden");
            }
        } else if (ClientScope.slideout != null) {
            if (ClientScope.slideout.isOpen()) {
                // Also make sure to remove the transform property used by slideoutjs is reset
                // otherwise it will leave a blank space on the screen.
                $("#main").css("transform", "");
            }
            $(".slideout-menu").removeClass("slideout-menu");
            $(".js-toggle-menu").addClass("hidden");
            ClientScope.slideout = null;
        } else {
            $(".js-toggle-menu").addClass("hidden");
        }
    };
    // Handle window resizing events
    $(window).bind("resize", f);
    f(); // Make sure it runs on first rendering
});

Template.MasterLayout.helpers({
    syncReady() {
        return SyncManager.isReady();
    }
});

Template.MasterLayout.events({
    "click .js-connect": function (evt) {
        evt.preventDefault();
        Meteor.reconnect();
    }
});
