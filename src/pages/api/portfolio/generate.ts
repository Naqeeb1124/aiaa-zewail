import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, studentId, joined, points, badges, projects } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const doc = new PDFDocument({
            margin: 0, // Custom margins manually
            size: 'A4',
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=portfolio-${name.replace(/\s+/g, '-')}.pdf`);

        doc.pipe(res);

        // --- Colors ---
        const deepBlue = '#2b4b77'; // AIAA Blue (Updated)
        const sectionBlue = '#1e293b'; // Slightly lighter blue for text/sections
        const zewailCyan = '#00a7e1'; // Zewail cyan
        const white = '#FFFFFF';
        const greyText = '#94a3b8';

        // --- Header Background ---
        doc.rect(0, 0, doc.page.width, 160).fill(deepBlue);

        // --- Header Content ---
        // Logo
        const logoPath = path.join(process.cwd(), 'aiaa-zewail-logo.png');
        if (fs.existsSync(logoPath)) {
             // Place logo inside the header (2x bigger: 160px width)
            doc.image(logoPath, 50, 40, { width: 160 });
        } else {
            // Fallback text if image missing
            doc.fillColor(white).fontSize(20).font('Helvetica-Bold').text('AIAA ZC', 50, 60);
        }

        // Title (Shifted right to X=230 to avoid overlap with the 160px wide logo)
        doc.fillColor(white).fontSize(30).font('Helvetica-Bold').text('Member Portfolio', 230, 55);
        doc.fillColor(zewailCyan).fontSize(12).font('Helvetica').text('AIAA Student Branch - Zewail City', 230, 90);

        // Generated Date (Moved to bottom right of header to avoid overlap)
        doc.fillColor(greyText).fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, 400, 130, { align: 'right', width: 150 });

        // --- Body Content ---
        const startY = 200;
        const leftMargin = 50;
        const rightColX = 350;

        // --- Personal Info Section ---
        doc.fillColor(deepBlue).fontSize(18).font('Helvetica-Bold').text('Personal Information', leftMargin, startY);
        doc.rect(leftMargin, startY + 25, 500, 2).fill(zewailCyan); // Underline

        const infoY = startY + 50;

        // Left Column: Name & Email
        doc.fillColor(greyText).fontSize(10).font('Helvetica-Bold').text('FULL NAME', leftMargin, infoY);
        doc.fillColor(sectionBlue).fontSize(14).font('Helvetica').text(name, leftMargin, infoY + 15);

        doc.fillColor(greyText).fontSize(10).font('Helvetica-Bold').text('EMAIL', leftMargin, infoY + 50);
        doc.fillColor(sectionBlue).fontSize(14).font('Helvetica').text(email || 'N/A', leftMargin, infoY + 65);

        // Right Column: Student ID & Member Since (Aligned to the right side of the page)
        // We use rightColX as start, but we can also align text to right if we define a width.
        // Let's stick to the requested "far right" visual placement.
        
        doc.fillColor(greyText).fontSize(10).font('Helvetica-Bold').text('STUDENT ID', rightColX, infoY);
        doc.fillColor(sectionBlue).fontSize(14).font('Helvetica').text(studentId || 'N/A', rightColX, infoY + 15);

        doc.fillColor(greyText).fontSize(10).font('Helvetica-Bold').text('MEMBER SINCE', rightColX, infoY + 50);
        doc.fillColor(sectionBlue).fontSize(14).font('Helvetica').text(joined, rightColX, infoY + 65);

        // --- Stats Box ---
        const statsY = infoY + 120;
        doc.rect(leftMargin, statsY, 500, 80).fill('#f1f5f9'); // Light grey bg
        
        // Centered points in the box
        doc.fillColor(zewailCyan).fontSize(36).font('Helvetica-Bold').text(points, leftMargin, statsY + 15, { width: 500, align: 'center' });
        doc.fillColor(sectionBlue).fontSize(10).font('Helvetica-Bold').text('CONTRIBUTION POINTS', leftMargin, statsY + 55, { width: 500, align: 'center' });

        // --- Projects Section ---
        let currentY = statsY + 120;

        if (projects && projects.length > 0) {
            doc.fillColor(deepBlue).fontSize(18).font('Helvetica-Bold').text('Active Projects', leftMargin, currentY);
            doc.rect(leftMargin, currentY + 25, 500, 2).fill(zewailCyan);
            currentY += 50;

            projects.forEach((proj: any) => {
                doc.fillColor(sectionBlue).fontSize(14).font('Helvetica-Bold').text(proj.name, leftMargin, currentY);
                doc.fillColor(greyText).fontSize(12).font('Helvetica').text(`${proj.role} • ${proj.status}`, leftMargin, currentY + 20);
                currentY += 50;
            });
            currentY += 20;
        }

        // --- Badges Section ---
        if (badges && badges.length > 0) {
            doc.fillColor(deepBlue).fontSize(18).font('Helvetica-Bold').text('Badges & Achievements', leftMargin, currentY);
            doc.rect(leftMargin, currentY + 25, 500, 2).fill(zewailCyan);
            currentY += 50;
            
            badges.forEach((badge: any) => {
                doc.fillColor(sectionBlue).fontSize(12).font('Helvetica').text(`• ${badge.name}`, leftMargin, currentY);
                currentY += 20;
            });
        }

        // --- Footer ---
        const pageHeight = doc.page.height;
        const footerHeight = 50;
        doc.rect(0, pageHeight - footerHeight, doc.page.width, footerHeight).fill(deepBlue);
        doc.fillColor(white).fontSize(10).text('AIAA Student Branch - Zewail City of Science & Technology', 0, pageHeight - 35, { align: 'center', width: doc.page.width });

        doc.end();
    } catch (error) {
        console.error('Error generating portfolio:', error);
        res.status(500).json({ message: 'Error generating portfolio PDF' });
    }
}