const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all connections (laptop + mobile)
        methods: ["GET", "POST"]
    }
});

// In-memory state store
let activeState = null;

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // When client joins, send them the latest state if we have one
    if (activeState) {
        socket.emit('SYNC_STATE', activeState);
    }

    // Client pushes a state update
    socket.on('UPDATE_STATE', (newState) => {
        // console.log('State updated by', socket.id);
        activeState = newState;
        // Broadcast to EVERYONE ELSE
        socket.broadcast.emit('SYNC_STATE', newState);
    });

    // Client specifically requests latest state
    socket.on('REQUEST_SYNC', () => {
        if (activeState) {
            socket.emit('SYNC_STATE', activeState);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Socket Server running on port ${PORT}`);
    console.log(`Ensure frontend connects to http://<YOUR_LAPTOP_IP>:${PORT}`);
});
