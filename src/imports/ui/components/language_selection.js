import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

import './language_selection.html'

Template.language_selection.events({
    "click .js-lang"(evt, tpl) {
        evt.preventDefault();
        let locale = $(evt.target).data("locale");
        msgfmt.setLocale(locale);
    }
});
