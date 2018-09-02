const { ipcRenderer } = require('electron');
var loggedInUser;
var userWorkplace;
var userRole;
var database;
var auth;

Login();

// Login //////////////////////////////////////////////////
///////////////////////////////////////////////////////////
function Login() {
    var email = document.getElementById('loginEmailField');
    var username = document.getElementById('loginUsernameField');
    var password = document.getElementById('loginPasswordField');
    var workplace = document.getElementById('loginWorkplaceField');
    var loginBtn = document.getElementById('loginBtn');
    var registerBtn = document.getElementById('registerBtn');
    var loginNogoText = document.getElementById('loginNogoText');


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

    // TODO: REMOVE DATABASE SEEDING
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
                .then(async function (result) {
                    loggedInUser = result.user.uid;
                    userWorkplace = workplace.value;
                    userRole = await FindUserRole();
                    RedirectFromLogin();
                    clearLoginForm();
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
                    changePage();
                    clearLoginForm();
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
        loginNogoText.hidden = false;
    }

    function RedirectFromLogin(){
        console.log(userRole);
        if(userRole == 'owner'){
            Redirect('ownerhomepage');
        } else if(userRole == 'manager'){
            Redirect('managerhomepage');
        } else {
            Redirect('messaging');
        }
    }

    async function FindUserRole() {
        var newUserRole;
        var ownerref = database.ref('Workplaces/' + workplace.value + '/Owner/Account');
        var ownersnapshot = await ownerref.once('value', function (data) { });
        var owner = ownersnapshot.val();
        if (loggedInUser == owner.Uid) {
            newUserRole = 'owner';
        } else {
            var managersref = database.ref('Workplaces/' + workplace.value + '/Managers');
            var managerssnapshot = await managersref.once('value', function (data) { });
            var managers = managerssnapshot.val();
            for (var manager in managers) {
                if (managers[manager].Account.Uid == loggedInUser) {
                    newUserRole = 'manager';
                } else {
                    newUserRole = 'employee';
                }
            }
        }
        console.log(newUserRole);
        return newUserRole;
    }
}
// Owner Home Page ////////////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerHomePage() {
    document.title = "Home Page test";
    var usernameBoxUsername = document.getElementById('usernameBoxUsername');
    var signOutBtn = document.getElementById('signout');
    var ownerviewmanagers = document.getElementById('ownerviewmanagershomepage');
    var owneraddmanager = document.getElementById('owneraddmanagerhomepage');
    var ownerviewemployees = document.getElementById('ownerviewemployeeshomepage');
    var owneraddemployee = document.getElementById('owneraddemployeehomepage');
    var ownerviewmessages = document.getElementById('ownerviewmessageshomepage');
    var ownergototmessenger = document.getElementById('ownergotomessengerhomepage');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerviewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    owneraddmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    ownerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    owneraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraddemployee');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Owner Create Manager ///////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerCreateManager() {
    document.title = "Add Manager";
    var usernameBoxUsername = document.getElementById('usernameBoxUsername');
    var signOutBtn = document.getElementById('signout');
    var ownerviewmanagers = document.getElementById('ownerviewmanagerscreatemanager');
    var ownerviewemployees = document.getElementById('ownerviewemployeescreatemanager');
    var owneraddemployee = document.getElementById('owneraddemployeecreatemanager');
    var ownerviewmessages = document.getElementById('ownerviewmessagescreatemanager');
    var ownergototmessenger = document.getElementById('ownergotomessengercreatemanager');
    var createManagerBtn = document.getElementById('createmanagercreatemanager');
    var emailField = documnt.getElementById('createmanageremailcreatemanager');
    var passwordField = document.getElementById('createmanagerpasswordcreatemanager');
    var usernameField = document.getElementById('createmanagerusernamecreatemanager');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerviewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    ownerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    owneraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraddemployee');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });

    createManagerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        auth.createUserWithEmailAndPassword(emailField.value, passwordField.value)
            .then(function (result) {
                // TODO: Do Something With The Username and Workplace
                Redirect('ownerviewmanagers');
            })
            .catch(function (err) {
                if (err != null) {
                    // TODO: NOGO create text
                    // TODO: Clear Fields
                }
            });
    });
}

