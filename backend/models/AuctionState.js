const mongoose = require('mongoose');

const AuctionStateSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: { type: String, required: true }, // 'SALE', 'UNSOLD', 'SKIP', 'UNDO'
    studentId: String,
    studentName: String,
    vanguard: String,
    price: Number,
    details: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('AuctionState', AuctionStateSchema);
