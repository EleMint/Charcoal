const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const io = require('socket.io-client');
const socket = io('http://127.0.0.1:3000');

let charcoalWindow;

app.on('ready', createCharcoalWindow);
app.on('window-all-closed', function(){
    ipcMain.emit('user:logout');
    app.quit();
});

function createCharcoalWindow(){
    charcoalWindow = new BrowserWindow({width: 800, height: 650});
    const menu = Menu.buildFromTemplate(charcoalMenuTemplate);
    Menu.setApplicationMenu(menu);
    charcoalWindow.loadFile('./index.html');

    charcoalWindow.on('closed', function(){
        charcoalWindow = null;
    });
}

const charcoalMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Logout',
                click(){
                    charcoalWindow.webContents.send('user:logout');
                }
            },
            {
                label: 'Quit',
                accelerator: 'Ctrl+Q',
                click(){
                    charcoalWindow.webContents.send('user:quit');
                    ipcMain.on('user:quited', function(e){
                        app.quit();
                    });
                }
            }
        ]
    },
    {
        label: 'Dev',
        submenu: [
            {
                label: 'Dev Tools',
                accelerator: 'Ctrl+D',
                click(){
                    charcoalWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    }
];

ipcMain.on('request:APIKeys', function(event){
    socket.emit('request:APIKeys');
    socket.on('requested:APIKeys', function(keys){
        event.sender.send('requested:APIKeys', keys);
    })
});

ipcMain.on('group:newGroup', function(event){
    socket.emit('group:newGroup');
});

socket.on('group:servernewGroup', function(){
    charcoal.webContents.send('group:servernewGroup');
});

socket.on('user:loggedin', function(event){
    charcoalWindow.webContents.send('user:loggedin');
});