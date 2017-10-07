import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

import isElectron from "is-electron";

import './settings.html';

Template.settings.onCreated(function () {
    this.processing = new ReactiveVar(null);
});

Template.settings.helpers({
    isProcessing: function () {
        return Template.instance().processing.get() != null;
    },
    processing: function () {
        return Template.instance().processing.get();
    }
});

Template.settings.events({
    "click .js-electron"(evt, tpl) {
        window.isElectron = isElectron;

        if(isElectron()) {
            console.debug("electron", Bridge);
        } else {
            console.warn("not inside electron");
        }

    },
    "click .js-lang": (evt, tpl) => {
        evt.preventDefault();
        let locale = $(evt.target).data("locale");
        msgfmt.setLocale(locale);
    },
    "click .js-disconnect": function (evt) {
        evt.preventDefault();
        Meteor.disconnect();
    }
});
