import {Router, RouteController} from 'meteor/iron:router';
import {AccountsTemplates} from 'meteor/useraccounts:core';
import {Meteor} from 'meteor/meteor';

import {KeyAccounts} from "../../api/model/KeyAccounts.model";

import '../../ui/layouts/MasterLayout.js';
import '../../ui/layouts/AuthLayout.js';
import '../../ui/layouts/BlankLayout.js';
import '../../ui/pages/setup.js';
import '../../ui/pages/debug.js';
import '../../ui/pages/settings.js';
import '../../ui/pages/accounts/accounts.js';
import '../../ui/pages/accounts/accounts_view.js';
import '../../ui/pages/accounts/accounts_edit.js';
import '../../ui/pages/accounts/accounts_new.js';
import '../../ui/pages/logout.js';
import '../../ui/pages/loading.js';
import '../../ui/helpers.js';

/*
 * Create an iron-router plugin copy of ensureSignedIn disabling the 'onRun' function which would prevent
 * meteor from signing in when offline with ground:db.
 */
Iron.Router.plugins.isLogguedIn = function (router, options) {
    // Disable the 'router.onRun' function which prevents logging in on Cordova while offline.
    // This is because Meteor.loggingIn() is always at true on cordova offline with ground:db.
    // router.onRun(function(){
    //     if (Meteor.loggingIn()) {
    //         this.renderRegions();
    //     } else {
    //         this.next();
    //     }
    // }, options);

    router.onBeforeAction(
        function () {
            if (!Meteor.userId()) {
                Tracker.nonreactive(function () {
                    AccountsTemplates.setPrevPath(Router.current().url);
                });
                AccountsTemplates.setState(AccountsTemplates.options.defaultState, function () {
                    var err = AccountsTemplates.texts.errors.mustBeLoggedIn;
                    AccountsTemplates.state.form.set('error', [err]);
                });
                AccountsTemplates.avoidRedirect = true;
                // render the login template but keep the url in the browser the same

                var options = AccountsTemplates.routes.ensureSignedIn;

                // Determines the template to be rendered in case no specific one was configured for ensureSignedIn
                var signInRouteTemplate = AccountsTemplates.routes.signIn && AccountsTemplates.routes.signIn.template;
                var template = (options && options.template) || signInRouteTemplate || 'fullPageAtForm';

                // Determines the layout to be used in case no specific one was configured for ensureSignedIn
                var defaultLayout = AccountsTemplates.options.defaultLayout || Router.options.layoutTemplate;
                var layoutTemplate = (options && options.layoutTemplate) || defaultLayout;

                this.layout(layoutTemplate);
                this.render(template);
                this.renderRegions();
            } else {
                AccountsTemplates.clearError();
                this.next();
            }
        },
        options
    );

    router.onStop(function () {
        AccountsTemplates.clearError();
    });
};


/** Protect all Routes, ensureSignedIn plugin must run before
 * the onBeforeAction filters for Iron:Router */
Router.plugin('isLogguedIn', {
    except: _.pluck(AccountsTemplates.routes, 'name')
});


AppController = RouteController.extend({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'loading',
    waitOn: function () {
        // TODO re-enable after OAUTH integration
        //return [Meteor.subscribe("country")];
        return [];
    }
});

Router.route('/', {
    name: 'accounts',
    template: 'accounts',
    controller: 'AppController'
});

Router.route('/Debug', {
    name: 'debug',
    template: 'debug',
    controller: 'AppController'
});

Router.route('/account/new', {
    template: "account_new",
    name: 'account_new',
    controller: 'AppController'
});

Router.route('/account/:_id', {
    template: "account_view",
    name: 'account_view',
    controller: 'AppController',
    data: function () {
        const account = KeyAccounts.findOne(this.params._id);
        return account;
    }
});

Router.route('/account/:_id/edit', {
    template: "account_edit",
    name: 'account_edit',
    controller: 'AppController',
    data: function () {
        const account = KeyAccounts.findOne(this.params._id);
        return account;
    }
});

Router.route('/settings', {
    name: 'settings',
    template: "settings",
    controller: 'AppController'
});

Router.route('/logout', {
    name: 'logout',
    template: "logout"
});

/***********************************
 * Accounts Template configuration
 ***********************************/
AccountsTemplates.configureRoute('signIn', {
    redirect: '/'
});
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');

