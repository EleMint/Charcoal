const { ipcRenderer } = require('electron');
var loggedInUser;
var database;
var auth;

// Login //////////////////////////////////////////////////
///////////////////////////////////////////////////////////
var email = document.getElementById('emailInput');
var username = document.getElementById('usernameInput');
var password = document.getElementById('passwordInput');
var workplace = document.getElementById('workplaceInput');
var loginBtn = document.getElementById('loginBtn');
var registerBtn = document.getElementById('registerBtn');
var nogoText = document.getElementById('nogoText');

// Initialize Firebase
ipcRenderer.send('request:APIKeys');
ipcRenderer.on('requested:APIKeys', function(event, keys){
    var config = {
        apiKey: keys.FirebaseAPIKey,
        authDomain: keys.FirebaseAuthDomain,
        databaseURL: keys.FirebaseURL,
        projectId: keys.FirebaseProjectId,
        storageBucket: keys.FirebaseStoragebucket,
        messagingSenderId: keys.FirebaseMessagingSenderId
    };
    firebase.initializeApp(config);
    database = firebase.database();
    auth = firebase.auth();
});

// Database Seeding
var seed = document.getElementById('seed');
seed.addEventListener('click', function(e){
    e.preventDefault();
    var data = {
        Workplaces: {
            dCC: {
                Users: {
                    admin: {
                        Uid: 'bnSrtEyDtHW1z7fxaQy1sMvPCQr2',
                        Username: 'admin',
                        Groups: {},
                        Messages: {}
                    },
                    dylan: {
                        Uid: 'Xu1XZALsoNRO4LYP71vSOYrSev82',
                        Username: 'dylan',
                        Groups: ['test'],
                        Messages: ['timestamp']
                    }
                },
                Messages: {
                    timestamp: {
                        messageBody: 'test message',
                        messageFrom: 'dylan',
                        messageTo: 'Group:test'
                    }
                },
                Groups: {
                    test: ['dylan', 'admin']
                }
            }
        }       
    };
    database.ref().set(data);
});



// Login
loginBtn.addEventListener('click', function(e){
    e.preventDefault();
    if(email.value != '' && username.value != '' && password.value != '' && workplace.value != ''){
        auth.signInWithEmailAndPassword(email.value, password.value)
        .then(function(result){
            loggedInUser = result.user.uid;
            changePage();
            clearLoginForm();
        })
        .catch(function(err){
            if(err != null){
                clearLoginForm();
                nogo();
            }
        });
    } else {
        clearLoginForm();
        nogo();
    }
});

// Register
registerBtn.addEventListener('click', function(e){
    e.preventDefault();
    if(email.value != '' && username.value != '' && password.value != '' && workplace.value != ''){
        auth.createUserWithEmailAndPassword(email.value, password.value)
        .then(function(result){
            loggedInUser = result.user.uid;
            changePage();
            clearLoginForm();
        })
        .catch(function(err){
            if(err != null){
                clearLoginForm();
                nogo();
            }
        });
    } else {
        clearLoginForm();
        nogo();
    }
});

function clearLoginForm(){
    email.value = "";
    username.value = "";
    password.value = "";
    workplace.value = "";
}

function nogo(){
    nogoText.hidden = false;
}

function changePage(){
    var loginDiv = document.getElementById('login');
    var messagingDiv = document.getElementById('messaging');
    if(loginDiv.hidden === true){
        loginDiv.hidden = false;
        messagingDiv.hidden = true;
    } else {
        loginDiv.hidden = true;
        messagingDiv.hidden = false;
    }
}

// Messaging //////////////////////////////////////////////
///////////////////////////////////////////////////////////
var message = document.getElementById('message');
var chat = document.getElementById('chat');
var sendMessage = document.getElementById('sendMessage');
var users = document.getElementById('users');
var groups = document.getElementById('groups');
var addGroup = document.getElementById('addGroup');
var groupName = document.getElementById('newGroupText');
var groupMemberText = document.getElementById('newGroupMembers');


// On Login
ipcRenderer.send('users:getallusers', loggedInUser);
ipcRenderer.on('users:allusers', function(allUsers){
    for(var user of allUsers){
        appendUser(user);
    }
});

ipcRenderer.send('groups:getallgroups', loggedInUser);
ipcRenderer.on('groups:allgroups', function(allGroups){
    for(var group of allGroups){
        appendGroup(group);
    }
});

ipcRenderer.send('messages:getallmessages', loggedInUser);
ipcRenderer.on('messages:allmessages', function(allMessages){
    for(var message of allMessages){
        appendMessage(message);
    }
});

// On User Connection and Disconnection
ipcRenderer.on('user:userconnected', function(username){
    appendUser(username);
});

ipcRenderer.on('user:userdisconnected', function(username){
    // TODO: Delete User From Page
});

// New Group
ipcRenderer.on('group:newgroup' + loggedInUser, function(newGroupName){
    appendGroup(newGroupName);
})

addGroup.addEventListener('click', function(e){
    e.preventDefault();
    findUsers(groupMemberText);
    ipcRenderer.send('group:newgroupadded', groupName, groupMembers);
    groupName.value = "";
});

// Send Message
sendMessage.addEventListener('click', function(e){
    e.preventDefault();
    // TODO: Figure Out To Whom
    ipcRenderer.send('message:fromuser', message.value, loggedInUser);
    message.value = "";
});

// Incoming Message
ipcRenderer.on('message:send', function(message, fromUser, fromGroup){
    // TODO: Figure Out
});

// Append Users, Messages, Groups
function appendUser(username){
    var userDiv = document.createElement('div');
    var text = document.createTextNode(username);
    userDiv.appendChild(text);
    users.appendChild(userDiv);
}

function appendMessage(message){
    var messageDiv = document.createElement('div');
    var text = document.createTextNode(message);
    messageDiv.appendChild(text);
    chat.appendChild(messageDiv);
}

function appendGroup(groupName){
    var groupDiv = document.createElement('div');
    var text = document.createTextNode(groupName);
    groupDiv.appendChild(text);
    groups.appendChild(groupDiv);
}

ipcRenderer.on('logout', function(){
    auth.signOut()
    .then(function(){
        signOutProcedure();
    })
    .catch(function(err){
        if(err != null){
            console.log(err);
        }
    });
});

function signOutProcedure(){
    loggedInUser = null;
    changePage();
}

function findUsers(usernames){


}