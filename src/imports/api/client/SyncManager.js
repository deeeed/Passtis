/*
client-only class used to manage offline collection synchronization.
 */

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

import KeyAccounts from '/imports/api/model/KeyAccounts.model.js';

/**
 * Synchronization Manager class
 *
 * It allows to share the state of the synchronization for the app
 * - Are the publications ready ?
 *  "userData" + "accounts.private"
 * - After the publications are ready, have they been grounded ?
 *
 */
class SyncManager {
    constructor() {
        this.userDataReady = new ReactiveVar(false);
        this.keyAccountsReady = new ReactiveVar(false);
        this.started = false;
        this.offlineUser = new Ground.Collection("users");
        this.offlineKeyAccounts = new Ground.Collection("accounts");
        this.sub_accounts = null;
        this.sub_users = null;

        // Observe remote changes on subscription
        this.offlineKeyAccounts.observeSource(KeyAccounts.find());
        this.offlineUser.observeSource(Meteor.users.find());

        console.info("Creating new SyncManager instance");
    }

    start() {
        if(this.started) {
            console.error("[SyncManager] already started");
            return;
        }

        this.started = true;

        // Begin global subscriptions, keep everything in cache.
        this.sub_accounts = Meteor.subscribe("accounts.private", () => {
            // Caching all subscriptions data.
            const cursor = KeyAccounts.find();
            this.offlineKeyAccounts.keep(cursor);
        });
        this.sub_users = Meteor.subscribe("userData", () => {
            // Caching all subscription data.
            const cursor = Meteor.users.find();
            this.offlineUser.keep(cursor);
        });

        /**
         * Uses ground:db event to detect when the database is available instead of just subscription ready.
         * If it was using subscription handler onReady, it would never get change state when the app is offline.
         */
        this.offlineKeyAccounts.on("loaded", () => {
            const cursor = this.offlineKeyAccounts.find();
            console.info("KeyAccounts collection grounded to/from browser cache.",cursor.count());
            this.keyAccountsReady.set(true);
            // Overwrite collection finds using the grounded data
            KeyAccounts.find = (...args) => {
                return this.offlineKeyAccounts.find(...args);
            };
            KeyAccounts.findOne = (...args) => {
                return this.offlineKeyAccounts.findOne(...args);
            };
        });

        this.offlineUser.on("loaded", () => {
            console.info("Meteor.users collection grounded to/from browser cache");
            // should put grounded data to the meteor.users collection
            this.userDataReady.set(true);
            // Overwrite collection finds using the grounded data
            Meteor.users.find = (...args) => {
                return this.offlineUser.find(...args);
            };
            Meteor.users.findOne = (...args) => {
                return this.offlineUser.findOne(...args);
            };
        });
    }

    /**
     * Reset synchronization.
     *
     * - Stop all subscriptions
     * - Cleanup ground:db cache
     * - reset started flag
     * 
     */
    reset() {
        if(!this.started)
            return;

        // Stop subscriptions
        this.sub_accounts.stop();
        this.sub_users.stop();
        // Clear offline cache
        this.offlineKeyAccounts.clear();
        this.offlineUser.clear();
        // Reset started flag
        this.started = false;
    }

    /**
     * Reactively check if the application is ready to be used.
     * It is ready if:
     * - either grounded collections have loaded. (Offline)
     * - or the subscriptions are connected and loaded. (Online)
     *
     * @returns true when the application is ready to be used. False otherwise.
     */
    isReady() {
        const user = Meteor.user() || {};
        const config = user.config || null;
        //FIXME temporarily disable, possible bug here
        // const offlineReady = this.offlineKeyAccounts.find().count()>0 && config!=null;
        const offlineReady = false;
        const onlineReady =this.userDataReady.get() && this.keyAccountsReady.get()
        return offlineReady || onlineReady;
    };
}

// Only export one instance of the manager
const manager = new SyncManager();
if(Meteor.isDevelopment) {
    window.manager = manager;
}


export default manager;