import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

import './logout.html';

Template.logout.helpers({
});

Template.logout.events({
});

Template.logout.onCreated(function () {
});

Template.logout.onRendered(function () {
    // Wait for logout to complete and redirect to the login page.
    this.autorun(()=>{
        let user = Meteor.user();
        if(!user) {
            // Logout is completed once the user is not found
            Router.go("accounts");
        }
    });
});

Template.logout.onDestroyed(function () {
});

