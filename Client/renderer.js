const { ipcRenderer } = require('electron');
var loggedInUser;
var loggedInUsername;
var loggedInEmail;
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

    var data = {
        "Workplaces": {
            "dCC": {
                "Groups": {
                    "test": [
                        "dylan",
                        "admin"
                    ]
                },
                "Managers": {
                    "manager": {
                        "Account": {
                            "Uid": "VwYDM0FH09hDSnQFbXeDLHiP0Dy1",
                            "Username": "manager",
                            "LoggedIn": {
                                "LoggedIn": false
                            }
                        },
                        "Users": {
                            "admin": {
                                "Groups": {
                                    "test": "test"
                                },
                                "Uid": "bnSrtEyDtHW1z7fxaQy1sMvPCQr2",
                                "Username": "admin",
                                "LoggedIn": {
                                    "LoggedIn": false
                                }
                            },
                            "dylan": {
                                "Groups": {
                                    "test": "test"
                                },
                                "Uid": "Xu1XZALsoNRO4LYP71vSOYrSev82",
                                "Username": "dylan",
                                "LoggedIn": {
                                    "LoggedIn": false
                                }
                            }
                        }
                    }
                },
                "Messages": {
                    "8:00pm": {
                        "messageBody": "test message",
                        "messageFrom": "dylan",
                        "messageTo": "Group:test",
                        "messageAt": "8:00pm"
                    },
                    "7:00pm": {
                        "messageBody": "test message",
                        "messageFrom": "dylan",
                        "messageTo": "Group:test",
                        "messageAt": "7:00pm"
                    },
                    "6:00pm": {
                        "messageBody": "test message",
                        "messageFrom": "dylan",
                        "messageTo": "Group:test",
                        "messageAt": "6:00pm"
                    },
                    "5:00pm": {
                        "messageBody": "test message",
                        "messageFrom": "dylan",
                        "messageTo": "Group:test",
                        "messageAt": "5:00pm"
                    }
                },
                "Owner": {
                    "Account": {
                        "LoggedIn": {
                            "LoggedIn": false
                        },
                        "Uid": "f0febOyyUXg7cyrKa4d9J3qE2Hw1",
                        "Username": "owner"
                    }
                }
            }
        }
    };

    var seed = document.getElementById('seed');
    seed.addEventListener('click', function (e) {
        e.preventDefault();
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
                    loggedInUsername = username.value;
                    loggedInEmail = email.value;
                    SetLoggedInStatus(true);
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
                    loggedInUsername = username.value;
                    database.ref('Workplaces/' + userWorkplace + '/Groups/' + loggedInUsername).set({ [loggedInUsername]: loggedInUsername });
                    SetLoggedInStatus(true);
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

    function RedirectFromLogin() {
        if (userRole == 'owner') {
            Redirect('ownerhomepage');
        } else if (userRole == 'manager') {
            Redirect('managerhomepage');
        } else {
            Redirect('employeeaccountinformation');
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
        return newUserRole;
    }
}

// Owner Workplace Menu ///////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerWorkplaceMenu() {
    document.title = "Workplace Menu";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownerworkplacemenu');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signoutBtn = document.getElementById('signoutownerworkplacemenu');
    var viewmanagers = document.getElementById('ownerviewmanagersworkplacemenu');
    var addmanager = document.getElementById('owneraddmanagerworkplacemenu');
    var viewemployees = document.getElementById('ownerviewemployeesworkplacemenu');
    var addemployee = document.getElementById('owneraddemployeeworkplacemenu');
    var gotomessenger = document.getElementById('ownergotomessengerworkplacemenu');
    var editBtn = document.getElementById('ownerworkplaceeditname');
    var deleteBtn = document.getElementById('ownerworkplacedelete');

    editBtn.addEventListener('click', function (e) {
        e.preventDefault();

    });

    deleteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('confirmation');
    });

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        SignOut();
    });

    viewmanagers.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewmanagers');
    });

    addmanager.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreatemanager');
    });

    viewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerviewemployees');
    });

    addemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownercreateemployee');
    });

    gotomessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging');
    });
}

// Confirmation ///////////////////////////////////////////
///////////////////////////////////////////////////////////
function Confirmation(){
    document.title = 'Confirmation';
    var deleteBtn = document.getElementById('confirmationDelete');
    var cancelBtn = document.getElementById('confirmationCancel');

    deleteBtn.addEventListener('click', function(e){
        e.preventDefault();
        database.ref('Workplaces/' + userWorkplace).set({});
        Redirect('login');
    });

    cancelBtn.addEventListener('click', function(e){
        e.preventDefault();
        Redirect('ownerworkplacemenu');
    });
}

// Owner Home Page ////////////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerHomePage() {
    document.title = "Home";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownerhomepage');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutownerhomepage');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenuhomepage');
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

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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
        Redirect('ownercreateemployee');
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
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownercreatemanager');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutownercreatemanager');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenucreatemanager');
    var ownerviewmanagers = document.getElementById('ownerviewmanagerscreatemanager');
    var ownerviewemployees = document.getElementById('ownerviewemployeescreatemanager');
    var owneraddemployee = document.getElementById('owneraddemployeecreatemanager');
    var ownerviewmessages = document.getElementById('ownerviewmessagescreatemanager');
    var ownergototmessenger = document.getElementById('ownergotomessengercreatemanager');
    var createManagerBtn = document.getElementById('ownercreatemanagerBtn');
    var emailField = document.getElementById('ownercreatemanageremail');
    var passwordField = document.getElementById('ownercreatemanagerpassword');
    var usernameField = document.getElementById('ownercreatemanagerusername');
    var NoGoText = document.getElementById('ownernewmanagerNogoText');

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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
        Redirect('ownercreateemployee');
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
                var newmanagerref = database.ref('Workplaces/' + userWorkplace + '/Managers/' + usernameField.value);
                var data = {
                    Account: {
                        Uid: result.user.uid,
                        Username: usernameField.value
                    },
                    Groups: {
                        [loggedInUsername]: loggedInUsername
                    },
                    Users: {

                    }
                };
                newmanagerref.set(data);
                NoGoText.hidden = true;
                Redirect('ownerviewmanagers');
            })
            .catch(function (err) {
                if (err != null) {
                    NoGoText.hidden = false;
                    emailField.value = "";
                    passwordField.value = "";
                    usernameField.value = "";
                }
            });
    });
}

