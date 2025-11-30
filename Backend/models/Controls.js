const mongoose = require('mongoose');

const controlsSchema = new mongoose.Schema({
    createProject: {
        type: Boolean,
        default: false
    },
    createUser: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Controls', controlsSchema);