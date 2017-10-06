import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Spacebars } from 'meteor/spacebars';
import { EJSON } from 'meteor/ejson';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

/**
 * Stringify the current Meteor status
 */
Template.registerHelper('ostatus', function() {
  const status = EJSON.stringify(Meteor.status());
  return status;
});

/**
 * Shortcut to Meteor connection status.
 */
Template.registerHelper('isOnline', function() {
  return isOnline();
});


/**
 * Non reative helper to display a loading message prefixed by a spinner.
 */
Template.registerHelper('spinner', function(msg) {
  return Tracker.nonreactive(function() {
    return Spacebars.SafeString(getSpinner(msg));
  });
});

/**
 * Date formatting using momentjs.
 * @see http://momentjs.com/docs/
 *
 * Default format is 'L': Month numeral, day of month, year
 */
Template.registerHelper("formatDate", function (date, format) {
  format = _.isString(format) ? format : "L";
  // Reactivaly watch for a change in the locale
  msgfmt.locale();
  if(!_.isDate(date)) {
    return "";
  }

  let formatted = moment(date).format(format);
  return formatted;
});

/**
 * Spinkit spinner messages http://tobiasahlin.com/spinkit/
 *
 * @param msg to add
 * @returns {string} HTML safestring of the message prefixed by a spinner.
 */
const getSpinner = function(msg) {
  let spinner = '<div style="display:inline-block" class="sk-spinner sk-spinner-fading-circle"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>';
  if(msg != undefined) {
    spinner = "<div class=''>"
      + "<div style='display:inline-block' class='sk-spinner sk-spinner-fading-circle'><div class='sk-circle1 sk-circle'></div><div class='sk-circle2 sk-circle'></div><div class='sk-circle3 sk-circle'></div><div class='sk-circle4 sk-circle'></div><div class='sk-circle5 sk-circle'></div><div class='sk-circle6 sk-circle'></div><div class='sk-circle7 sk-circle'></div><div class='sk-circle8 sk-circle'></div><div class='sk-circle9 sk-circle'></div><div class='sk-circle10 sk-circle'></div><div class='sk-circle11 sk-circle'></div><div class='sk-circle12 sk-circle'></div></div>"
      + "<div style='display:inline-block; padding-left:10px;'>" + msg+"</div></div>";
  }

  return spinner;
}

/**
 * Vertically center Bootstrap 3 modals so they aren't always stuck at the top
 */
const modalReposition = function() {
  const dialog = $('.modal-dialog');

  // Dividing by two centers the modal exactly, but dividing by three
  // or four works better for larger screens.
  dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 3));
}

/**
 * Shortcut to Meteor connection status.
 *
 * @returns {boolean} DDP connection status.
 */
const isOnline = function() {
    let status = Meteor.status();
    let online = status.connected;
    if(!online) {
        if(Meteor.isCordova) {
            // Show offline only after 2nd connection attempt to avoid
            // disconnection message when app looses focus
            online = status.retryCount < 2;
        }
    }

    return online;
}

/**
 * Check if the DDP connection is connecting
 *
 * @return {boolean}
 */
const isConnecting = function() {
    return Meteor.status().status === "connecting";
}

export {modalReposition, isOnline, isConnecting, getSpinner};
