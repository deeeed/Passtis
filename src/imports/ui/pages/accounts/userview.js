import './userview.html'

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import Clipboard   from 'clipboard';

let clipboard = null;
Template.userview.onCreated(function() {
    this.dict = new ReactiveDict();
})

Template.userview.onRendered(function() {
    // Reset clipboard value in case it was selected from another account
    // Otherwise it may display the password by default.
    clipboard = new Clipboard(".clip");
    clipboard.on("success", function (e) {
        // console.info('Action:', e.action);
        // console.info('Text:', e.text);
        // console.info('Trigger:', e.trigger);

        // Display notification tooltip for 1sec to inform data is in clipboard
        const targetNode = $(e.trigger);
        targetNode.tooltip({
            title: mf('clipboard_copy', 'Copied to clipboard'),
            placement: 'bottom',
            trigger: 'manual'
        }).tooltip('show');
        // Hide tooltip message after 1second
        Meteor.setTimeout(() => targetNode.tooltip('hide'), 1000);
    });
    clipboard.on('error', function (e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
})

Template.userview.helpers({
    passwordValue() {
        return Template.instance().dict.get("viewPassword") ? this.password : "***************";
    },
    eyeIcon() {
        return Template.instance().dict.get("viewPassword") ? "fa-eye-slash" : "fa-eye";
    }
})

Template.userview.events({
    "click .js-view"(evt, tpl) {
        evt.preventDefault();

        let view = !tpl.dict.get("viewPassword");
        tpl.dict.set("viewPassword", view);
    }
})

Template.userview.onDestroyed(function () {
    if (clipboard) {
        clipboard.destroy();
    }
});
