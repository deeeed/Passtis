import './top_navbar.html';
import {ClientScope} from "../../api/client/ClientScope";

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
    }
});