// Owner View Managers ////////////////////////////////////
///////////////////////////////////////////////////////////
async function OwnerViewManagers() {
    document.title = "Managers";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownerviewmanagers');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutownerviewmanagers');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenuviewmanagers');
    var owneraddmanager = document.getElementById('owneraddmanagerviewmanagers');
    var ownerviewemployees = document.getElementById('ownerviewemployeesviewmanagers');
    var owneraddemployee = document.getElementById('owneraddemployeeviewmanagers');
    var ownerviewmessages = document.getElementById('ownerviewmessagesviewmanagers');
    var ownergototmessenger = document.getElementById('ownergotomessengerviewmanagers');
    var greaterDiv = document.getElementById('ownerviewmanagersgreaterdiv');
    var managerNameText = document.getElementById('ownerviewmanagersdivmanagername');
    var deleteTextDiv = document.getElementById('ownerviewmanagersdivdeletetext');

    managerNameText.parentNode.removeChild(managerNameText);
    var managerNameText = document.createElement('div');
    managerNameText.setAttribute('id', 'ownerviewmanagersdivmanagername');
    managerNameText.setAttribute('class', 'col-md-6');

    deleteTextDiv.parentNode.removeChild(deleteTextDiv);
    var deleteTextDiv = document.createElement('div');
    deleteTextDiv.setAttribute('id', 'ownerviewmanagersdivdeletetext');
    deleteTextDiv.setAttribute('class', 'col-md-6');

    greaterDiv.appendChild(managerNameText);
    greaterDiv.appendChild(deleteTextDiv);

    var managersRef = database.ref('Workplaces/' + userWorkplace + '/Managers');
    var snapshot = await managersRef.once('value', function (data) { });
    var allmanagers = snapshot.val();
    for (var managerName in allmanagers) {

        var managerNameDiv = document.createElement('h5');
        var managerNameDivText = document.createTextNode(managerName);
        var managerDeleteDiv = document.createElement('h5');
        var managerDeleteDivText = document.createTextNode('Delete');

        managerNameDiv.appendChild(managerNameDivText);
        managerNameDiv.setAttribute('id', 'managername' + managerName + 'ownerviewmanagers');
        managerDeleteDiv.appendChild(managerDeleteDivText);
        managerDeleteDiv.setAttribute('id', 'deletemanager' + managerName + 'ownerviewmanagers');
        managerDeleteDiv.setAttribute('class', 'cursor');

        managerNameText.appendChild(managerNameDiv);
        deleteTextDiv.appendChild(managerDeleteDiv);

        AddEventListeners(managerName);
    }

    function AddEventListeners(managerName) {

        var element = document.getElementById('deletemanager' + managerName + 'ownerviewmanagers');
        element.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('managername' + managerName + 'ownerviewmanagers').hidden = true;
            element.hidden = true;
            database.ref('Workplaces/' + userWorkplace + '/Managers/' + managerName).set({});
        });
    }


    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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
        Redirect('ownercreateemployee');
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

