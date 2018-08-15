const io = require('socket.io-client');
//const socket = io('http://142.93.200.15:3000'); // SSH Server
const socket = io('http://192.168.0.128:3000'); // Local Server


socket.on('connect', function(socekt){
    console.log('Connected');
});


// Incoming Message
socket.on('message', function(data){
    console.log(message);
});

// // Send Message
// function sendMessage(message){
//     socket.emit('message', message);
// }


function someFunction(userNameV, passwordV){
    var ref = database.ref('account');
  var data = {
      username: userNameV,
      password: passwordV
  }
  ref.push(data);
}






// --------------------------------------------------------------------------
var keys = new Keys();

    // Initialize Firebase
    var config = {
    apiKey: keys.FirebaseAPIKey,
    authDomain: keys.FirebaseAuthDomain,
    databaseURL: keys.FirebaseURL,
    projectId: keys.FirebaseProjectId,
    storageBucket: keys.FirebaseStoragebucket,
    messagingSenderId: keys.FirebaseMessagingSenderId
    };
    firebase.initializeApp(config);
    console.log(firebase);
    var database = firebase.database();


    var logModal = document.getElementById('loginForm');
    var regModal = document.getElementById('registerForm');
    window.onclick = function(event) {
        if (event.target == logModal) {
            logModal.style.display = "none";
        }
        else if(event.target == regModal){
            regModal.style.display = "none";
        }
    }

    const loginForm = document.querySelector('#loginForm');
    const registerForm = document.querySelector('#registerForm');
    loginForm.addEventListener('submit', submitLogin);
    registerForm.addEventListener('submit', submitRegister);

    function submitLogin(e){
        e.preventDefault();
        const userName = document.querySelector('#Luname').value;
        const password = document.querySelector('#Lpassword').value;
        clearFields(userName, password);
        icpRenderer.send('user:login', userName, password);
        someFunction(userNameV, passwordV);
    }
    function submitRegister(e){
        e.preventDefault();
        const userName = document.querySelector('#Runame').value;
        const password = document.querySelector('#Rpassword').value;
        const cPassword = document.querySelector('#RconfirmPassword').value;
        const workplace = document.querySelector('#Rworkplace').value;
        if(password === cPassword){
            //icpRenderer.send('user:register', userName, password, workplace);
        } else {
            // TODO: "Passwords Do Not Match"
        }
    }
    function clearFields(field1, field2, field3, field4){
        field1 = "";
        field2 = "";
        field3 = "";
        field4 = "";
    }