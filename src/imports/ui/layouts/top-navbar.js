import './top-navbar.html';
import ClientScope from '/imports/api/client/ClientScope.js';

Template.topNavbar.onRendered(function(){
});

Template.topNavbar.events({
    // Toggle left navigation
    'click .js-toggle-menu': function(evt){
        evt.preventDefault();

        let slideout  = ClientScope.slideout;
        if(slideout) {
            slideout.toggle();
        }
    },

    'click .js-logout': function(evt) {
        evt.preventDefault();
        // Display logging out template
        AccountsTemplates.logout();
    }
});
