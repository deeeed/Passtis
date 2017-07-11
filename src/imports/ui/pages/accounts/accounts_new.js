import CryptoJS from 'crypto-js';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {ReactiveDict} from 'meteor/reactive-dict';

import KeyAccounts from '/imports/api/model/KeyAccounts.model.js';
import LocalSession from '/imports/api/client/LocalSession.js';
import AccountForm from '/imports/ui/forms/AccountForms.js';
import '/imports/ui/components/secureInput/secureInput.js';
import './accounts_new.html';

const processing = new ReactiveVar(null);

Template.account_new.events({
    'click .js-back': function (evt) {
        evt.preventDefault();
        history.back();
    },
    'click .js-submit': function (evt, tpl) {
        evt.preventDefault();
        tpl.$("#newAccountForm").submit();
    }
});

Template.account_new.helpers({
    schema: function () {
        return AccountForm;
    },
    isProcessing: function () {
        return processing.get() != null;
    },
    processing: function () {
        return processing.get();
    }
});

Template.account_new.onCreated(function () {
});

AutoForm.addHooks("newAccountForm", {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        this.event.stopPropagation();

        const form = this;

        // console.debug("Setting up account submit", insertDoc, self);
        processing.set(mf("accounts_new.encrypting", "Encrypting account data..."));

        const enckey = LocalSession.get("enckey");

        // Users should be going through _.compact
        // Otherwise autoform sometime has blank values in the middle of the array
        var secure = EJSON.stringify({
            host: insertDoc.host,
            description: insertDoc.description,
            users: _.compact(insertDoc.users)
        });

        var encrypted = CryptoJS.AES.encrypt(secure, enckey).toString();
        processing.set(mf("accounts_new.saving", "Saving data in progress..."));

        let account = {
            name: insertDoc.name,
            secure: encrypted
        }
        KeyAccounts.insert(account, function (err, res) {
            form.done(err, res);
            processing.set(null);
        });
    },
    onError: function (formType, error) {
        // console.debug("on error", formType, error);
        sAlert.error(mf('accounts_new.error', 'An error occured ...'));
    },
    onSuccess: function (type, newAccountId) {
        sAlert.success(mf('accounts_new.success', `New account has been created.`));
        // console.debug("new accounts created",type, newAccountId);
        Router.go("account_view", {_id: newAccountId});
    }
}, true /* Replace previous hook */);