// Owner Create Employee //////////////////////////////////
///////////////////////////////////////////////////////////
function OwnerCreateEmployee() {
    document.title = "Add Employee";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownercreateemployee');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutownercreateemployee');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenucreateemployee');
    var ownerviewmanagers = document.getElementById('ownerviewmanagerscreateemployee');
    var owneraddmanager = document.getElementById('owneraddmanagercreateemployee');
    var ownerviewemployees = document.getElementById('ownerviewemployeescreateemployee');
    var ownerviewmessages = document.getElementById('ownerviewmessagescreateemployee');
    var ownergototmessenger = document.getElementById('ownergotomessengercreateemployee');
    var emailField = document.getElementById('createemployeeemailownercreateemployee');
    var usernameField = document.getElementById('createemployeeusernameownercreateemployee');
    var passwordField = document.getElementById('createemployeepasswordownercreateemployee');
    var managerUsernameField = document.getElementById('createemployeemanagerownercreateemployee');
    var addemployeeBtn = document.getElementById('createemployeeownercreateemployee');
    var NOGOText = document.getElementById('ownernewemployeeNogoText');

    addemployeeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        auth.createUserWithEmailAndPassword(emailField.value, passwordField.value)
            .then(function (result) {
                var managerusername = managerUsernameField.value;
                var employeeusernam = usernameField.value;
                var newemployeeref = database.ref('Workplaces/' + userWorkplace + '/Managers/' + managerusername + '/Users/' + employeeusernam);
                var data = {
                    Groups: {
                        [loggedInUsername]: loggedInUsername
                    },
                    Messages: [],
                    Uid: result.user.uid,
                    Username: usernameField.value
                };
                newemployeeref.set(data);
                NOGOText.hidden = true;
                Redirect('ownerviewemployees');
            })
            .catch(function (err) {
                if (err != null) {
                    NOGOText.hidden = false;
                    emailField.value = "";
                    usernameField.value = "";
                    passwordField.value = "";
                    managerUsernameField.value = "";
                }
            });
    });

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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
async function OwnerViewEmployees() {
    document.title = "Employees";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownerviewemployees');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutownerviewemployees');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenuviewemployees');
    var ownerviewmanagers = document.getElementById('ownerviewmanagersviewemployees');
    var owneraddmanager = document.getElementById('owneraddmanagerviewemployees');
    var owneraddemployee = document.getElementById('owneraddemployeeviewemployees');
    var ownerviewmessages = document.getElementById('ownerviewmessagesviewemployees');
    var ownergototmessenger = document.getElementById('ownergotomessengerviewmessages');
    var greaterDiv = document.getElementById('ownerviewemployeesgreaterdiv');
    var employeeNameText = document.getElementById('ownerviewemployeesdivemployeename');
    var deleteTextDiv = document.getElementById('ownerviewemployeesdivdeletetext');

    employeeNameText.parentNode.removeChild(employeeNameText);
    var employeeNameText = document.createElement('div');
    employeeNameText.setAttribute('id', 'ownerviewemployeesdivemployeename');
    employeeNameText.setAttribute('class', 'col-md-6');

    deleteTextDiv.parentNode.removeChild(deleteTextDiv);
    var deleteTextDiv = document.createElement('div');
    deleteTextDiv.setAttribute('id', 'ownerviewemployeesdivdeletetext');
    deleteTextDiv.setAttribute('class', 'col-md-6');

    greaterDiv.appendChild(employeeNameText);
    greaterDiv.appendChild(deleteTextDiv);

    var managersRef = database.ref('Workplaces/' + userWorkplace + '/Managers');
    var snapshot = await managersRef.once('value', function (data) { });
    var allmanagers = snapshot.val();
    for (var managerName in allmanagers) {
        var users = allmanagers[managerName].Users;
        for (var userName in users) {
            var employeeNameh5 = document.createElement('h5');
            var employeeNameh5Text = document.createTextNode(userName);
            var employeeDeleteh5 = document.createElement('h5');
            var employeeDeleteh5Text = document.createTextNode('Delete');
            employeeNameh5.appendChild(employeeNameh5Text);
            employeeNameh5.setAttribute('id', 'employeename' + userName + 'ownerviewemployees');
            employeeDeleteh5.appendChild(employeeDeleteh5Text);
            employeeDeleteh5.setAttribute('id', 'deleteemployee' + userName + 'ownerviewemployees');
            employeeDeleteh5.setAttribute('class', 'cursor');
            employeeNameText.appendChild(employeeNameh5);
            deleteTextDiv.appendChild(employeeDeleteh5);
            AddEventListeners(managerName, userName);
        }
    }

    function AddEventListeners(managerName, userName) {
        var element = document.getElementById('deleteemployee' + userName + 'ownerviewemployees');
        element.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('employeename' + userName + 'ownerviewemployees').hidden = true;
            element.hidden = true;
            database.ref('Workplaces/' + userWorkplace + '/Managers/' + managerName + '/Users/' + userName).set({});
        });
    }

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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
        Redirect('ownercreateemployee');
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

// Owner Account Information //////////////////////////////
///////////////////////////////////////////////////////////
async function OwnerAccountInformation() {
    document.title = "Account";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameowneraccountinformation');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutowneraccountinformation');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenuaccountinformation');
    var ownerviewmanagers = document.getElementById('ownerviewmanagersaccountinformation');
    var owneraddmanager = document.getElementById('owneraddmanageraccountinformation');
    var ownerviewemployees = document.getElementById('ownerviewemployeesaccountinformation');
    var owneraddemployee = document.getElementById('owneraddemployeeaccountinformation');
    var ownerviewmessages = document.getElementById('ownerviewmessagesaccountinformation');
    var ownergototmessenger = document.getElementById('ownergotomessengeraccountinformation');
    var ownerinformationemailinner = document.getElementById('ownerinformationemailinner');
    ownerinformationemailinner.innerHTML = loggedInEmail;
    var ownerinformationusernameinner = document.getElementById('ownerinformationusernameinner');
    ownerinformationusernameinner.innerHTML = loggedInUsername;
    var ownerinformationworkplace = document.getElementById('ownerinformationworkplaceinner');
    ownerinformationworkplace.innerHTML = userWorkplace;
    var ownerinformationmanagers = document.getElementById('ownerinformationmanagers');
    var ownerinformationmanagersoutter = document.getElementById('ownerinformationmanagersoutter');

    ownerinformationmanagers.parentNode.removeChild(ownerinformationmanagers);
    ownerinformationmanagers = document.createElement('ul');
    ownerinformationmanagers.setAttribute('id', 'ownerinformationmanagers');
    ownerinformationmanagersoutter.appendChild(ownerinformationmanagers);

    var managersRef = database.ref('Workplaces/' + userWorkplace + '/Managers');
    var snapshot = await managersRef.once('value', function (data) { });
    var allmanagers = snapshot.val();
    for (var managerName in allmanagers) {
        var managerNameDiv = document.createElement('h5');
        var managerNameDivText = document.createTextNode(managerName);
        managerNameDiv.appendChild(managerNameDivText);
        managerNameDiv.setAttribute('id', 'managername' + managerName + 'ownerviewmanagers');
        ownerinformationmanagers.appendChild(managerNameDiv);
    }

    var ownerinformationemployees = document.getElementById('ownerinformationemployees');
    var ownerinformationemployeesoutter = document.getElementById('ownerinformationemployeesoutter');

    ownerinformationemployees.parentNode.removeChild(ownerinformationemployees);
    ownerinformationemployees = document.createElement('ul');
    ownerinformationemployees.setAttribute('id', 'ownerinformationemployees');
    ownerinformationemployeesoutter.appendChild(ownerinformationemployees);

    var managersRef = database.ref('Workplaces/' + userWorkplace + '/Managers');
    var snapshot = await managersRef.once('value', function (data) { });
    var allmanagers = snapshot.val();
    for (var managerName in allmanagers) {
        var users = allmanagers[managerName].Users;
        for (var userName in users) {
            var employeeNameh5 = document.createElement('h5');
            var employeeNameh5Text = document.createTextNode(userName);
            employeeNameh5.appendChild(employeeNameh5Text);
            employeeNameh5.setAttribute('id', 'employeename' + userName + 'ownerviewemployees');
            ownerinformationemployees.appendChild(employeeNameh5);
        }
    }

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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

    var notificationsOnBtn = document.getElementById('ownernotificationson');
    notificationsOnBtn.addEventListener('click', function(e){
        e.preventDefault();
        database.ref('Workplaces/' + userWorkplace + '/Owner/Account/Notifications').set({Notifications: 'ON'});
        notificationsOnBtn.disabled = 'disabled';
        notificationsOffBtn.disabled = false;
    });

    var notificationsOffBtn = document.getElementById('ownernotificationsoff');
    notificationsOffBtn.addEventListener('click', function(e){
        e.preventDefault();
        database.ref('Workplaces/' + userWorkplace + '/Owner/Account/Notifications').set({Notifications: 'OFF'});
        notificationsOnBtn.disabled = false;
        notificationsOffBtn.disabled = 'disabled';
    });
}

