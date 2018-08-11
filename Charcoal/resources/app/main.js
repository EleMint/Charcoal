const {app, BrowserWindow, Menu, icpMain} = require('electron');

let loginWindow;
let registerWindow;
let indexWindow;


app.on('ready', createLoginWindow);

function createLoginWindow(){
    loginWindow = new BrowserWindow({width: 800, height: 600});
    const menu = Menu.buildFromTemplate(loginMenuTemplate);
    Menu.setApplicationMenu(menu);
    loginWindow.loadFile('login.html');

    loginWindow.on('closed', function(){
        loginWindow = null;
    })
}
const loginMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Something',
                click(){
                    // Goto: Login Page
                }
            },
            {
                label: 'Close',
                click(){
                    // Goto: Register Page
                }
            },
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
    indexWindow = new BrowserWindow({width: 800, height: 600});
    const menu = Menu.buildFromTemplate(indexMenuTemplate);
    Menu.setApplicationMenu(menu);
    indexWindow.loadFile('index.html');

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
icpMain.on('user:login', function(e, userName, password){
    // Firebase check login
    // if in database => redirect to index
    // else redirect to login
    indexWindow.webContents.send('user:loggedIn', user_json);
});
