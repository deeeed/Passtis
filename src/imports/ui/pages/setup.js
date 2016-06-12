import CryptoJS from 'crypto-js';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import { modalReposition } from '/imports/ui/helpers.js';

import SyncManager from '/imports/api/client/SyncManager.js';
import SetupForm from '/imports/ui/forms/SetupForms.js';
import LocalSession from '/imports/api/client/LocalSession.js';
import './setup.html';

LocalSession.setDefault("enckey", null);

Template.setup.helpers({
    syncReady() {
        return SyncManager.isReady();
    },
    hasSetup() {
        const user = Meteor.user() || {};
        const config = user.config || {};
        return config.passphrase != null;
    },
    isProcessing() {
        return Template.instance().processing.get() != null;
    },
    processing() {
        return Template.instance().processing.get();
    },
    schema() {
        return SetupForm;
    }
});

Template.setup.events({
    "submit #PassphraseForm"(evt, tpl) {
        evt.preventDefault();

        tpl.processing.set(mf("setup.check_passphrase", "Check passphrase validity..."));
        let passphrase = tpl.find("#passphrase").value;
        let hash = CryptoJS.SHA256(passphrase).toString();
        const config = Meteor.user().config;

        if(config.passphrase!=hash) {
            // Display an error message and reset the ui to ask for another passphrase.
            sAlert.error(mf("setup.error_invalid","Invalid passphrase"), config.passphrase, hash);
            LocalSession.set("enckey",null);
            tpl.processing.set(null);
            return;
        }
        tpl.processing.set(mf("setup.generate","Generate encryption key..."));

        setTimeout(function() {
            //TODO allow configuration of the number of iterations (should be in user preferences)
            let key = CryptoJS.PBKDF2(passphrase, config.salt, {keySize: 512 / 32, iterations: 10}).toString();
            LocalSession.set("enckey", key);
        }, 100);
    }
});

Template.setup.onCreated(function () {
    var self = this;
    this.processing = new ReactiveVar(mf("setup.initial_loading", "Loading user information"));

    AutoForm.addHooks("setupPassphraseForm", {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            this.event.preventDefault();
            this.event.stopPropagation();

            var form = this;

            console.debug("Setting up account submit",this,self);
            self.processing.set(mf("setup.generating","Generating encryption key..."));

            // It needs a delay to display the processing message.
            setTimeout(function() {
                const passphrase = insertDoc.passphrase;
                let user = Meteor.user();
                if(user==null) {
                    return;
                }
                const config = user.config;

                let key = CryptoJS.PBKDF2(passphrase, config.salt, {keySize: 512 / 32, iterations: 10}).toString();

                self.processing.set(mf("setup.saving","Saving passphrase..."));
                // Save a hashed version of the passphrase, it will be used as a switch to know the setup is done.
                var hash = CryptoJS.SHA256(passphrase).toString();
                Meteor.users.update({_id: Meteor.userId()},{$set: {"config.passphrase":hash}}, function(err, res) {
                    // console.debug("update result", err, res);
                    if(err) {
                        form.done(mf("setup.error","an error occured"));
                        return;
                    }

                    LocalSession.set("enckey", key);
                    return form.done();
                });
            }, 400);
        },
        onError: function (formType, error) {
            sAlert.error(mf("setup.error","an error occured"));
            self.processing.set(null);
        },
        onSuccess: function (operation, result, template) {
            self.processing.set(null);
            sAlert.success(mf("setup.created","Your encryption key has been created."));
        }
    }, true);
});

Template.setup.onRendered(function () {
    /**
     * The setup modal is displayed only if the encryption key is not available in the session context.
     *
     * Two screens can be displayed depending on wether or not the setup has been done.
     * If the setup has never been done, passphrase+confirmation are asked,
     * otherwise only the passphrase is asked.
     */
    this.autorun(() => {
        if(SyncManager.isReady()) {
            this.processing.set(null);
        }

        let enckey = LocalSession.get("enckey");
        if(LocalSession.equals("enckey", null)) {
            this.$("#setupModal").modal("show");
        } else {
            this.$("#setupModal").modal("hide");
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        }
    });

    // Adjust modal position to the center of the screen.
    modalReposition();
});

Template.setup.onDestroyed(function () {
});
