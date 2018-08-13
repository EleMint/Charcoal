const {app, BrowserWindow, Menu, icpMain} = require('electron');
const socket = io.connect('http://localhost:3000');

let loginWindow;
let registerWindow;
let indexWindow;

{/* <script src="https://www.gstatic.com/firebasejs/5.3.1/firebase.js"></script>
  // Initialize Firebase
  var config = {
    apiKey: FirebaseAPIKey,
    authDomain: FirebaseAuthDomain,
    databaseURL: FirebaseURL,
    projectId: FirebaseProjectId,
    storageBucket: FirebaseStoragebucket,
    messagingSenderId: FirebaseMessagingSenderId
  };
  firebase.initializeApp(config); */}

app.on('ready', createLoginWindow);

function createLoginWindow(){
    loginWindow = new BrowserWindow({width: 800, height: 600, icon: 'assets/carbon.png'});
    const menu = Menu.buildFromTemplate(loginMenuTemplate);
    Menu.setApplicationMenu(menu);
    loginWindow.loadFile('html/login.html');

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

function createRegisterWindow(){
    registerWindow = new BrowserWindow({width: 800, height: 600, icon: 'assets/carbon.png'});
    const menu = Menu.buildFromTemplate(registerMenuTemplate);
    Menu.setApplicationMenu(menu);
    registerWindow.loadFile('html/register.html');

    registerWindow.on('closed', function(){
        registerWindow = null;
    });
}

const registerMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Login',
                click(){
                    registerWindow.close();
                    createLoginWindow();
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
                    registerWindow.close();
                    createIndexWindow();
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

function createIndexWindow(){
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


// Login Modal Username and Password
// icpMain.on('user:login', function(e, userName, password){
//     // Firebase check login
//     // if in database => redirect to index
//     // else redirect to login
//     // indexWindow.webContents.send('user:loggedIn', user_json);
// });