// Owner View Messages ////////////////////////////////////
///////////////////////////////////////////////////////////
async function OwnerViewMessages() {
    document.title = "View Messages";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameownerviewmessages');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutownerviewmessages');
    var ownerworkplacemenu = document.getElementById('ownerworkplacemenuviewmessages')
    var ownerviewmanagers = document.getElementById('ownerviewmanagersviewmessages');
    var owneraddmanager = document.getElementById('owneraddmanagerviewmessages');
    var ownerviewemployees = document.getElementById('ownerviewemployeesviewmessages');
    var owneraddemployee = document.getElementById('owneraddemployeeviewmessages');
    var ownergototmessenger = document.getElementById('ownergotomessengerviewmessages');

    var messagesDiv = document.getElementById('messagesownerviewmessages');

    var messagesRef = database.ref('Workplaces/' + userWorkplace + '/Messages');
    var messagesSnapshot = await messagesRef.once('value', function (data) { });
    var allMessages = messagesSnapshot.val();
    for (var message in allMessages) {
        var curMessage = allMessages[message];
        var messageBodyText = document.createTextNode(curMessage.messageBody);
        var messageFromText = document.createTextNode('From: ' + curMessage.messageFrom);
        var messageToText = document.createTextNode('   To: ' + curMessage.messageTo);
        var messageTimeText = document.createTextNode('   At: ' + curMessage.messageAt);

        var messageFromTextDiv = document.createElement('div');
        messageFromTextDiv.setAttribute('class', 'row');
        messageFromTextDiv.appendChild(messageFromText);
        var messageToTextDiv = document.createElement('div');
        messageToTextDiv.setAttribute('class', 'row');
        messageToTextDiv.appendChild(messageToText);
        var messageTimeTextDiv = document.createElement('div');
        messageTimeTextDiv.setAttribute('class', 'row');
        messageTimeTextDiv.appendChild(messageTimeText);

        var newMessageDiv = document.createElement('div');
        newMessageDiv.setAttribute('class', 'row');
        var newMessageBodyDiv = document.createElement('div');
        newMessageBodyDiv.setAttribute('class', 'col-md-7');
        var newMessageInfoDiv = document.createElement('div');
        newMessageInfoDiv.setAttribute('class', 'col-md-5');

        newMessageBodyDiv.appendChild(messageBodyText);
        newMessageInfoDiv.appendChild(messageFromText);
        newMessageInfoDiv.appendChild(messageToText);
        newMessageInfoDiv.appendChild(messageTimeText);
        newMessageDiv.appendChild(newMessageBodyDiv);
        newMessageDiv.appendChild(newMessageInfoDiv);
        messagesDiv.appendChild(newMessageDiv);
    }




    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('owneraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    ownerworkplacemenu.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('ownerworkplacemenu');
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
        Redirect('ownercreateemployee');
    });

    ownergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Manager Home Page //////////////////////////////////////
///////////////////////////////////////////////////////////
function ManagerHomePage() {
    document.title = "Home";
    var usernameDisplay = document.getElementById('usernameBoxUsernamemanagerhomepage');
    usernameDisplay.innerHTML = loggedInUsername;
    var signoutBtn = document.getElementById('signoutmanagerhomepage');
    var managerviewemployees = document.getElementById('managerviewemployeeshomepage');
    var manageraddemployee = document.getElementById('manageraddemployeehomepage');
    var managerviewmessages = document.getElementById('managerviewmessageshomepage');
    var managergotomessenger = document.getElementById('managergotomessengerhomepage');

    usernameDisplay.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('manageraccountinformation');
    });

    signoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        SignOut();
    });

    managerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewemployees');
    });

    manageraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managercreateemployee');
    });

    managerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewmessages');
    });

    managergotomessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging');
    });
}

