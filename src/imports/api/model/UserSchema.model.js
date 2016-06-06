
UserSchema = {};

UserSchema.Config = new SimpleSchema({
    /**
     * User specific salt used for creating encryption key.
     * Generated randomly during user creation
     */
    salt: {
        type: String,
        optional: false,
        denyUpdate: false
    },
    /**
     * SHA2 hash of the passphrase
     */
    passphrase: {
        type: String,
        optional: true
    },
    pincode: {
        type: String,
        optional: true
    }
});

UserSchema.User = new SimpleSchema({
    username: {
        type: String,
        label: "Username",
        regEx: /^[a-z0-9A-Z_]{3,15}$/,
        optional: true
    },
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean,
        defaultValue: false
    },
    config: {
        type: UserSchema.Config,
        optional: false
    },
    profile: {
        type: UserSchema.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();
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

Meteor.users.attachSchema(UserSchema.User, {replace: true});