const electron = require('electron');
const io = require('socket.io-client');
const firebase = require('firebase');
const socket = io('http://127.0.0.1:3000');
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const app = electron.app;
var keys;
var auth;
var database;

let loginWindow;
let indexWindow;

app.on('ready', createLoginWindow);
app.on('window-all-closed', function(){
    app.quit();
});

// Init Firebase
socket.emit('request:keys');
socket.on('requested:keys', function(requestedKeys){
    keys = requestedKeys;
    firebase.initializeApp(keys);
    auth = firebase.auth();
    database = firebase.database();
});

// Create Windows and Menu Templates
function createLoginWindow(){
    loginWindow = new BrowserWindow({width: 800, height: 600, icon: 'assets/carbon.ico'});
    const menu = Menu.buildFromTemplate(loginMenuTemplate);
    Menu.setApplicationMenu(menu);
    loginWindow.loadFile('html/login.html');

    loginWindow.toggleDevTools();

    loginWindow.on('closed', function(){
        loginWindow = null;
    })
}
const loginMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Register',
                click(){
                    loginWindow.close();
                    createRegisterWindow();
                }
            },
            {
                label: 'Quit',
                accelerator: 'Ctrl+Q',
                click(){
                    app.quit();
                }
            },
            {
                label: 'Index Window',
                click(){
                    createIndexWindow();
                    loginWindow.close();
                }
            }
        ]
    },
    {
        label: 'Page',
        submenu: [
            {
                role: 'reload'
            }
        ]
    }
];

function createIndexWindow(result){
    indexWindow = new BrowserWindow({width: 800, height: 600, icon: 'assets/carbon.png'});
    const menu = Menu.buildFromTemplate(indexMenuTemplate);
    Menu.setApplicationMenu(menu);
    indexWindow.loadFile('html/index.html');

    indexWindow.on('closed', function(){
        indexWindow = null;
    });
}
const indexMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Preferences',
                click(){
                    // Goto: Preferences
                }
            }
        ]
    }
];

if(process.platform == 'darwin'){
    loginMenuTemplate.unshift({});
    registerMenuTemplate.unshift({});
    indexMenuTemplate.unshift({});
}

// New User Registration
ipcMain.on('register:emailpasswork', function(email, password, workplace){
    auth.createUserWithEmailAndPassword(email, password)
    .then(function(result){
        loginWindow.close();
        var ref = database.ref('users/' + result.user);
        var data = {
            email : email,
            workplace : workplace
        };
        ref.push(data);
        createIndexWindow(result);
    })
    .catch(function(err){
        if(err != null){
            console.log(err);
            return;
        }
    });
});

// User Login
ipcMain.on('login:emailpasswork', function(email, password, workplace){
    auth.signInWithEmailAndPassword(email, password)
    .then(function(result){
        console.log(result);
        loginWindow.close();
        createIndexWindow(result);
    })
    .catch(function(err){
        if(err != null){
            console.log(err);
            return;
        }
    });
});

// Message Sent From User To Server
ipcMain.on('message:fromuser', function(from, message, to){
    socket.emit('message:fromuser')
});

socket.on('message:send', function(message, sendTo){
    ipcMain.send('message:send', message, sendTo);
});