// Manager Create Employee ////////////////////////////////
///////////////////////////////////////////////////////////
function ManagerCreateEmployee() {
    document.title = "Add Employee";
    var usernameDisplay = document.getElementById('usernameBoxUsernamemanagercreateemployee');
    usernameDisplay.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutmanagercreateemployee');
    var managerviewemployees = document.getElementById('managerviewemployeescreateemployee');
    var managerviewmessages = document.getElementById('managerviewmessagescreateemployee');
    var managergotomessenger = document.getElementById('managergotomessengercreateemployee');
    var emailField = document.getElementById('createemployeeemailmanagercreateemployee');
    var usernameField = document.getElementById('createemployeeusernamemanagercreateemployee');
    var passwordField = document.getElementById('createemployeepasswordmanagercreateemployee');
    var addemployeeBtn = document.getElementById('createemployeemanagercreateemployee');
    var NOGOText = document.getElementById('managernewemployeeNogoText');

    addemployeeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        auth.createUserWithEmailAndPassword(emailField.value, passwordField.value)
            .then(function (result) {
                var newemployeeref = database.ref('Workplaces/' + userWorkplace + '/Managers/' + loggedInUsername + '/Users/' + usernameField.value);
                var data = {
                    Groups: {
                        [loggedInUsername]: loggedInUsername
                    },
                    Messages: [],
                    Uid: result.user.uid,
                    Username: usernameField.value
                };
                newemployeeref.set(data);
                NOGOText.hidden = true;
                Redirect('managerviewemployees');
            })
            .catch(function (err) {
                if (err != null) {
                    NOGOText.hidden = false;
                    emailField.value = "";
                    passwordField.value = "";
                    usernameField.value = "";
                }
            });
    });

    signOutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        SignOut();
    });

    managerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewemployees');
    });

    managerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewmessages');
    });

    managergotomessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging');
    });
}

// Manager View Employees /////////////////////////////////
///////////////////////////////////////////////////////////
async function ManagerViewEmployees() {
    document.title = "Employees";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernamemanagerviewemployees');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutmanagerviewemployees');
    var manageraddemployee = document.getElementById('manageraddemployeeviewemployees');
    var managerviewmessages = document.getElementById('managerviewmessagesviewemployees');
    var managergototmessenger = document.getElementById('managergotomessengerviewemployees');
    var greaterDiv = document.getElementById('managerviewemployeesgreaterdiv');
    var employeeNameText = document.getElementById('managerviewemployeesdivemployeename');
    var deleteTextDiv = document.getElementById('managerviewemployeesdivdeletetext');

    employeeNameText.parentNode.removeChild(employeeNameText);
    var employeeNameText = document.createElement('div');
    employeeNameText.setAttribute('id', 'managerviewemployeesdivemployeename');
    employeeNameText.setAttribute('class', 'col-md-6');

    deleteTextDiv.parentNode.removeChild(deleteTextDiv);
    var deleteTextDiv = document.createElement('div');
    deleteTextDiv.setAttribute('id', 'managerviewemployeesdivdeletetext');
    deleteTextDiv.setAttribute('class', 'col-md-6');

    greaterDiv.appendChild(employeeNameText);
    greaterDiv.appendChild(deleteTextDiv);

    var managerRef = database.ref('Workplaces/' + userWorkplace + '/Managers/' + loggedInUsername + '/Users');
    var snapshot = await managerRef.once('value', function (data) { });
    var allUsers = snapshot.val();
    for (var userName in allUsers) {
        var employeeNameh5 = document.createElement('h5');
        var employeeNameh5Text = document.createTextNode(userName);
        var employeeDeleteh5 = document.createElement('h5');
        var employeeDeleteh5Text = document.createTextNode('Delete');

        employeeNameh5.appendChild(employeeNameh5Text);
        employeeNameh5.setAttribute('id', 'employeename' + userName + 'managerviewemployees');
        employeeDeleteh5.appendChild(employeeDeleteh5Text);
        employeeDeleteh5.setAttribute('id', 'deleteemployee' + userName + 'managerviewemployees');
        employeeDeleteh5.setAttribute('class', 'cursor');

        employeeNameText.appendChild(employeeNameh5);
        deleteTextDiv.appendChild(employeeDeleteh5);

        AddEventListeners(userName);
    }

    function AddEventListeners(userName) {
        var element = document.getElementById('deleteemployee' + userName + 'managerviewemployees');
        element.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('employeename' + userName + 'managerviewemployees').hidden = true;
            element.hidden = true;
            database.ref('Workplaces/' + userWorkplace + '/Managers/' + loggedInUsername + '/Users/' + userName).set({});
        });
    }

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('manageraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    manageraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managercreateemployee');
    });

    managerviewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewmessages');
    });

    managergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Manager View Messages //////////////////////////////////
///////////////////////////////////////////////////////////
async function ManagerViewMessages() {
    document.title = "View Messages";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernamemanagerviewmessages');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutmanagerviewmessages');
    var managerviewemployees = document.getElementById('managerviewemployeesviewmessages');
    var manageraddemployee = document.getElementById('manageraddemployeeviewmessages');
    var managergototmessenger = document.getElementById('managergotomessengerviewmessages');

    var messagesDiv = document.getElementById('messagesmanagerviewmessages');

    var messagesRef = database.ref('Workplaces/' + userWorkplace + '/Messages');
    var messagesSnapshot = await messagesRef.once('value', function (data) { });
    var allMessages = messagesSnapshot.val();
    for (var message in allMessages) {
        var curMessage = allMessages[message];
        var messageBodyText = document.createTextNode(curMessage.messageBody);
        var messageFromText = document.createTextNode('From: ' + curMessage.messageFrom);
        var messageToText = document.createTextNode('   To: ' + curMessage.messageTo);
        var messageTimeText = document.createTextNode('   At: ' + curMessage.messageAt);

        var messageFromTextDiv = document.createElement('div');
        messageFromTextDiv.setAttribute('class', 'row');
        messageFromTextDiv.appendChild(messageFromText);
        var messageToTextDiv = document.createElement('div');
        messageToTextDiv.setAttribute('class', 'row');
        messageToTextDiv.appendChild(messageToText);
        var messageTimeTextDiv = document.createElement('div');
        messageTimeTextDiv.setAttribute('class', 'row');
        messageTimeTextDiv.appendChild(messageTimeText);

        var newMessageDiv = document.createElement('div');
        newMessageDiv.setAttribute('class', 'row');
        var newMessageBodyDiv = document.createElement('div');
        newMessageBodyDiv.setAttribute('class', 'col-md-7');
        var newMessageInfoDiv = document.createElement('div');
        newMessageInfoDiv.setAttribute('class', 'col-md-5');

        newMessageBodyDiv.appendChild(messageBodyText);
        newMessageInfoDiv.appendChild(messageFromText);
        newMessageInfoDiv.appendChild(messageToText);
        newMessageInfoDiv.appendChild(messageTimeText);
        newMessageDiv.appendChild(newMessageBodyDiv);
        newMessageDiv.appendChild(newMessageInfoDiv);
        messagesDiv.appendChild(newMessageDiv);
    }

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('manageraccountinformation');
    });

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    managerviewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewemployees');
    });

    manageraddemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managercreateemployee');
    });

    managergototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });
}

