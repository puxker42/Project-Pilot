const mongoose = require('mongoose');

require('dotenv').config();

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        // useNewUrlPraser : true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log("DB Connected Successfully");
        })
        .catch((err) => {
            console.log("DB Connection issues ");
            console.error(err);
            process.exit(1);
        })
}

module.exports = dbConnect;
