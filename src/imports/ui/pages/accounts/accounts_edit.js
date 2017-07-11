import CryptoJS from 'crypto-js';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {ReactiveDict} from 'meteor/reactive-dict';

import LocalSession from '/imports/api/client/LocalSession.js';
import AccountForm from '/imports/ui/forms/AccountForms.js';
import KeyAccounts from '/imports/api/model/KeyAccounts.model.js';
import './accounts_edit.html';
import '/imports/ui/components/secureInput/secureInput.js';

// Should the ReactiveVar be linked to the template?
// The problem if on template, they would not be available within the autoform hook.
const processing = new ReactiveVar(null);
const accountData = new ReactiveVar(null);

Template.account_edit.onCreated(function () {
    let self = this;

    self.autorun(() => {
        // Automatically decrypt data when they change
        // Needs to run within an autorun because there is a delay before the account
        // data are available.

        let data = Template.currentData() || {};
        console.debug("data is ", data);

        //TODO should use a data encryption/decryption manager class to make sure to always keep the same format.
        var secure = data.secure;
        if (!secure)
            return;

        const enckey = LocalSession.get("enckey");
        if (enckey == null) {
            processing.set(mf("accounts_edit.waiting", "Waiting for encryption key"));
            return;
        }

        // Reset encryption status
        processing.set(mf("accounts_edit.decrypting", "Account decryption in progress..."));

        var decrypted = CryptoJS.AES.decrypt(secure, enckey).toString(CryptoJS.enc.Utf8);
        decrypted = EJSON.parse(decrypted);

        data = _.extend(data, decrypted);
        accountData.set(data);
        processing.set(null);
    });
});

Template.account_edit.helpers({
    schema: function () {
        return AccountForm;
    },
    accountData: function () {
        return accountData.get();
    },
    isProcessing: function () {
        return processing.get() != null;
    },
    processing: function () {
        return processing.get();
    }
});

Template.account_edit.events({
    'click .js-back': function (evt, tpl) {
        evt.preventDefault();
        history.back();
    },
    'click .js-submit': function (evt, tpl) {
        evt.preventDefault();
        tpl.$("#editAccountForm").submit();
    }
});

AutoForm.addHooks("editAccountForm", {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        this.event.stopPropagation();

        const form = this;
        let data = currentDoc;

        if (!data._id) {
            form.done("No data available");
        }

        // console.debug("Setting up account submit", insertDoc, updateDoc, self);
        processing.set(mf("accounts_edit.encrypting", "Encrypting account data..."));

        const enckey = LocalSession.get("enckey");

        // Users should be going through _.compact
        // Otherwise autoform sometime has blank values in the middle of the array
        let secure = EJSON.stringify({
            host: insertDoc.host,
            description: insertDoc.description,
            users: _.compact(insertDoc.users)
        });

        // console.debug("encrypting now ", enckey, secure)
        let encrypted = CryptoJS.AES.encrypt(secure, enckey).toString();
        processing.set(mf("accounts_edit.saving", "Saving data in progress..."));

        let updateQuery = {
            $set: {
                name: insertDoc.name,
                secure: encrypted
            }
        }
        // console.debug("updating account with ", updateQuery)
        KeyAccounts.update({_id: data._id}, updateQuery, function (err, res) {
            form.done(err, data._id);
            processing.set(null);
        });
    },
    onError: function (formType, error) {
        // console.debug("on error", formType, error);
        sAlert.error(mf('accounts_edit.error', 'An error occured ...'));
    },
    onSuccess: function (formType, accountId) {
        // console.debug("edit success", formType,accountId);
        sAlert.success(mf('accounts_edit.success', `Account has been updated.`));
        Router.go("account_view", {_id: accountId});
    }
}, true /* Replace previous hook */);