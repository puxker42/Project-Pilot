const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const User = require('../models/User');

exports.generateCertificate = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required"
            });
        }

        // ============================
        // FETCH PROJECT
        // ============================
        let project;
        try {
            project = await Project.findOne({ ID: projectId })
                .populate('teamID')
                .populate('guideID');
        } catch (dbError) {
            console.error("Database error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database error while fetching project"
            });
        }

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (!project.teamID) {
            return res.status(404).json({
                success: false,
                message: "Project team not found"
            });
        }

        // ============================
        // FETCH MEMBERS
        // ============================
        let members = [];
        try {
            const memberIds = project.teamID.members.map(m => m.userID);
            if (memberIds.length > 0) {
                members = await User.find({ userID: { $in: memberIds } });

                // preserve original order from team schema
                const orderMap = {};
                project.teamID.members.forEach((m, i) => orderMap[m.userID] = i);

                members.sort((a, b) => (orderMap[a.userID] ?? 0) - (orderMap[b.userID] ?? 0));
            }
        } catch (err) {
            console.error("Error fetching members:", err);
            return res.status(500).json({
                success: false,
                message: "Error fetching team members"
            });
        }

        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No members found"
            });
        }

        // ============================
        // ASSETS
        // ============================
        const logoPath = path.join(__dirname, '../public/logo.png');
        const fontDir = path.join(__dirname, '../public/fonts');

        const paths = {
            regular: path.join(fontDir, 'Georgia.ttf'),
            bold: path.join(fontDir, 'Georgia-Bold.ttf'),
            italic: path.join(fontDir, 'Georgia-Italic.ttf'),
            boldItalic: path.join(fontDir, 'Georgia-BoldItalic.ttf')
        };

        // ============================
        // CREATE PDF
        // ============================
        const doc = new PDFDocument({
            size: 'A4',
            margin: 0
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate-${project.ID}.pdf`);
        doc.pipe(res);

        // Register fonts
        try {
            doc.registerFont('Georgia', paths.regular);
            doc.registerFont('Georgia-Bold', paths.bold);
            doc.registerFont('Georgia-Italic', paths.italic);
            doc.registerFont('Georgia-BoldItalic', paths.boldItalic);
        } catch (err) {
            console.error("Font error:", err);
            doc.registerFont('Georgia', 'Times-Roman');
            doc.registerFont('Georgia-Bold', 'Times-Bold');
            doc.registerFont('Georgia-Italic', 'Times-Italic');
            doc.registerFont('Georgia-BoldItalic', 'Times-BoldItalic');
        }

        // ============================
        // CONSTANTS
        // ============================
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const centerX = pageWidth / 2;

        const sizes = {
            a: 22,
            on: 18,
            title: 24,
            submittedBy: 24,
            student: 20,
            underGuide: 18,
            profName: 20,
            dept: 18,
            rest: 20
        };

        // ============================
        // BORDERS
        // ============================
        doc.lineWidth(1).rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();
        doc.lineWidth(3).rect(25, 25, pageWidth - 50, pageHeight - 50).stroke();

        // ============================
        // "A" – centered
        // ============================
        doc.font('Georgia-Bold')
            .fontSize(sizes.a)
            .fillColor('#1e3a8a');

        doc.text('A', 0, 70, {
            align: 'center',
            width: pageWidth
        });

        // ============================
        // "Project-I Report"
        // ============================
        doc.font('Georgia-Bold')
            .fontSize(18)
            .fillColor('#1e3a8a');

        doc.text('Project-I Report', 0, 110, {
            align: 'center',
            width: pageWidth
        });

        // ============================
        // "on" – NOW BOLD + BLUE
        // ============================
        doc.font('Georgia-Bold')
            .fontSize(sizes.on)
            .fillColor('#1e3a8a');

        doc.text('on', 0, 150, {
            align: 'center',
            width: pageWidth
        });

        // ============================
        // PROJECT TITLE (Bold-Italic)
        // ============================
        const projectTitle = project.title || "Untitled Project";

        const titleMaxWidth = pageWidth - 120;
        const titleX = (pageWidth - titleMaxWidth) / 2;

        doc.font('Georgia-BoldItalic')
            .fontSize(sizes.title)
            .fillColor('#DC143C');

        doc.text(`"${projectTitle}"`, titleX, 190, {
            width: titleMaxWidth,
            align: 'center',
            lineGap: 2
        });

        const titleHeight = doc.heightOfString(`"${projectTitle}"`, {
            width: titleMaxWidth,
            font: 'Georgia-BoldItalic',
            size: sizes.title
        });

        const yAfterTitle = 190 + titleHeight + 35;

        // ============================
        // "Submitted By" – NORMAL FONT
        // ============================
        doc.font('Georgia')
            .fontSize(sizes.submittedBy)
            .fillColor('#000');

        doc.text('Submitted By', 0, yAfterTitle, {
            align: 'center',
            width: pageWidth
        });

        // ============================
        // MEMBERS LIST
        // ============================
        let yMembersStart = yAfterTitle + 40;
        const nameX = 145;
        const idX = 375;
        const rowHeight = 28;

        doc.font('Georgia')
            .fontSize(sizes.student);

        members.forEach((m, i) => {
            const name = `${m.firstName || ''} ${m.lastName || ''}`.trim();
            const id = m.userID || "N/A";
            const y = yMembersStart + i * rowHeight;

            doc.text(name, nameX, y, { width: 220 });
            doc.text(id, idX, y, { width: 120 });
        });

        const yAfterMembers = yMembersStart + members.length * rowHeight + 25;

        // ============================
        // UNDER GUIDANCE
        // ============================
        doc.font('Georgia-Bold')
            .fontSize(sizes.underGuide)
            .fillColor('#000');

        doc.text('Under the guidance of', 0, yAfterMembers, {
            align: 'center',
            width: pageWidth
        });

        // ============================
        // GUIDE NAME – BOLD ONLY, NO PREFIX
        // ============================
        const guideName = project.guideID
            ? `${project.guideID.firstName || ''} ${project.guideID.lastName || ''}`.trim()
            : "S.K. Parchandekar";

        doc.font('Georgia-Bold')
            .fontSize(sizes.profName)
            .fillColor('#DC143C');

        doc.text(guideName, 0, yAfterMembers + 30, {
            align: 'center',
            width: pageWidth
        });

        // ============================
        // LOGO
        // ============================
        const logoY = yAfterMembers + 90;

        if (fs.existsSync(logoPath)) {
            try {
                const logoWidth = 120;
                const logoX = (pageWidth - logoWidth) / 2;
                doc.image(logoPath, logoX, logoY, { width: logoWidth });
            } catch (e) {
                console.error("Logo render error:", e);
            }
        }

        const yAfterLogo = logoY + 130;

        // ============================
        // FOOTER
        // ============================
        doc.font('Georgia')
            .fontSize(sizes.dept)
            .fillColor('#4169E1');

        doc.text('Department of Electronics Engineering', 0, yAfterLogo, {
            align: 'center',
            width: pageWidth
        });

        doc.font('Georgia-Bold')
            .fontSize(sizes.rest)
            .fillColor('#DC143C');

        doc.text('Walchand College of Engineering, Sangli', 0, yAfterLogo + 30, {
            align: 'center',
            width: pageWidth
        });

        const year = project.createdAt
            ? new Date(project.createdAt).getFullYear()
            : new Date().getFullYear();

        doc.font('Georgia-Bold')
            .fontSize(20)
            .fillColor('#000');

        doc.text(year.toString(), 0, yAfterLogo + 65, {
            align: 'center',
            width: pageWidth
        });

        doc.end();

    } catch (err) {
        console.error("Certificate generation error:", err);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Internal server error while generating PDF"
            });
        }
    }
};
