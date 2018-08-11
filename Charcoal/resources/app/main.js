const {app, BrowserWindow, Menu} = require('electron');

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
                label: 'Login',
                click(){
                    // Goto: Login Page
                }
            },
            {
                label: 'Register',
                click(){
                    // Goto: Register Page
                }
            },
        ]
    },
    {
        label: 'Edit'
    }
];

function createRegisterWindow(){
    registerWindow = new BrowserWindow({width: 800, height: 600});
    const menu = Menu.buildFromTemplate(registerMenuTemplate);
    Menu.setApplicationMenu(menu);
    registerWindow.loadFile('register.html');

    registerWindow.on('closed', function(){
        registerWindow = null;
    })
}
const registerMenuTemplate = [

];
const indexMenuTemplate = [
    {
        label: 'File'
    }
];


if(process.platform == 'darwin'){
    loginMenuTemplate.unshift({});
    registerMenuTemplate.unshift({});
    indexMenuTemplate.unshift({});
}
