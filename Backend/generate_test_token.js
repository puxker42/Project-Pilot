const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mock project object as expected by the token
const project = {
    _id: "67580e0c968f441050a4d538", // Using the ID from Distribute.js log or similar, or just a dummy one
    ID: "PRJ10111",
    title: "Test Project",
    ack: -1,
    components: [
        {
            comID: "COM123456", // Backend model might use id, but let's check what token usually has. 
            // Actually, the token contains the *whole* project object.
            // Distribute.js says: const token = jwt.sign({ project: updatedProject }, ...)
            // And updatedProject comes from existing data.
            // If the schema has `id`, the data likely has `id`.
            id: "COM123456",
            name: "Arduino Uno",
            receivedQty: 5,
            remark: "Test remark"
        }
    ]
};

const secret = process.env.JWT_SECRET || 'test_secret'; // Fallback if env not loaded (though it should be)
const token = jwt.sign({ project }, secret, { expiresIn: '20m' });

console.log("Generated Token:", token);
console.log(`Test URL: http://localhost:3000/student/acknowledgement/${project._id}/${token}`);
