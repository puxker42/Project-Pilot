const User = require('../models/User');
const otpGenerator = require('otp-generator');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Controls = require('../models/Controls');
const mailSender = require('../utils/mailSender');

// Three Functions are there in this file 
//     1-> sendOTP() => to send the otp
//     2-> signUp() => to signUp or register new user
//     3-> login() => to login properly

//sendOTP
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from req body
        const { email } = req.body;

        //check user existence
        const checkUserPresent = await User.findOne({ email });
        //if user exist then return response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User Already Exists !!"
            });
        }
        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: true,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP generated Successfully !!");

        //check uniquie OTP 
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({ opt: otp });
        }

        //Create OTP object !!
        const otpPayload = { email, otp };

        //create an entry in DB for OTP
        const otpbody = await OTP.create(otpPayload);
        console.log(otpbody);
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully !!"
        });
    } catch (error) {
        console.log("OTP Send nahi ho paya Jii !!");
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.signUp = async (req, res) => {
    try {
        //fetch Data from req.body
        const { firstName, lastName, email, password, cPassword, accountType, contactNumber, userID, batch, passingYear, academicYear, otp } = req.body;

        //Validate Data
        // Always-required fields
        if (
            !firstName || !lastName || !email || !password || !cPassword ||
            !accountType || !contactNumber || !userID
        ) {
            return res.status(400).json({ success: false, message: "All mandatory fields are required!" });
        }

        // Conditional fields for Student
        if (accountType === 'Student') {
            if (!batch || !passingYear || !academicYear) {
                return res.status(400).json({ success: false, message: "Student-specific fields are required!" });
            }
        }

        if (password !== cPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match!" });
        }

        const exist = await User.findOne({ userID: Number(userID) });
        if (exist) {
            return res.status(409).json({ success: false, message: "User ID already taken!" });
        }

        //Fetch OTP & Validate OTP
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (recentOTP.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP Not found !"
            });
        } else if (otp !== recentOTP[0].otp) {
            console.log(recentOTP, " ", otp);
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profile = await Profile.create({
            gender: null,
            about: null,
            dateOfBirth: null,
            contactNo: null,
        });

        const userData = {
            firstName,
            lastName,
            email,
            userID: Number(userID),
            password: hashedPassword,
            accountType,
            isVerified: true,
            contactNumber, // keep as string
            additionalDetail: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        };

        // Add student fields only if role is Student
        if (accountType === 'Student') {
            userData.batch = parseInt(batch.replace("EN-", ""));
            userData.passingYear = Number(passingYear);
            userData.year = parseInt(academicYear);
        }

        const user = await User.create(userData);

        return res.status(200).json({
            success: true,
            message: "User registered successfully!",
            user,
        });

    } catch (err) {
        console.error("Error during signup:", err);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};


//Login
exports.login = async (req, res) => {
    try {
        const { userID, password } = req.body;

        // Validate input
        if (!userID || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the details !!",
            });
        }

        // Check if the user exists
        const user = await User.findOne({ userID });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered !!",
            });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials !!",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.accountType, name: `${user.firstName} ${user.lastName}` },
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful !!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.accountType,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong !!",
        });
    }
};

exports.sendInstructioMail = async (req, res) => {
    try {
        const { userID, email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required!',
            });
        }

        // Create token valid for 2 minutes
        const token = jwt.sign({ email, userID }, process.env.JWT_SECRET, { expiresIn: '2m' });

        // Build frontend reset URL
        const resetLink = `${process.env.FRONT_BASE}/auth/reset-password?token=${token}`;

        const subject = 'Project Pilot - Password Reset Instructions';
        const body = `
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p><strong>Note: This link will expire in 2 minutes.</strong></p>
      <p>If you didn’t request this, simply ignore the message.</p>
      <br/>
      <p>— Project Pilot Team</p>
    `;

        // Send the mail using your utility
        await mailSender(email, subject, body);

        res.status(200).json({
            success: true,
            message: 'Reset instructions sent to your email!',
        });
    } catch (error) {
        console.error('sendInstructioMail error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while sending reset email.',
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validate token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            console.error("Token verification failed:", err.message);
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token",
            });
        }

        // Find user using decoded token payload
        const user = await User.findOne({ userID: decoded.userID });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully !!",
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            error: "Something went wrong !!",
        });
    }
};



exports.verifyOTP = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const { eotp, motp } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const recentOTP = await OTP.findOne({ email: user.email }).sort({ createdAt: -1 });
        if (!recentOTP) return res.status(400).json({ success: false, message: "No OTP found" });

        if (recentOTP.eotp !== eotp || recentOTP.motp !== motp) {
            return res.status(400).json({ success: false, message: "Invalid OTPs" });
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ success: true, message: "User verified successfully" });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Error verifying OTP" });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ success: true, data: { ID: user.userID, name: `${user.firstName} ${user.lastName}`, batch: user.batch, passingYear: user.passingYear } });
    } catch (error) {
        console.error("getCurrentUser error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyToken = (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, message: 'Invalid or expired token' });
    }
};