// Owner View Managers ////////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerViewManagers() {
    document.title = "Managers";
    var usernameBoxUsername = document.getElementById('usernameBoxUsername');
    var signOutBtn = document.getElementById('signout');
    var owneraddmanager = document.getElementById('owneraddmanager');
    var ownerviewemployees = document.getElementById('ownerviewemployees');
    var owneraddemployee = document.getElementById('owneraddemployee');
    var ownerviewmessages = document.getElementById('ownerviewmessages');
    var ownergototmessenger = document.getElementById('ownergotomessenger');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    owneraddmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    ownerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    owneraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraddemployee');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });

    // TODO: SHOW MANAGERS
}

// Owner Create Employee //////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerCreateEmployee() {
    document.title = "Add Employee";
    var usernameBoxUsername = document.getElementById('usernameBoxUsername');
    var signOutBtn = document.getElementById('signout');
    var ownerviewmanagers = document.getElementById('ownerviewmanagers');
    var owneraddmanager = document.getElementById('owneraddmanager');
    var ownerviewemployees = document.getElementById('ownerviewemployees');
    var ownerviewmessages = document.getElementById('ownerviewmessages');
    var ownergototmessenger = document.getElementById('ownergotomessenger');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerviewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    owneraddmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    ownerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Owner View Employees //////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerViewEmployees() {
    document.title = "Employees";
    var usernameBoxUsername = document.getElementById('usernameBoxUsername');
    var signOutBtn = document.getElementById('signout');
    var ownerviewmanagers = document.getElementById('ownerviewmanagers');
    var owneraddmanager = document.getElementById('owneraddmanager');
    var owneraddemployee = document.getElementById('owneraddemployee');
    var ownerviewmessages = document.getElementById('ownerviewmessages');
    var ownergototmessenger = document.getElementById('ownergotomessenger');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerviewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    owneraddmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    owneraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraddemployee');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });

    // TODO: SHOW EMPLOYEES
}

// Owner Account Information //////////////////////////////
///////////////////////////////////////////////////////////
function OwnerAccountInformation() {
    document.title = "Account Information";
    var signOutBtn = document.getElementById('signout');
    var ownerviewmanagers = document.getElementById('ownerviewmanagers');
    var owneraddmanager = document.getElementById('owneraddmanager');
    var ownerviewemployees = document.getElementById('ownerviewemployees');
    var owneraddemployee = document.getElementById('owneraddemployee');
    var ownerviewmessages = document.getElementById('ownerviewmessages');
    var ownergototmessenger = document.getElementById('ownergotomessenger');

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerviewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    owneraddmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    ownerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    owneraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraddemployee');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Owner View Messages ////////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerViewMessages() {
    document.title = "Home Page";
    var usernameBoxUsername = document.getElementById('usernameBoxUsername');
    var signOutBtn = document.getElementById('signout');
    var ownerviewmanagers = document.getElementById('ownerviewmanagers');
    var owneraddmanager = document.getElementById('owneraddmanager');
    var ownerviewemployees = document.getElementById('ownerviewemployees');
    var owneraddemployee = document.getElementById('owneraddemployee');
    var ownerviewmessages = document.getElementById('ownerviewmessages');
    var ownergototmessenger = document.getElementById('ownergotomessenger');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerviewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    owneraddmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    ownerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    owneraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraddemployee');
    });

    ownerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmessages');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Manager Home Page //////////////////////////////////////
///////////////////////////////////////////////////////////
function ManagerHomePage() {

}

// Manager Create Employee ////////////////////////////////
///////////////////////////////////////////////////////////
function ManagerCreateEmployee() {

}

// Manager View Employees /////////////////////////////////
///////////////////////////////////////////////////////////
function ManagerViewEmployees() {

}

// Manager View Messages //////////////////////////////////
///////////////////////////////////////////////////////////
function ManagerViewMessages() {

}

// Manager Account Information ////////////////////////////
///////////////////////////////////////////////////////////
function ManagerAccountInformation() {

}

// Employee Account Information ///////////////////////////
///////////////////////////////////////////////////////////
function EmployeeAccountInformation() {

}

