var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;
var keys;

ipcRenderer.send('request:keys');
ipcRenderer.on('requested:keys', function(e, requestedKeys){
    keys = requestedKeys;
});


var signUpBtn = document.getElementById('regModalSubmit');
var signInBtn = document.getElementById('logModalSubmit');

// Register
signUpBtn.addEventListener('click', function(){
    var email = document.getElementById('regEmail').value;
    var password = document.getElementById('regPassword').value;
    var workplace = document.getElementById('regWorkplace').value;

    ipcRenderer.send('register:emailpasswork', email, passwod, workplace);
});

// Login
signInBtn.addEventListener('click', function(){
    var email = document.getElementById('logEmail').value;
    var password = document.getElementById('logPassword').value;
    var workplace = document.getElementById('logWorkplace').value;
    
    ipcRenderer.send('login:emailpasswork', email, password, workplace);
})