const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    componentID: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'Unknown'
    },
    destination: {
        type: String,
        default: 'Unknown'
    },
    type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    remark: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('StockLog', stockLogSchema);
