const mongoose = require('mongoose');

const projectLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    projectID: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
        // e.g., 'CREATED', 'STATUS_CHANGE', 'COMPONENT_UPDATE', 'REPORT_UPLOAD', 'COMPLETION'
    },
    message: {
        type: String,
        required: true
    },
    actor: {
        type: String,
        default: 'System'
    },
    remark: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('ProjectLog', projectLogSchema);
