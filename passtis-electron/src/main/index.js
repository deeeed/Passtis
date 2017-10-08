'use strict'

import {app, shell, BrowserWindow, Menu, remote, dialog, Tray} from 'electron'
import path from 'path';


const isDevelopment = process.env.NODE_ENV !== 'production'

if (!isDevelopment) {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Global reference to mainWindow
// Necessary to prevent win from being garbage collected
let mainWindow

const STATIC_PATH = __static + path.sep;
let iconFile = `${STATIC_PATH}passtis.png`;

let shouldQuit = app.makeSingleInstance(function (argv, workingDirectory) {
    console.log("Passtis is a single instance");
});

if (shouldQuit) {
    app.quit();
}

const menuTemplate = [
    {
        label: 'Passtis',
        role: 'help',
        submenu: [
            {
                label: 'About',
                click() {
                    shell.openExternal('http://www.passtis.pw')
                }
            },
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+w',
                click() {
                    mainWindow.hide();
                }
            },
            {
                label: 'Quit',
                accelerator: "CmdOrCtrl+Q",
                click() {
                    let choice = dialog.showMessageBox(mainWindow,
                        {
                            icon: iconFile,
                            type: 'question',
                            buttons: ['Yes', 'No'],
                            title: 'Confirm',
                            message: 'Are you sure you want to quit?'
                        });
                    if (choice == 0) {
                        app.exit(0);
                    }
                }
            }
        ]
    }
];
let menu = Menu.buildFromTemplate(menuTemplate)

const toggleVisibility = () => {
    if (mainWindow == null) {
        return;
    }

    if (!mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
    } else {
        mainWindow.hide();
    }
}


function createMainWindow() {
    console.log(`creating main window dirname=${__dirname}`);

    Menu.setApplicationMenu(menu);
    app.dock.setMenu(menu);
    app.dock.setIcon(iconFile);

    let appTray = new Tray(STATIC_PATH + 'icon.png');
    appTray.setToolTip('Passtis - A Simple Account Manager');


    appTray.on("click", (evt, bounds) => {
        evt.preventDefault();
        toggleVisibility();
    });

    appTray.on("right-click", (evt) => {
        // console.log("right clicked now");
        let menu = Menu.buildFromTemplate([{
            label: 'Quit',
            accelerator: "CmdOrCtrl+Q",
            click() {
                app.exit(0);

            }
        }])
        appTray.popUpContextMenu(menu)
    })

    // Construct new BrowserWindow
    const window = new BrowserWindow({
        width: 800,
        center: true,
        title: 'Passtis',
        height: 600,
        webPreferences: {
            preload: __static + '/preload.js',
            nodeIntegration: true
        }
    })

    let devUrl = 'http://localhost:3005';
    // devUrl = 'https://app.passtis.pw';
    const url = isDevelopment
        ? devUrl
        : `https://app.passtis.pw`

    console.log(`Loading url ${url}`);
    if (isDevelopment) {
        window.webContents.openDevTools()
    }

    window.loadURL(url)

    window.on('close', (evt) => {
        evt.preventDefault();
        window.hide();
    })

    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window
}

// Create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow()
})