// Manager Account Information ////////////////////////////
///////////////////////////////////////////////////////////
async function ManagerAccountInformation() {
    document.title = "Account";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernamemanageraccountinformation');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutmanageraccountinformation');
    var viewemployees = document.getElementById('managerviewemployeesaccountinformation');
    var addemployee = document.getElementById('manageraddemployeeaccountinformation');
    var viewmessages = document.getElementById('managerviewmessagesaccountinformation');
    var gototmessenger = document.getElementById('managergotomessengeraccountinformation');
    var informationemailinner = document.getElementById('managerinformationemailinner');
    informationemailinner.innerHTML = loggedInEmail;
    var informationusernameinner = document.getElementById('managerinformationusernameinner');
    informationusernameinner.innerHTML = loggedInUsername;
    var informationworkplace = document.getElementById('managerinformationworkplaceinner');
    informationworkplace.innerHTML = userWorkplace;
    var ownerinformationemployees = document.getElementById('managerinformationemployees');
    var managersRef = database.ref('Workplaces/' + userWorkplace + '/Managers/' + loggedInUsername + '/Users');
    var snapshot = await managersRef.once('value', function (data) { });
    var users = snapshot.val();;
    for (var userName in users) {
        var employeeNameh5 = document.createElement('h5');
        var employeeNameh5Text = document.createTextNode(userName);
        employeeNameh5.appendChild(employeeNameh5Text);
        employeeNameh5.setAttribute('id', 'employeename' + userName + 'managerviewemployees');
        ownerinformationemployees.appendChild(employeeNameh5);
    }

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    viewemployees.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewemployees');
    });

    addemployee.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('manageraddemployee');
    });

    viewmessages.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('managerviewmessages');
    });

    gototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });

    var notificationsOnBtn = document.getElementById('managernotificationson');
    notificationsOnBtn.addEventListener('click', function(e){
        e.preventDefault();
        database.ref('Workplaces/' + userWorkplace + '/Managers/' + loggedInUsername + '/Account/Notifications').set({Notifications: 'ON'});
        notificationsOnBtn.disabled = 'disabled';
        notificationsOffBtn.disabled = false;
    });

    var notificationsOffBtn = document.getElementById('managernotificationsoff');
    notificationsOffBtn.addEventListener('click', function(e){
        e.preventDefault();
        database.ref('Workplaces/' + userWorkplace + '/Managers/' + loggedInUsername + '/Account/Notifications').set({Notifications: 'OFF'});
        notificationsOnBtn.disabled = false;
        notificationsOffBtn.disabled = 'disabled';
    });
}

// Employee Account Information ///////////////////////////
///////////////////////////////////////////////////////////
async function EmployeeAccountInformation() {
    document.title = "Account";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernameemployeeaccountinformation');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signOutBtn = document.getElementById('signoutemployeeaccountinformation');
    var gototmessenger = document.getElementById('employeegotomessengeraccountinformation');
    var informationemailinner = document.getElementById('employeeinformationemailinner');
    informationemailinner.innerHTML = loggedInEmail;
    var informationusernameinner = document.getElementById('employeeinformationusernameinner');
    informationusernameinner.innerHTML = loggedInUsername;
    var informationworkplace = document.getElementById('employeeinformationworkplaceinner');
    informationworkplace.innerHTML = userWorkplace;

    signOutBtn.addEventListener('click', function (e) {
        SignOut();
    });

    gototmessenger.addEventListener('click', function (e) {
        e.preventDefault();
        Redirect('messaging')
    });

    var managersRef = database.ref('Workplaces/' + userWorkplace + '/Managers');
    var managerssnapshot = await managersRef.once('value', function(data){ });
    var allManagers = managerssnapshot.val();

    var notificationsOnBtn = document.getElementById('employeenotificationson');
    notificationsOnBtn.addEventListener('click', function(e){
        e.preventDefault();
        for(var manager in allManagers){
            var managerUsers = allManagers[manager].Users;
            for(var user in managerUsers){
                if(user == loggedInUsername){
                    database.ref('Workplaces/' + userWorkplace + '/Managers/' + manager + '/Users/' + user + '/Notifications').set({Notifications: 'ON'});
                    break;
                }
            }
        }
        notificationsOnBtn.disabled = 'disabled';
        notificationsOffBtn.disabled = false;
    });

    var notificationsOffBtn = document.getElementById('employeenotificationsoff');
    notificationsOffBtn.addEventListener('click', function(e){
        e.preventDefault();
        for(var manager in allManagers){
            var managerUsers = allManagers[manager].Users;
            for(var user in managerUsers){
                if(user == loggedInUsername){
                    database.ref('Workplaces/' + userWorkplace + '/Managers/' + manager + '/Users/' + user + '/Notifications').set({Notifications: 'OFF'});
                    break;
                }
            }
        }
        notificationsOnBtn.disabled = false;
        notificationsOffBtn.disabled = 'disabled';
    });
}

