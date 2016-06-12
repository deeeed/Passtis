import { Meteor } from 'meteor/meteor';

/*
 * This class is named KeyAccounts instead of Accounts to avoid confusion
 * with the Metoer Accounts classes.
 *
 */
const KeyAccounts = new Meteor.Collection("accounts");

let AccountSchema = {};

AccountSchema.Account = new SimpleSchema({
    owner: {
        type: String,
        index: true,
        autoValue: function () {
            return this.userId;
        }
    },
    name: {
        type: String,
        index: true
    },
    /**
     * AES-encrypted string containing the information about the account
     * It can be any number of fields, description, username, passwords.
     *
     * The encryption is done using a generated key from the user passphrase.
     */
    secure: {
        type: String,
        optional: true
    },
    trashed: {
        type: Boolean,
        index: true,
        defaultValue: false
    },
    starred: {
        type: Boolean,
        index: true,
        defaultValue: false
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    }
});

KeyAccounts.attachSchema(AccountSchema.Account, {replace: true});

if (Meteor.isDevelopment && Meteor.isClient) {
    window.KeyAccounts = KeyAccounts;
}

export default KeyAccounts;
