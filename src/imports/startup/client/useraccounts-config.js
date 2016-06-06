import { AccountsTemplates } from 'meteor/useraccounts:core';
import { TAPi18n } from 'meteor/tap:i18n';


AccountsTemplates.configure({
    showForgotPasswordLink: true,
    defaultLayout: 'AuthLayout',
    onLogoutHook: () => {
        // Router.go("atSignIn");
    }
});


