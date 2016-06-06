import './AuthLayout.html';

Template.AuthLayout.events({
    "click .js-lang": (evt, tpl) => {
        evt.preventDefault();
        let locale = $(evt.target).data("locale");
        msgfmt.setLocale(locale);
    }
});
