const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60
    }
});

//Intend to send mail
async function sendVerificatinoEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email From Electronics Projects Portal", otp);
        console.log("Email Send Successfully !!", mailResponse);

    } catch (err) {
        console.log("Error Occured in Sending Email !!", err);
        throw err;
    }
}


otpSchema.pre("save", async function (next) {
    await sendVerificatinoEmail(this.email, this.otp);
    next();
});



module.exports = mongoose.model("OTP", otpSchema);