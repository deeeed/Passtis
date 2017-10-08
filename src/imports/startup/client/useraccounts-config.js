import {AccountsTemplates} from 'meteor/useraccounts:core';
import {TAPi18n} from 'meteor/tap:i18n';
import {syncManager} from "../../api/client/SyncManager";
import {localSession} from "../../api/client/LocalSession";

AccountsTemplates.configure({
    showForgotPasswordLink: true,
    defaultLayout: 'AuthLayout',
    onLogoutHook: () => {
        // Reset synchronization
        syncManager.reset();
        // Reset encryption key
        localSession.set("enckey", false, true);
    }
});

/**
 * Auto start offline synchronization upon successful login.
 */
Accounts.onLogin(() => {
    // start sync manager to allow offline usage
    syncManager.start();
});

