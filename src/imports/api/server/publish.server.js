import {Meteor} from 'meteor/meteor';
import {KeyAccounts} from "../model/KeyAccounts.model";
import {logger as log} from "../../util/loggers";

Meteor.publish("accounts.private", function () {
    var cursor = KeyAccounts.find({owner: this.userId});
    var count = cursor.count();
    log.info("[accounts.private] publish " + this.userId + " -> " + count);
    return cursor;
});

FilterCollections.publish(KeyAccounts, {
    name: "accounts.filtered",
    callbacks: {
        beforePublish: function (query, pub) {
            //log.info(pub.userId, query.selector);
            query.selector["owner"] = pub.userId;
            return query;
        }
    }
});


Meteor.publish('userData', function () {
    log.info("userData publishing cursor", this.userId);
    if (this.userId) {
        return Meteor.users.find({_id: this.userId}, {
            fields: {
                "emails": 1,
                "profile": 1,
                "username": 1,
                "config": 1
            }
        });
    } else {
        this.ready();
    }
});

/**
 * Country publication to detect China users.
 * It can be used to disable oauth services like facebook/google, which are
 * not available from within China.
 */
Meteor.publish('country', function () {
    if (this.connection == null) {
        this.ready();
    }
    var clientIP = this.connection.clientAddress;
    //var clientIP = "195.154.72.242"; // siteed ip
    //var clientIP = "180.171.53.62"; // China ip
    var self = this;

    Meteor.call("countryByIP", clientIP, function (error, result) {
        if (error) {
            log.error("Error Adding countryByIp ", error);
            self.ready();
            return;
        }

        log.info(`Visit from ${clientIP} ${result.country}`);
        self.added("usercountry", "usercountry", result);
        self.ready();
    });
});