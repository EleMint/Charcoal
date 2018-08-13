const io = require('socket.io-client');
const socket = io('http://localhost:3000');

// Incoming Message
socket.on('message', function(data){
    console.log(message);
});

// // Send Message
// function sendMessage(message){
//     socket.emit('message', message);
// }