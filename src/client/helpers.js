Template.registerHelper('countries', function() {
  return CountryList;
});

Template.registerHelper('countryByCode', function(ccode) {
  return countryByCode(ccode);
});

Template.registerHelper('ostatus', function() {
  var status = EJSON.stringify(Meteor.status());
  //console.debug("Status is ",Meteor.status());
  return status;
});

Template.registerHelper('isOnline', function() {
  return isOnline();
});


Template.registerHelper('spinner', function(msg) {
  return Tracker.nonreactive(function() {
    return Spacebars.SafeString(getSpinner(msg));
  });
});

Template.registerHelper("formatDate", function (date, format) {
  var format = _.isString(format) ? format : "L";
  // Reactivaly watch for a change in the locale
  msgfmt.locale();
  //console.debug("formatDate...",date,format);
  if(!_.isDate(date)) {
    return "";
  }

  var formated = moment(date).format(format);
  return formated;
});

getSpinner = function(msg) {
  var spinner = '<div style="display:inline-block" class="sk-spinner sk-spinner-fading-circle"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>';
  if(msg != undefined) {
    spinner = "<div class=''>"
      + "<div style='display:inline-block' class='sk-spinner sk-spinner-fading-circle'><div class='sk-circle1 sk-circle'></div><div class='sk-circle2 sk-circle'></div><div class='sk-circle3 sk-circle'></div><div class='sk-circle4 sk-circle'></div><div class='sk-circle5 sk-circle'></div><div class='sk-circle6 sk-circle'></div><div class='sk-circle7 sk-circle'></div><div class='sk-circle8 sk-circle'></div><div class='sk-circle9 sk-circle'></div><div class='sk-circle10 sk-circle'></div><div class='sk-circle11 sk-circle'></div><div class='sk-circle12 sk-circle'></div></div>"
      + "<div style='display:inline-block; padding-left:10px;'>" + msg+"</div></div>";
  }

  return spinner;
}

countryByCode = function(ccode) {
  var info = CountryMapper[ccode];
  if(info)
    return info.name;

  return "";
}

animate = function (node, effect) {
  node = $(node);
  node.addClass('animated '+effect);
  window.setTimeout(function() {
    node.removeClass(effect)
  }, 1000);
}

/**
 * Vertically center Bootstrap 3 modals so they aren't always stuck at the top
 */
modalReposition = function() {
  var modal = $(this),
    dialog = modal.find('.modal-dialog');
  modal.css('display', 'block');

  // Dividing by two centers the modal exactly, but dividing by three
  // or four works better for larger screens.
  dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
}

isOnline = function() {
  return Meteor.status().connected;
}