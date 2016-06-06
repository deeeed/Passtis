msgfmt.init('en', {
    // Send translations for all languages or current language
    sendPolicy: "current",

    // Don't invalidate msgfmt.locale() until new language is fully loaded
    waitOnLoaded: true,
    // Automatically adjust <body dir="rtl"> according to the language used
    setBodyDir: true,

    // Save setLocale() in Meteor.user().locale, sync to multiple clients
    storeUserLocale: true,

    // Use client's localStorage to avoid reloading unchanged translations
    useLocalStorage: true, // unless sendCompiled: true,
    // Send translations to the client pre-compiled
    sendCompiled: false // unless browserPolicy disallowUnsafeEval is set
});

// All momentjs dates are also localized
moment().locale('en');

// Set the locale for the user accounts page
T9n.setLanguage("en");

if (Meteor.isClient) {
    console.log("Setting up i18n");

    /**
     * Automatically reflect change of language in the user accounts pages.
     */
    msgfmt.on('localeChange', function (locale) {
        // console.log("Changing local to ", locale);
        if (locale == "zh") {
            T9n.setLanguage("zh_CN");
        } else {
            T9n.setLanguage(locale);
        }
    });
}