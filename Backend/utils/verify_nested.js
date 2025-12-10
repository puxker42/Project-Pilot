const mongoose = require('mongoose');
const { generateProjectReport } = require('../controllers/ProjectReportController');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mockReq = (body) => ({ body });
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => {
        console.log("Response Status:", res.statusCode);
        const dataStr = JSON.stringify(data, null, 2);
        console.log("Data Preview (First Item):", dataStr.substring(0, 2000));
        return res;
    };
    return res;
};

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected to DB");
        console.log("--- Test: Detailed /w Nested Arrays ---");
        await generateProjectReport(mockReq({
            filters: { status: 'All' },
            projectDetails: { includeId: true, includeTitle: true },
            teamDetails: 'id_prn_name',
            otherDetails: { includeComponents: true }
        }), mockRes());
        process.exit(0);
    })
    .catch(err => { console.error(err); process.exit(1); });