// Messaging //////////////////////////////////////////////
///////////////////////////////////////////////////////////
function Messaging() {
    var message = document.getElementById('message');
    var chat = document.getElementById('chat');
    var sendMessage = document.getElementById('sendMessage');
    var users = document.getElementById('users');
    var groups = document.getElementById('groups');
    var addGroup = document.getElementById('addGroup');
    var groupName = document.getElementById('newGroupText');
    var groupMemberText = document.getElementById('newGroupMembers');
    var currentGroupName = username.value;

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

}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
function Redirect(pageName) {
    HideAllDivs();
    switch (pageName) {
        case 'login':
            ShowDiv('login');
            Login();
            break;
        case 'ownerhomepage':
            ShowDiv('ownerhomepage');
            OwnerHomePage();
            break;
        case 'owneraccountinformation':
            ShowDiv('owneraccountinformation');
            OwnerAccountInformation();
            break;
        case 'ownercreatemanager':
            ShowDiv('ownercreatemanager')
            OwnerCreateManager();
            break;
        case 'ownerviewmanagers':
            ShowDiv('ownerviewmanagers');
            OwnerViewManagers();
            break;
        case 'ownercreateemployee':
            ShowDiv('ownercreateemployee');
            OwnerCreateEmployee();
            break;
        case 'ownerviewemployees':
            ShowDiv('ownerviewemployees');
            OwnerViewEmployees();
            break;
        case 'ownerviewmessages':
            ShowDiv('ownerviewmessages');
            OwnerViewMessages();
            break;
        case 'managerhomepage':
            ShowDiv('managerhomepage');
            ManagerHomePage();
            break;
        case 'manageraccountinformation':
            ShowDiv('manageraccountinformation');
            ManagerAccountInformation();
            break;
        case 'managercreateemployee':
            ShowDiv('managercreateemployee');
            ManagerCreateEmployee();
            break;
        case 'managerviewemployees':
            ShowDiv('managerviewemployees');
            ManagerViewEmployees();
            break;
        case 'managerviewmessages':
            ShowDiv('managerviewmessages');
            ManagerViewMessages();
            break;
        case 'employeeaccountinformation':
            ShowDiv('employeeaccountinformation');
            EmployeeAccountInformation();
            break;
        case 'messaging':
            ShowDiv('messaging');
            Messaging();
            break;
        default:
            break;
    }
}

function SignOut() {
    auth.signOut().then(function (result) {
        Redirect('login');
    }).catch(function (err) {
        if (err != null) {
            console.log(err);
        }
    });
}

function HideAllDivs() {
    document.getElementById('login').hidden = true;
    document.getElementById('ownerhomepage').hidden = true;
    document.getElementById('ownercreatemanager').hidden = true;
    document.getElementById('ownerviewmanagers').hidden = true;
    document.getElementById('ownercreateemployee').hidden = true;
    document.getElementById('ownerviewemployees').hidden = true;
    document.getElementById('owneraccountinformation').hidden = true;
    document.getElementById('ownerviewmessages').hidden = true;
    document.getElementById('manageraccountinformation').hidden = true;
    document.getElementById('managercreateemployee').hidden = true;
    document.getElementById('managerviewemployees').hidden = true;
    document.getElementById('managerhomepage').hidden = true;
    document.getElementById('employeeaccountinformation').hidden = true;
    document.getElementById('messaging').hidden = true;
}

function ShowDiv(divName) {
    switch (divName) {
        case 'login':
            document.getElementById('login').hidden = false;
            break;
        case 'ownerhomepage':
            document.getElementById('ownerhomepage').hidden = false;
            break;
        case 'owneraccountinformation':
            document.getElementById('owneraccountinformation').hidden = false;
            break;
        case 'ownercreatemanager':
            document.getElementById('ownercreatemanager').hidden = false;
            break;
        case 'ownerviewmanagers':
            document.getElementById('ownerviewmanagers').hidden = false;
            break;
        case 'ownercreateemployee':
            document.getElementById('ownercreateemployee').hidden = false;
            break;
        case 'ownerviewemployees':
            document.getElementById('ownerviewemployees').hidden = false;
            break;
        case 'ownerviewmessages':
            document.getElementById('ownerviewmessages').hidden = false;
            break;
        case 'managerhomepage':
            document.getElementById('managerhomepage').hidden = false;
            break;
        case 'manageraccountinformation':
            document.getElementById('manageraccountinformation').hidden = false;
            break;
        case 'managercreateemployee':
            document.getElementById('managercreateemployee').hidden = false;
            break;
        case 'managerviewemployees':
            document.getElementById('managerviewemployees').hidden = false;
            break;
        case 'managerviewmessages':
            document.getElementById('managerviewmessages').hidden = false;
            break;
        case 'employeeaccountinformation':
            document.getElementById('employeeaccountinformation').hidden = false;
            break;
        case 'messaging':
            document.getElementById('messaging').hidden = false;
            break;
        default:
            break;
    }
}