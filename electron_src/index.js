const app = require('app');
const browser = require('browser-window');
const menubar = require('menubar');
const Tray = require('tray');
const Menu = require('menu');

//var mb = menubar({
//  index: './splash.html',
//})
//
//mb.on('ready', function ready () {
//  console.log('app is ready')
//  // your app code here
//});
//
var meteor_browser = null;
var appIcon = null;

var template = [
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.reload();
                }
            },
            {
                label: 'Toggle Full Screen',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Ctrl+Command+F';
                    else
                        return 'F11';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Alt+Command+I';
                    else
                        return 'Ctrl+Shift+I';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.toggleDevTools();
                }
            },
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close'
            },
        ]
    },
    {
        label: 'Help',
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: function () {
                    require('electron').shell.openExternal('http://electron.atom.io')
                }
            },
        ]
    },
];

if (process.platform == 'darwin') {
    var name = require('electron').app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Services',
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                label: 'Hide ' + name,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () {
                    app.exit(0);
                }
            },
        ]
    });
    // Window menu.
    template[3].submenu.push(
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    );
}

menu = Menu.buildFromTemplate(template);

var shouldQuit = app.makeSingleInstance(function (argv, workingDirectory) {
    console.log("Passtis is a single instance");
});

if (shouldQuit) {
    app.quit();
    return;
}

app.on('ready', function () {

    Menu.setApplicationMenu(menu);
    app.dock.setMenu(menu);

    appIcon = new Tray(__dirname + '/passtis.png');
    appIcon.setToolTip('Passtis - A Simple Account Manager');

    appIcon.on("click", function (event, bounds) {
        if(meteor_browser==null) {
            return;
        }

        if (!meteor_browser.isVisible()) {
            meteor_browser.show();
            meteor_browser.focus();
        } else {
            meteor_browser.hide();
        }
    });

    //creates a new electron window
    meteor_browser = new browser({
        width: 800,
        center: true,
        title: 'Passtis Simple Password Manager',
        height: 600,
        'node-integration': false // node integration must to be off
    });

    //  open up meteor root url
    meteor_browser.loadURL("https://keyeedapp.siteed.net");

    meteor_browser.on("close", function (evt) {
        evt.preventDefault();
        meteor_browser.hide();
    });
});


app.on('window-all-closed', function () {
    //This event is only emitted when the application is not going to quit.
    // If the user pressed Cmd + Q, or the developer called app.quit(),
    // Electron will first try to close all the windows and then emit the will-quit event,
    // and in this case the window-all-closed event would not be emitted.

    // app.quit();
});


app.on('will-quit', function terminate_and_quit(event) {

    // event.preventDefault();
    // console.log("cancel quitting");
    // return;

    console.log("app is about to quit 'will-quit' event");
    //     app.exit(-1);
});