// Messaging //////////////////////////////////////////////
///////////////////////////////////////////////////////////
async function Messaging() {
    document.title = "Messaging";
    var usernameBoxUsername = document.getElementById('usernameBoxUsernamemessaging');
    usernameBoxUsername.innerHTML = loggedInUsername;
    var signout = document.getElementById('signoutmessaging');
    var message = document.getElementById('message');
    var chatOutterDiv = document.getElementById('chatOutterDiv');
    var chat = document.getElementById('chat');
    var newChat;
    var sendMessage = document.getElementById('sendMessage');
    var usersOutterDiv = document.getElementById('usersOutterDiv');
    var users = document.getElementById('users');
    var newUsersDiv;
    var groupsOutterDiv = document.getElementById('groupsOutterDiv');
    var groups = document.getElementById('groups');
    var newGroupsDiv;
    var addGroupBtn = document.getElementById('addGroup');
    var groupName = document.getElementById('newGroupText');
    var groupMemberText = document.getElementById('newGroupMembers');
    var currentGroupName = loggedInUsername;

    usernameBoxUsername.addEventListener('click', function (e) {
        e.preventDefault();
        switch (userRole) {
            case 'owner':
                Redirect('owneraccountinformation');
                break;
            case 'manager':
                Redirect('manageraccountinformation');
                break;
            case 'employee':
                Redirect('employeeaccountinformation');
                break;
            default:
                break;
        }
    });

    signout.addEventListener('click', function (e) {
        e.preventDefault();
        SignOut();
    });

    GetOnlineUsers(users, usersOutterDiv);
    GetGroups(groups, groupsOutterDiv);
    GetMessages(chat, chatOutterDiv, 'Group:' + loggedInUsername);

    async function GetMessages(chat, chatOutterDiv, groupName) {

        chatOutterDiv.removeChild(chat);
        newChat = document.createElement('div');
        newChat.setAttribute('id', 'chat');
        newChat.setAttribute('style', 'height:500px;');
        newChat.setAttribute('class', 'container');

        chatOutterDiv.appendChild(newChat);

        var messagesRef = database.ref('Workplaces/' + userWorkplace + '/Messages');
        var messagesSnapshot = await messagesRef.once('value', function (data) { });
        var allMessages = messagesSnapshot.val();
        for (var message in allMessages) {
            var curMessage = allMessages[message];
            if (curMessage.messageTo == groupName) {
                appendMessage(curMessage);
            }
        }
    }

    async function GetGroups(groups, groupsOutterDiv) {
        groups.parentNode.removeChild(groups);
        newGroupsDiv = document.createElement('div');
        newGroupsDiv.setAttribute('id', 'groups');
        newGroupsDiv.setAttribute('class', 'center groups');
        groupsOutterDiv.appendChild(newGroupsDiv);

        var groupsRef = database.ref('Workplaces/' + userWorkplace + '/Groups/');
        var groupsSnapshot = await groupsRef.once('value', function (data) { });
        var currentGroups = groupsSnapshot.val();
        for (var group in currentGroups) {
            appendGroup(group);
        }
    }

    async function GetOnlineUsers(users, usersOutterDiv) {
        users.parentNode.removeChild(users);
        newUsersDiv = document.createElement('div');
        newUsersDiv.setAttribute('id', 'users');
        newUsersDiv.setAttribute('class', 'center groups');
        usersOutterDiv.appendChild(newUsersDiv);

        var onlineUsers = [];
        var workplaceRef = database.ref('Workplaces/' + userWorkplace);
        var workplaceSnapshot = await workplaceRef.once('value', function (data) { });
        var workplaceData = workplaceSnapshot.val();
        if (workplaceData.Owner.Account.LoggedIn.LoggedIn == true) {
            onlineUsers.push(workplaceData.Owner.Account.Username);
        }
        var ManagerData = workplaceData.Managers;
        for (var manager in ManagerData) {
            if (ManagerData[manager].Account.LoggedIn.LoggedIn == true) {
                onlineUsers.push(ManagerData[manager].Account.Username);
            }
            var allusers = ManagerData[manager].Users;
            for (var user in allusers) {
                if (allusers[user].LoggedIn.LoggedIn == true) {
                    onlineUsers.push(allusers[user].Username);
                }
            }
        }
        for (let i = 0; i < onlineUsers.length; i++) {
            appendUser(onlineUsers[i]);
        }
    }

    // On User Connection and Disconnection
    ipcRenderer.on('user:connected', function (event) {
        GetOnlineUsers();
    });

    ipcRenderer.on('user:disconnected', function (event) {
        GetOnlineUsers();
    });

    addGroupBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        document.getElementById('NewGroupNOGOText').hidden = true;
        var dbRef = database.ref('Workplaces/' + userWorkplace + '/Groups/' + groupName.value);
        var snapshot = await dbRef.once('value', function (data) { });
        var groupSnapshot = snapshot.val();
        if (groupSnapshot != null) {
            document.getElementById('NewGroupNOGOText').hidden = false;
        } else {
            var groupMemebers = groupMemberText.value.split(', ');
            database.ref('Workplaces/' + userWorkplace + '/Groups/' + groupName.value).set(groupMemebers);
            for (let i = 0; i < groupMemebers.length; i++) {
                var allManagersRef = database.ref('Workplaces/' + userWorkplace + '/Managers');
                var allManagersSnap = await allManagersRef.once('value', function (data) { });
                var allManagers = allManagersSnap.val();
                for (var manager in allManagers) {
                    var users = allManagers[manager].Users;
                    for (var user in users) {
                        if (user == groupMemebers[i]) {
                            var currGroupName = groupName.value;
                            database.ref('Workplaces/' + userWorkplace + '/Managers/' + manager + '/Users/' + user + '/Groups/' + currGroupName).set({ [currGroupName]: groupMemebers });
                        }
                    }
                }
            }
            GetGroups();
        }
        groupName.value = "";
        groupMemberText.value = "";
    });

    ipcRenderer.on('group:newGroup', function (event) {
        GetGroups();
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
        // TODO: ADD NOTIFICATIONS
    });

    // Append Users, Messages, Groups
    function appendUser(username) {
        var userDiv = document.createElement('div');
        var text = document.createTextNode(username);
        userDiv.appendChild(text);
        users.appendChild(userDiv);
    }

    function appendMessage(messageObject) {
        chat.innerHTML = "";
        var newMessageDiv = document.createElement('div');

        var messageBodyText = document.createTextNode(messageObject.messageBody);
        var messageFromText = document.createTextNode('From: ' + messageObject.messageFrom);
        var messageToText = document.createTextNode('To: ' + messageObject.messageTo);
        var messageTimeText = document.createTextNode('At: ' + messageObject);

        var messageFromTextDiv = document.createElement('div');
        messageFromTextDiv.setAttribute('class', 'row');
        messageFromTextDiv.appendChild(messageFromText);
        var messageToTextDiv = document.createElement('div');
        messageToTextDiv.setAttribute('class', 'row');
        messageToTextDiv.appendChild(messageToText);
        var messageTimeTextDiv = document.createElement('div');
        messageTimeTextDiv.setAttribute('class', 'row');
        messageTimeTextDiv.appendChild(messageTimeText);

        var newMessageDiv = document.createElement('div');
        newMessageDiv.setAttribute('class', 'row');
        var newMessageBodyDiv = document.createElement('div');
        newMessageBodyDiv.setAttribute('class', 'col-md-7');
        var newMessageInfoDiv = document.createElement('div');
        newMessageInfoDiv.setAttribute('class', 'col-md-5');

        newMessageBodyDiv.appendChild(messageBodyText);
        newMessageInfoDiv.appendChild(messageFromText);
        newMessageInfoDiv.appendChild(messageToText);
        newMessageInfoDiv.appendChild(messageTimeText);
        newMessageDiv.appendChild(newMessageBodyDiv);
        newMessageDiv.appendChild(newMessageInfoDiv);
        chat.appendChild(newMessageDiv);
    }

    function appendGroup(groupName) {
        var groupDiv = document.createElement('div');
        var text = document.createTextNode(groupName);
        groupDiv.appendChild(text);
        groupDiv.setAttribute('class', 'cursor');
        groups.appendChild(groupDiv);
        currentGroupName = groupName;
        AddListener(groupDiv, currentGroupName);
    }

    function AddListener(addition, groupName) {
        addition.addEventListener('click', function (e) {
            e.preventDefault();
            FindMessagesByGroupName(groupName);
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


    async function FindMessagesByGroupName(groupName) {
        var messagesRef = database.ref('Workplaces/' + userWorkplace + '/Messages');
        var messagesSnapshot = await messagesRef.once('value', function (data) { });
        var allMessages = messagesSnapshot.val();
        for (var message in allMessages) {
            if (allMessages[message].messageTo == 'Group:' + groupName) {
                appendMessage(allMessages[message]);
            }
        }
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
        case 'ownerworkplacemenu':
            ShowDiv('ownerworkplacemenu');
            OwnerWorkplaceMenu();
            break;
        case 'confirmation':
            ShowDiv('confirmation');
            Confirmation();
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

async function SetLoggedInStatus(isLoggedIn) {
    var ownerRef = database.ref('Workplaces/' + userWorkplace + '/Owner/Account');
    var ownerSnapshot = await ownerRef.once('value', function (data) { });
    var owner = ownerSnapshot.val();
    if (owner.Uid == loggedInUser) {
        database.ref('Workplaces/' + userWorkplace + '/Owner/Account/LoggedIn').set({ LoggedIn: isLoggedIn });
    } else {
        var managersref = database.ref('Workplaces/' + userWorkplace + '/Managers');
        var managerSnapshot = await managersref.once('value', function (data) { });
        var managers = managerSnapshot.val();
        for (var manager in managers) {
            if (managers[manager].Account.Uid == loggedInUser) {
                database.ref('Workplaces/' + userWorkplace + '/Managers/' + managers[manager].Account.Username + '/Account/LoggedIn').set({ LoggedIn: isLoggedIn });
                return;
            } else {
                for (var user in managers[manager].Users) {
                    if (user.Uid == loggedInUser) {
                        database.ref('Workplaces/' + userWorkplace + '/Managers/' + managers[manager].Account.Username + '/Users/' + user.Username + '/LoggedIn').set({ LoggedIn: isLoggedIn });
                        return;
                    }
                }
            }
        }
    }
}

ipcRenderer.on('user:logout', function (event) {
    SignOut();
});

ipcRenderer.on('user:quit', function (e) {
    SignOut();
    ipcRenderer.send('user:quited');
});

async function SignOut() {
    await SetLoggedInStatus(false);
    auth.signOut().then(function (result) {
        loggedInUser = null;
        userWorkplace = null;
        Redirect('login');
    }).catch(function (err) {
        if (err != null) {
            console.log(err);
        }
    });
}

function HideAllDivs() {
    document.getElementById('login').hidden = true;
    document.getElementById('ownerworkplacemenu').hidden = true;
    document.getElementById('confirmation').hidden = true;
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
    document.getElementById('managerviewmessages').hidden = true;
    document.getElementById('managerhomepage').hidden = true;
    document.getElementById('employeeaccountinformation').hidden = true;
    document.getElementById('messaging').hidden = true;
}

function ShowDiv(divName) {
    switch (divName) {
        case 'login':
            document.getElementById('login').hidden = false;
            break;
        case 'ownerworkplacemenu':
            document.getElementById('ownerworkplacemenu').hidden = false;
            break;
        case 'confirmation':
            document.getElementById('confirmation').hidden = false;
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