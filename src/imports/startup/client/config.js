import {Meteor} from 'meteor/meteor';
import $ from 'jquery';
import {modalReposition} from '/imports/ui/helpers.js';


Meteor.startup(function () {

    sAlert.config({
        effect: '',
        position: 'bottom-right',
        timeout: 5000,
        html: false,
        onRouteClose: false,
        stack: {
            spacing: 10, // in px
            limit: 3 // when fourth alert appears all previous ones are cleared
        },
        offset: 10, // in px - will be added to first alert (bottom or top - depends of the position in config)
        beep: false,
        onClose: _.noop //
    });

    // Reposition modal to the center when the window is resized
    $(window).on('resize', (evt) => {
        // $('.modal:visible').each();
        modalReposition();
    });

});
