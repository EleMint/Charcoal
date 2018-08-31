const { ipcRenderer } = require('electron');
var loggedInUser;
var userWorkplace;
var userRole;
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
var roleRadios = document.getElementById('role').value;


// Initialize Firebase
ipcRenderer.send('request:APIKeys');
ipcRenderer.on('requested:APIKeys', function (event, keys) {
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
seed.addEventListener('click', function (e) {
    e.preventDefault();
    var data = {
        Workplaces: {
            dCC: {
                Owner: {
                    Account: {
                        Uid: 'f0febOyyUXg7cyrKa4d9J3qE2Hw1',
                        Username: 'owner',
                        Groups: [],
                        Messages: []
                    }
                },
                Managers: {
                    Manager1: {
                        Account: {
                            Uid: 'elSGaiVBX2WrbBGYJGmm46hzvBr1',
                            Username: 'manager1',
                            Channels: [],
                            Groups: [],
                            Messages: []

                        },
                        Users: {
                            admin: {
                                Uid: 'bnSrtEyDtHW1z7fxaQy1sMvPCQr2',
                                Username: 'admin',
                                Groups: ['test'],
                                Messages: []
                            },
                            dylan: {
                                Uid: 'Xu1XZALsoNRO4LYP71vSOYrSev82',
                                Username: 'dylan',
                                Groups: ['test'],
                                Messages: ['timestamp']
                            }
                        }
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
loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (email.value != '' && username.value != '' && password.value != '' && workplace.value != '') {
        auth.signInWithEmailAndPassword(email.value, password.value)
            .then(function (result) {
                loggedInUser = result.user.uid;
                userWorkplace = workplace.value;
                userRole = FindUserRole(loggedInUser);
                changePage();
                clearLoginForm();
                OnLogin();
            })
            .catch(function (err) {
                if (err != null) {
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
registerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (email.value != '' && username.value != '' && password.value != '' && workplace.value != '') {
        auth.createUserWithEmailAndPassword(email.value, password.value)
            .then(function (result) {
                loggedInUser = result.user.uid;
                userWorkplace = workplace.value;
                () => {
                    if (document.getElementById('owner').checked) {
                        userRole = 'owner';
                    } else if (document.getElementById('manager').checked) {
                        userRole = 'manager';
                    } else if (document.getElementById('employee').checked) {
                        userRole = 'employee';
                    }
                };
                if (userRole = 'owner') {
                    var workplacevalue = workplace.value;
                    var ref = database.ref('Workplaces/' + workplacevalue);
                    var data = {

                        Groups: [],
                        Managers: [],
                        Users: [],
                        Messages: [],
                        Owner: {
                            Account: {
                                Uid: loggedInUser,
                                Username: username.value
                            }
                        }

                    };
                    ref.set(data);
                }
                changePage();
                clearLoginForm();
                OnLogin();
            })
            .catch(function (err) {
                if (err != null) {
                    clearLoginForm();
                    nogo();
                }
            });
    } else {
        clearLoginForm();
        nogo();
    }
});

function clearLoginForm() {
    email.value = "";
    username.value = "";
    password.value = "";
    workplace.value = "";
}

function nogo() {
    nogoText.hidden = false;
}

function changePage() {
    var loginDiv = document.getElementById('login');
    var messagingDiv = document.getElementById('messaging');
    if (loginDiv.hidden === true) {
        loginDiv.hidden = false;
        messagingDiv.hidden = true;
    } else {
        loginDiv.hidden = true;
        messagingDiv.hidden = false;
    }
}

async function FindUserRole(uid) {
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
var currentGroupName = username.value;


// On Login
function OnLogin() {
    GetAllUsers();
    GetAllGroups();
    GetAllMessages();
    FindMessagesByGroupName(currentGroupName);
}

async function GetAllUsers() {
    var username = await FindUserNameByUID(userWorkplace);
    var ref = database.ref('Workplaces/' + userWorkplace + '/Users');
    var snapshot = await ref.once('value', function (data) { });
    var usersInWorkplace = snapshot.val();
    var foundUsers = [];
    for (var prop in usersInWorkplace) {
        if (prop != username) {
            foundUsers.push(prop);
        }
    }
    for (let i = 0; i < foundUsers.length; i++) {
        appendUser(foundUsers[i]);
    }
}

async function GetAllGroups() {
    var username = await FindUserNameByUID(userWorkplace);
    var ref = database.ref('Workplaces/' + userWorkplace + '/Users/' + username);
    var snapshot = await ref.once('value', function (data) { });
    var userObj = snapshot.val();
    if (userObj.Groups) {
        for (let i = 0; i < userObj.Groups.length; i++) {
            appendGroup(userObj.Groups[i]);
        }
    }
}

function GetAllMessages() {
    //var username = FindUserNameByUID();

}

// On User Connection and Disconnection
ipcRenderer.on('user:userconnected', function (username) {
    appendUser(username);
});

ipcRenderer.on('user:userdisconnected', function (username) {
    // TODO: Delete User From Page
});

// New Group
ipcRenderer.on('group:newgroup' + loggedInUser, function (newGroupName) {
    appendGroup(newGroupName);
})

addGroup.addEventListener('click', function (e) {
    e.preventDefault();
    ipcRenderer.send('group:newgroupadded', groupName, groupMembers);
    groupName.value = "";
});

// Send Message
sendMessage.addEventListener('click', function (e) {
    e.preventDefault();
    // TODO: Figure Out To Whom
    ipcRenderer.send('message:fromuser', message.value, loggedInUser);
    message.value = "";
});

// Incoming Message
ipcRenderer.on('message:send', function (message, fromUser, fromGroup) {
    // TODO: Figure Out
});

// Append Users, Messages, Groups
function appendUser(username) {
    var userDiv = document.createElement('div');
    var text = document.createTextNode(username);
    userDiv.appendChild(text);
    users.appendChild(userDiv);
}

function appendMessage(message) {
    console.log(message);
    chat.value = "";
    var messageDiv = document.createElement('div');
    var text = document.createTextNode(message.messageBody);
    messageDiv.appendChild(text);
    chat.appendChild(messageDiv);
}

function appendGroup(groupName) {
    var groupDiv = document.createElement('div');
    var text = document.createTextNode(groupName);
    groupDiv.appendChild(text);
    groups.appendChild(groupDiv);
    groupDiv.addEventListener('click', function (e) {
        currentGroupName = groupName;
        FindMessagesByGroupName(currentGroupName);
    });
}

ipcRenderer.on('logout', function () {
    auth.signOut()
        .then(function () {
            signOutProcedure();
        })
        .catch(function (err) {
            if (err != null) {
                console.log(err);
            }
        });
});

function signOutProcedure() {
    loggedInUser = null;
    userWorkplace = null;
    changePage();
}

async function FindMessagesByGroupName(groupName) {
    var ref = database.ref('Workplaces/' + userWorkplace + '/Messages');
    var snapshot = await ref.once('value', function (data) { });
    var messages = snapshot.val();

    for (var message in messages) {
        var compare = 'Group:' + groupName;
        if (messages[message].messageTo == compare) {
            appendMessage(messages[message]);
        }
    }
}

async function FindUserNameByUID(workplaceName) {
    var ref = database.ref('Workplaces/' + workplaceName + '/Managers');
    var foundUser;
    var snapshot = await ref.once('value', function (data) { });
    var managers = snapshot.val();
    for (var manager in managers) {
        var Users = managers[manager].Users;
        for (var user in Users) {
            console.log(username.value, user);
            if (username.value() == user) {
                foundUser = user;
            }
        }
    }
    console.log(foundUser);
    return foundUser;
}