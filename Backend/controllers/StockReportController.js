const StockLog = require('../models/StockLog');
const Component = require('../models/Component');
const Project = require('../models/Project');
const Cart = require('../models/Cart');
const Team = require('../models/Team');
const User = require('../models/User');
const Vendor = require('../models/Vendor'); // Added Vendor import

exports.generateStockReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate, includeProjectDetails, includeCartDetails, limit } = req.body;

        console.log("Generating Stock Report:", { reportType, includeProjectDetails, includeCartDetails });

        let query = {};

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        let logs = [];

        // Determine query based on report type
        switch (reportType) {
            case 'current':
                try {
                    const components = await Component.find();
                    const reportData = components.map(comp => ({
                        componentID: comp.cID,
                        name: comp.title,
                        quantity: comp.qnty,
                        location: comp.loc,
                        available: comp.available
                    }));
                    return res.status(200).json({ success: true, count: reportData.length, data: reportData });
                } catch (error) {
                    console.error("Error fetching current stock:", error);
                    return res.status(500).json({ success: false, message: "Error fetching current stock" });
                }

            case 'day_wise':
                try {
                    console.log("Generating Day Wise Stock Report for:", startDate || endDate);

                    // 1. Determine Date Boundary
                    let targetDate = endDate ? new Date(endDate) : (startDate ? new Date(startDate) : new Date());
                    targetDate.setHours(23, 59, 59, 999); // End of the day

                    // 2. Fetch all Component Basics (for names and IDs)
                    const components = await Component.find({}, 'cID title').lean();

                    // Initialize stock map with 0
                    const stockMap = {};
                    const componentNameMap = {};

                    components.forEach(c => {
                        stockMap[c.cID] = 0;
                        componentNameMap[c.cID] = c.title;
                    });

                    // 3. Fetch ALL Logs up to target Date
                    const dayWiseQuery = { date: { $lte: targetDate } };
                    const historicLogs = await StockLog.find(dayWiseQuery).sort({ date: 1 }).lean();
                    console.log(`Replaying ${historicLogs.length} logs for day wise report...`);

                    // 4. Replay Logs
                    historicLogs.forEach(log => {
                        if (!stockMap.hasOwnProperty(log.componentID)) {
                            // Can happen if component was deleted or new ID used in logs not in current DB
                            stockMap[log.componentID] = 0;
                            componentNameMap[log.componentID] = componentNameMap[log.componentID] || `Deleted/Unknown (${log.componentID})`;
                        }

                        // Data Integrity Check
                        if (log.type && typeof log.quantity === 'number') {
                            if (log.type === 'IN') {
                                stockMap[log.componentID] += log.quantity;
                            } else if (log.type === 'OUT') {
                                stockMap[log.componentID] -= log.quantity;
                            }
                        }
                    });

                    // 5. Build Result Data
                    const reportData = Object.keys(stockMap).map(cID => {
                        let calculatedQty = stockMap[cID];

                        // Edge Case: Negative Stock -> Floor to 0
                        if (calculatedQty < 0) calculatedQty = 0;

                        return {
                            componentID: cID,
                            name: componentNameMap[cID],
                            quantity: calculatedQty,
                            date: targetDate,
                            available: calculatedQty > 0
                        };
                    });

                    return res.status(200).json({ success: true, count: reportData.length, data: reportData });

                } catch (error) {
                    console.error("Error generating day wise stock report:", error);
                    return res.status(500).json({ success: false, message: "Error generating day wise report" });
                }

            case 'component_wise':
                try {
                    console.log("Generating Component Wise Stock Report");

                    // 1. Fetch all Component Basics
                    const components = await Component.find({}, 'cID title').lean();

                    // Initialize maps
                    const aggregationMap = {};
                    const componentNameMap = {};

                    components.forEach(c => {
                        aggregationMap[c.cID] = { totalIn: 0, totalOut: 0 };
                        componentNameMap[c.cID] = c.title;
                    });

                    // 2. Fetch Logs (Apply date filters if present, otherwise all time)
                    // If user selects "Current Stock" logic, usually it is ALL TIME. 
                    // But if they provide a date range, we ideally respect it for the "Total IN/OUT" 
                    // during that period, but "Current Stock" usually implies "As of Now" or "As of End Date".
                    // Given the user prompt "current = total in - out", and typical report behavior:
                    // We will calculate totals based on the query (which might have date filters).
                    // If no date filters, it's all time.

                    const reportLogs = await StockLog.find(query).lean();
                    console.log(`Aggregating ${reportLogs.length} logs for component wise report...`);

                    // 3. Aggregate
                    reportLogs.forEach(log => {
                        if (!aggregationMap[log.componentID]) {
                            aggregationMap[log.componentID] = { totalIn: 0, totalOut: 0 };
                            componentNameMap[log.componentID] = componentNameMap[log.componentID] || `Deleted/Unknown (${log.componentID})`;
                        }

                        if (log.type && typeof log.quantity === 'number') {
                            if (log.type === 'IN') {
                                aggregationMap[log.componentID].totalIn += log.quantity;
                            } else if (log.type === 'OUT') {
                                aggregationMap[log.componentID].totalOut += log.quantity;
                            }
                        }
                    });

                    // 4. Build Result
                    const reportData = Object.keys(aggregationMap).map(cID => {
                        const { totalIn, totalOut } = aggregationMap[cID];
                        let currentStock = totalIn - totalOut;

                        // Edge Case: Negative Stock -> Floor to 0
                        if (currentStock < 0) currentStock = 0;

                        return {
                            componentID: cID,
                            name: componentNameMap[cID],
                            totalIn,
                            totalOut,
                            currentStock,
                            available: currentStock > 0
                        };
                    });

                    return res.status(200).json({ success: true, count: reportData.length, data: reportData });

                } catch (error) {
                    console.error("Error generating component wise report:", error);
                    return res.status(500).json({ success: false, message: "Error generating component wise report" });
                }

            case 'in_out':
                break;

            case 'in_only':
                query.type = 'IN';
                break;

            case 'out_only':
                query.type = 'OUT';
                break;

            case 'out_project':
                query.type = 'OUT';
                query.destination = { $regex: /^Project/ };
                break;

            case 'in_cart':
                query.type = 'IN';
                query.source = { $regex: /^CRT/ };
                break;

            case 'in_project':
                query.type = 'IN';
                query.source = { $regex: /^PRJ/ };
                break;

            case 'in_stock':
                query.type = 'IN';
                break;

            case 'out_distribution':
                query.type = 'OUT';
                break;

            default:
                return res.status(400).json({ success: false, message: "Invalid report type" });
        }

        // Fetch logs
        logs = await StockLog.find(query).sort({ date: -1 }).limit(Number(limit) || 0).lean();
        console.log(`Fetched ${logs.length} logs for report.`);

        // --- Data Enrichment Logic ---

        const uniqueProjectIDs = new Set();
        const uniqueCartIDs = new Set();

        // 1. Collect IDs
        logs.forEach(log => {
            // Extract Project ID: "Project PRJ12345" -> "PRJ12345" OR Source "PRJ12345" -> "PRJ12345"
            let prjId = null;
            if (log.destination && log.destination.startsWith('Project ')) {
                prjId = log.destination.replace('Project ', '').trim();
            } else if (log.source && log.source.startsWith('PRJ')) {
                prjId = log.source.trim();
            }

            if (prjId) uniqueProjectIDs.add(prjId);

            // Extract Cart ID: Source "CRT..."
            if (log.source && log.source.startsWith('CRT')) {
                uniqueCartIDs.add(log.source.trim());
            }
        });

        console.log("Unique Project IDs:", Array.from(uniqueProjectIDs));
        console.log("Unique Cart IDs:", Array.from(uniqueCartIDs));

        // 2. Fetch Details in Bulk
        let projectsMap = {};
        let cartsMap = {};
        let guidesMap = {};
        let teamsMap = {};
        let studentsMap = {};
        let componentMap = {};

        // [NEW] Fetch Component Names
        try {
            const allComponents = await Component.find({}, 'cID title').lean();
            allComponents.forEach(c => {
                componentMap[c.cID] = c.title;
            });
            console.log("Mapped components components:", Object.keys(componentMap).length);
        } catch (err) {
            console.error("Error fetching components for mapping:", err);
        }

        if (includeProjectDetails && uniqueProjectIDs.size > 0) {
            console.log("Fetching Project Details...");
            const projects = await Project.find({ ID: { $in: Array.from(uniqueProjectIDs) } }).lean();
            console.log("Projects Found:", projects.length);

            // Gather Guide IDs (User ObjectIds) and Team IDs (Team ObjectIds)
            const guideIds = projects.map(p => p.guideID).filter(id => id);
            const teamIds = projects.map(p => p.teamID).filter(id => id);

            const guides = await User.find({ _id: { $in: guideIds } }, 'firstName lastName').lean();
            const teams = await Team.find({ _id: { $in: teamIds } }).lean();

            // Gather Student UserIDs (Numbers) from Teams
            let studentUserIds = [];
            teams.forEach(t => {
                if (t.members) {
                    t.members.forEach(m => studentUserIds.push(m.userID));
                }
            });
            const students = await User.find({ userID: { $in: studentUserIds } }, 'userID firstName lastName').lean();

            // Index Maps
            guides.forEach(g => guidesMap[g._id.toString()] = `${g.firstName} ${g.lastName}`);
            students.forEach(s => studentsMap[s.userID] = `${s.firstName} ${s.lastName}`);

            teams.forEach(t => {
                teamsMap[t._id.toString()] = {
                    teamName: t.teamName,
                    members: t.members.map(m => ({
                        role: m.role,
                        name: studentsMap[m.userID] || `User: ${m.userID}`,
                        prn: m.userID
                    }))
                };
            });

            projects.forEach(p => {
                projectsMap[p.ID] = {
                    title: p.title,
                    type: p.type,
                    guideName: p.guideID ? guidesMap[p.guideID.toString()] : 'N/A',
                    team: p.teamID ? teamsMap[p.teamID.toString()] : null
                };
            });
        }

        // Vendor Fetching Logic for Carts
        let vendorMap = {};

        if (includeCartDetails && uniqueCartIDs.size > 0) {
            console.log("Fetching Cart Details...");
            const carts = await Cart.find({ ID: { $in: Array.from(uniqueCartIDs) } }).lean();
            console.log("Carts Found:", carts.length);

            // Collect Vendor IDs from Carts (assuming vendorID is a String in Cart)
            const vendorIds = carts.map(c => c.vendorID).filter(id => id);

            // Fetch Vendors
            if (vendorIds.length > 0) {
                const vendors = await Vendor.find({ ID: { $in: vendorIds } }).lean();
                vendors.forEach(v => {
                    vendorMap[v.ID] = {
                        name: v.name,
                        manager: v.managerName,
                        contact: v.contactNo
                    };
                });
            }

            carts.forEach(c => {
                const vendor = vendorMap[c.vendorID] || {};
                cartsMap[c.ID] = {
                    vendorName: vendor.name || c.vendorName || 'Unknown Vendor',
                    vendorManager: vendor.manager,
                    vendorContact: vendor.contact,
                    orderDate: c.orderDate,
                    status: c.checkIn ? 'Received' : (c.ordered ? 'Ordered' : 'Draft')
                };
            });
        }

        // 3. Attach Details to Logs
        const enrichedLogs = logs.map(log => {
            let enrichedLog = { ...log };

            // [NEW] Attach Component Name
            enrichedLog.componentName = componentMap[log.componentID] || 'Unknown Component';

            let prjId = null;
            if (log.destination && log.destination.startsWith('Project ')) {
                prjId = log.destination.replace('Project ', '').trim();
            } else if (log.source && log.source.startsWith('PRJ')) {
                prjId = log.source.trim();
            }

            if (prjId && projectsMap[prjId]) {
                enrichedLog.projectDetails = {
                    id: prjId,
                    ...projectsMap[prjId]
                };
            }

            if (log.source && log.source.startsWith('CRT') && cartsMap[log.source]) {
                enrichedLog.cartDetails = {
                    id: log.source,
                    ...cartsMap[log.source]
                };
            }

            return enrichedLog;
        });

        if (enrichedLogs.length > 0) {
            console.log("Sample Enriched Log:", JSON.stringify(enrichedLogs[0], null, 2));
        }

        res.status(200).json({ success: true, count: enrichedLogs.length, data: enrichedLogs });

    } catch (error) {
        console.error("Error generating stock report:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
