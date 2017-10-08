import './accounts.html';

import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Template} from 'meteor/templating';

import isMobile from 'meteor/mycode:ismobile';

import {localSession} from "../../../api/client/LocalSession";

import {SyncManager} from "../../../api/client/SyncManager";
import {KeyAccounts} from "../../../api/model/KeyAccounts.model";

// loading and filterConfig could be placed inside the Template scope
// and be automatically remove from memory on Template destruction.
const loading = new ReactiveVar(false);
const filterConfig = {
    name: 'filtered_accounts',
    offline: true,
    template: 'accounts',
    sort: {
        order: ['asc', 'desc'],
        defaults: ['name', 'asc']
    },
    pager: {
        itemsPerPage: isMobile.any ? 5 : 20,
        showPages: 3
    },
    filters: {
        "name": {
            condition: '$and',
            operator: ['$regex', 'i'],
            searchable: 'required'
        },
        "trashed": {
            condition: '$and',
            operator: ['$ne'],
            value: false,
            searchable: false,
            transform: function (value) {
                return "true" == value;
            }
        },
        "starred": {
            condition: '$and',
            operator: ['$eq'],
            searchable: false,
            transform: function (value) {
                return "true" == value;
            }
        }
    },
    callbacks: {
        /*
         * Here beforeSubscribe and afterSubscribe have to both check for the 'trashed' item,
         * because the FilterCollection will use 'beforeSubscribe' when using the online mode
         * and 'beforeResults' to filter out the query in offline mode.
         */
        beforeSubscribe: function (query) {
            if (!query.selector["$and"]) {
                // Make sure it default to trashed=false
                query.selector["$and"] = [{
                    "trashed": {
                        "$ne": true
                    }
                }];
            }

            loading.set(true);
            console.debug("query is ", query);
            return query;
        },
        afterSubscribe: function (query) {
            loading.set(false);
        },
        beforeResults: function (query) {
            // console.debug("before query selector",query.selector);
            if (!query.selector["$and"]) {
                // Make sure it default to trashed=false
                query.selector["$and"] = [{
                    "trashed": {
                        "$ne": true
                    }
                }];
                query.selector["$and"].push({"owner": Meteor.userId()});
            } else {
                query.selector["$and"].push({"owner": Meteor.userId()});
                //var t = _.find(query.selector["$and"],function(chr) {
                //    return _.isObject(chr.trashed);
                //});
            }
            // console.debug("after query selector",query.selector);
            return query;
        }
    }
};

// ######################################################################

Template.accounts.onCreated(function () {
    let collection = KeyAccounts;
    // if(Meteor.isCordova) {
    //     collection = SyncManager.getAccountsCollection();
    // // } else {
    // //     filterConfig = Object.assign(filterConfig, {"offline": false});
    // }

    Filter = new FilterCollections(collection, filterConfig);
    Filter.ready();
});

Template.accounts.onRendered(function () {
    var tpl = this;
    if (!(Meteor.isCordova || isMobile.any)) {
        // It feels very strange to have the auto focus on the search box for mobile,
        // which is why it is limited to desktop.
        tpl.autorun(() => {
            var focus = localSession.get("focus");
            if ("visible" == focus) {
                var box = tpl.$('#search-box');
                // Timing issue, needs a delay for rendering to allow focus.
                setTimeout(() => {
                    box.focus().select();
                }, 200);
            }
        });
    }
});

Template.accounts.helpers({
    loading: function () {
        return loading.get();
    },
    isActive: function (filter) {
        return Filter.filter.isActive(filter, "false", "$ne");
    },
    isActiveFilter: function (filter) {
        var active = Filter.filter.isActive(filter, "false", "$ne");
        return active ? "btn-success" : "";
    },
    starredCount: function () {
        return KeyAccounts.find({starred: true}).count();
    },
    trashCount: function () {
        return KeyAccounts.find({trashed: true}).count();
    }
});

Template.accounts.events({
    'click .btn-star': function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var toggle_starred = !this.starred;
        KeyAccounts.update({_id: this._id}, {$set: {starred: toggle_starred}}, function (err, result) {
            if (err) {
                sAlert.error("An error occured -> " + err);
            }
        });
    },
    'click .fc-filter': function (evt, tpl) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        var field = evt.currentTarget.getAttribute('data-fc-filter-field');
        var active = Filter.filter.isActive(field, "false", "$ne");
        var filter = {
            value: "false",
            operator: ["$ne"]
        };
        //console.debug(field,active,filter);
        if (active) {
            Filter.filter.clear(field, true);
        } else {
            Filter.filter.set(field, filter, true);
        }
    },
    'click .js-submit': (evt, tpl) => {
        evt.preventDefault();
        // Trick to put the submit button outside autoform and use a flexbox layout.
        tpl.find("#editAccountForm").submit();
    },
    'click .account': function (evt) {
        evt.preventDefault();
        Router.go("account_view", this);
    },
    'click .account-name': function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        Router.go("account_view", this);
    }
});
