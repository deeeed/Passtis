import KeyAccounts  from '/imports/api/model/KeyAccounts.model.js';
import log from '/imports/util/loggers.js';

Meteor.publish("keyAccounts", function () {
  var cursor = KeyAccounts.find({owner: this.userId});
  var count = cursor.count();
  log.info("Publishing cursor for "+this.userId+" -> "+count);
  return cursor;
});

FilterCollections.publish(KeyAccounts, {
  name: "filtered_accounts",
  callbacks: {
    beforePublish: function(query, pub) {
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
        "emails":1,
        "profile":1,
        "username":1,
        "config":1
      }
    });
  } else {
    this.ready();
  }
});
