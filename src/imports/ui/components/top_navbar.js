import './top_navbar.html';
import ClientScope from '/imports/api/client/ClientScope.js';

Template.top_navbar.onRendered(function(){
});

Template.top_navbar.events({
    // Toggle left navigation
    'click .js-toggle-menu'(evt){
        evt.preventDefault();

        let slideout  = ClientScope.slideout;
        if(slideout) {
            slideout.toggle();
        }
    },

    'click .js-logout'(evt) {
        evt.preventDefault();
        Router.go("logout");
        // Display logging out template
        AccountsTemplates.logout();
    }
});
