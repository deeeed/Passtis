import { AccountsTemplates } from 'meteor/useraccounts:core';
import { TAPi18n } from 'meteor/tap:i18n';
import SyncManager from '../../api/client/SyncManager.js';
import LocalSession from '../../api/client/LocalSession.js';

AccountsTemplates.configure({
    showForgotPasswordLink: true,
    defaultLayout: 'AuthLayout',
    onLogoutHook: () => {
        // Reset synchronization
        SyncManager.reset();
        // Reset encryption key
        LocalSession.set("enckey",null);
    }
});

/**
 * Auto start offline synchronization upon successful login.
 */
Accounts.onLogin(() => {
    // start sync manager to allow offline usage
    SyncManager.start();
});

