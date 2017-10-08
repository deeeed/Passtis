import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';

import {RandomPassword} from "../../../api/RandomPassword";
import './secureInput.html';

/**
 * Autoform input type for a user account
 * - Toggable view to choose when to display the content of the field
 * - Generate password button
 */
AutoForm.addInputType("secureInput", {
    template: "secure_input",
    valueOut: function () {
        // console.debug("secure_input value out", this.val(), this);
        return this.val();
    },
    contextAdjust: function (context) {
        // console.debug("context is ", context);
        return context;
    }
});

Template.secure_input.onCreated(function() {
    // console.debug("oncreated secure input ",this);
    // var defaultType = "password";
    var defaultType = this.data.atts["defaultType"]=="text" ? "text" : "password";
    this.inputType = new ReactiveVar(defaultType);
});


Template.secure_input.helpers({
    inputType: function() {
        return Template.instance().inputType.get();
    },
    getValue: function() {
        var type = Template.instance().inputType.get();
        return type == "text" ? this.value : "***********";
    },
    dsk: function dsk() {
        return {
            "data-schema-key": this.atts["data-schema-key"]
        };
    }
});

Template.secure_input.events({
    "click .js-toggleview":function (evt, tpl) {
        evt.preventDefault();
        let currentView = tpl.inputType.get();
        if(currentView=="password") {
            tpl.inputType.set("text");
        } else {
            tpl.inputType.set("password");
        }
    },
    "click .js-generate":function (evt, tpl) {
        evt.preventDefault();
        let password = new RandomPassword().create();
        tpl.$("input").val(password);
    }
});
