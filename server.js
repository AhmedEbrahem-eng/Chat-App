const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let onlineUsers = [];

app.use(express.static('public'));

// Handle new WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');


    ws.on('message', (message) => {
        let msg_content = JSON.parse(message);
        if (msg_content.login) {
            ws.username = msg_content.username;
            onlineUsers.push(ws.username);
            broadcast({
                type: 'login',
                username: ws.username,
                message: `${ws.username} has joined the chat`,
                online: onlineUsers
            });
        } else if (msg_content.body) {
            broadcast({
                type: 'chat',
                message: msg_content.body,
                online: onlineUsers
            });
        }
    });

    // Handle WebSocket disconnections
    ws.on('close', () => {
        if (ws.username) {
            onlineUsers = onlineUsers.filter(user => user !== ws.username);
            broadcast({
                type: 'logout',
                username: ws.username,
                message: `${ws.username} has left the chat`,
                online: onlineUsers
            });
        }
        console.log('Client disconnected');
    });
});

const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

// Start the server
server.listen(8082, () => {
    console.log(`Server is listening on port 8082`);
});
