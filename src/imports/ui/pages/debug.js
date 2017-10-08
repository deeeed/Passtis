import "./debug.html"
import isElectron from "is-electron";

Template.debug.onCreated(function() {

})

Template.debug.onRendered(function() {

})

Template.debug.helpers({

})

Template.debug.events({
    "click .js-electron"(evt, tpl) {
        window.isElectron = isElectron;

        if(isElectron()) {
            console.debug("electron", Bridge);
        } else {
            console.warn("not inside electron");
        }

    },
    "click .js-disconnect": function (evt) {
        evt.preventDefault();
        Meteor.disconnect();
    }
})