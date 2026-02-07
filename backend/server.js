const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const AuctionState = require('./models/AuctionState');
const { appendToSheet } = require('./utils/googleSheets');

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// ━━━ MONGODB CONNECTION ━━━
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ MongoDB Connected'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.warn('⚠️ No MONGO_URI found in .env');
}

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory state store
let activeState = null;

// ━━━ REST API ━━━

// Endpoint to Record Sale (Used by Frontend)
app.get('/', (req, res) => {
    res.send('Auction Server is Running');
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        googleSheets: {
            hasSheetId: !!process.env.GOOGLE_SHEET_ID,
            hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
            hasKey: !!process.env.GOOGLE_PRIVATE_KEY
        }
    });
});

app.post('/api/sale', async (req, res) => {
    try {
        const { studentId, name, price, vanguard } = req.body;
        console.log(`💰 SALE: ${name} -> ${vanguard} (${price}cr)`);

        // 1. Save to MongoDB
        const newRecord = new AuctionState({
            type: 'SALE',
            studentId,
            studentName: name,
            vanguard,
            price,
            details: req.body
        });
        await newRecord.save();

        // 2. Append to Google Sheet
        // Format: [Date, Type, Name, Vanguard, Price]
        const row = [
            new Date().toISOString(),
            'SALE',
            name,
            vanguard,
            price
        ];
        await appendToSheet(row);

        res.json({ success: true, message: 'Sale Recorded' });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    if (activeState) {
        socket.emit('SYNC_STATE', activeState);
    }

    socket.on('UPDATE_STATE', (newState) => {
        activeState = newState;
        socket.broadcast.emit('SYNC_STATE', newState);
    });

    socket.on('REQUEST_SYNC', () => {
        if (activeState) {
            socket.emit('SYNC_STATE', activeState);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
