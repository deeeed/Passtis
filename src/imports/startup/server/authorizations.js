import KeyAccounts  from '/imports/api/model/KeyAccounts.model.js';

KeyAccounts.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return (userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    },
    fetch: ['owner']
});

Meteor.users.allow({
    insert: function (userId, doc) {
        return false;
    },
    update: function (userId, doc, fields, modifier) {
        // Only allow user to update himself.
        if (userId != doc._id) {
            return false;
        }
        return true;
    },
    remove: function (userId, doc) {
        return false;
    }
});
