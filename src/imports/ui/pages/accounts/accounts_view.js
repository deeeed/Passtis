import CryptoJS from 'crypto-js';
import Clipboard   from 'clipboard';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import $ from 'jquery';
import {ReactiveVar} from 'meteor/reactive-var';
import {ReactiveDict} from 'meteor/reactive-dict';

import bootbox from 'bootbox';

import {KeyAccounts} from "../../../api/model/KeyAccounts.model";
import {localSession} from "../../../api/client/LocalSession";

import './accounts_view.html';
import './userview'

// ######################################################################
let clipboard = null;
Template.account_view.onCreated(function () {
    this.viewUser = new ReactiveVar(null);
    this.accountData = new ReactiveVar(null);
    // Set if an error occur while decrypting the account.
    this.decryptionError = new ReactiveVar(null);
    this.processing = new ReactiveVar(null);
});

Template.account_view.onRendered(function () {
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

    let self = this;

    self.autorun(() => {
        // Automatically decrypt data when they change
        // Autorun is used to detect changes on the Account

        const data = Template.currentData() || {};

        if (!data.secure)
            return;

        const enckey = localSession.get("enckey");
        if (enckey == null) {
            self.processing.set("Waiting for encryption key");
            return;
        }

        // Reset encryption status
        this.processing.set("Account decryption in progress...");

        try {
            let decrypted = CryptoJS.AES.decrypt(data.secure, enckey).toString(CryptoJS.enc.Utf8);
            decrypted = EJSON.parse(decrypted);

            this.accountData.set(decrypted);
            this.decryptionError.set(null);
            this.processing.set(null);
        } catch (err) {
            this.decryptionError.set(mf("account_view.error_decrypt", "An error occured"));
            this.processing.set(null);
        }
    });
});

Template.account_view.helpers({
    accountData: function () {
        return Template.instance().accountData.get();
    },
    isProcessing: function () {
        return Template.instance().processing.get() != null;
    },
    hasErrors: function () {
        return Template.instance().decryptionError.get() != null;
    },
    processing: function () {
        return Template.instance().processing.get();
    }
});

Template.account_view.events({
    'click .js-remove': function (evt) {
        evt.preventDefault();
        var self = this;
        bootbox.confirm(mf("accounts_view.confirm_deletion", "Do you really want to delete this account ?"), function (result) {
            if (result == true) {
                if (self.trashed) {
                    KeyAccounts.remove({_id: self._id});
                    Router.go("accounts");
                } else {
                    KeyAccounts.update({_id: self._id}, {$set: {trashed: true}}, function (err, res) {
                        if (err) {
                            sAlert.error(mf("account_view.error_remove", "An error occured"));
                            return;
                        }
                        sAlert.success(mf("accounts_view.deleted", "Account deleted."));
                        Router.go("accounts");
                    });
                }
            }
        });
    },
    'click .js-back': function (evt) {
        evt.preventDefault();
        // Back button always go to the Accounts page.
        Router.go("accounts");
    }
});

Template.account_view.onDestroyed(function () {
    if (clipboard) {
        clipboard.destroy();
    }
});
