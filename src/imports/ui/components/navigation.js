import './navigation.html';
import ClientScope from '/imports/api/client/ClientScope.js';


Template.navigation.events({
    "click .js-nav-menu": (evt, tpl) => {
        // Close slideout after a click on navigation menu
        if(ClientScope.slideout!=null) {
            ClientScope.slideout.close();
        }
    }
});