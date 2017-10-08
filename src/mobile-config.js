/* globals App */
/* eslint-disable quote-props */

// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
    id: 'net.siteed.Passtis',
    name: 'Passtis',
    description: 'Simple Password Manager',
    author: 'Arthur Breton',
    email: 'abreton@siteed.net',
    website: 'https://www.passtis.pw',
    version: '0.2.4'
});

// Set up resources such as icons and launch screens.
App.icons({
    'android_mdpi': 'public/passtis-icon-mdpi.png',
    'android_hdpi': 'public/passtis-icon-hdpi.png',
    'android_xhdpi': 'public/passtis-icon-xhdpi.png'
});

App.launchScreens({
    'android_mdpi_portrait': 'public/passtis-splash.png',
    'android_mdpi_landscape': 'public/passtis-splash.png',
    'android_hdpi_portrait': 'public/passtis-splash.png',
    'android_hdpi_landscape': 'public/passtis-splash.png',
    'android_xhdpi_portrait': 'public/passtis-splash.png',
    'android_xhdpi_landscape': 'public/passtis-splash.png',
});

App.accessRule('*');

// Set PhoneGap/Cordova preferences
App.setPreference('BackgroundColor', '0x13c1d1');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');


// Configure cordova file plugin
App.configurePlugin('cordova-plugin-file', {
    iosPersistentFileLocation: 'Library',
});
