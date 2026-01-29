import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, eventTitle, date, role, category } = req.body;

    if (!name || !eventTitle || !date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margin: 0
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${name.replace(/\s+/g, '-')}.pdf`);

        doc.pipe(res);

        // --- Colors (Synced with Portfolio) ---
        const deepBlue = '#2b4b77'; // AIAA Blue
        const zewailCyan = '#00a7e1'; // Zewail cyan
        const white = '#FFFFFF';
        const greyText = '#94a3b8';
        const sectionBlue = '#1e293b';

        // --- Background & Border ---
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');

        // Elegant Border
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
            .lineWidth(2)
            .strokeColor(deepBlue)
            .stroke();
            
        doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70)
            .lineWidth(1)
            .strokeColor(zewailCyan)
            .stroke();

        // --- Header Section ---
        doc.rect(0, 0, doc.page.width, 120).fill(deepBlue);

        // Logo
        const logoPath = path.join(process.cwd(), 'aiaa-zewail-logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 25, { width: 140 });
        }

        doc.fillColor(white).fontSize(35).font('Helvetica-Bold').text('CERTIFICATE OF ACHIEVEMENT', 210, 45);
        doc.fillColor(zewailCyan).fontSize(12).font('Helvetica').text('American Institute of Aeronautics and Astronautics - Zewail City', 210, 85);

        // --- Main Content Logic ---
        let mainWording = "has successfully demonstrated outstanding commitment as";
        let contextWording = "during the session";

        if (category === 'project') {
            mainWording = "has successfully contributed as";
            contextWording = "to the technical project";
        } else if (category === 'competition') {
            mainWording = "has successfully achieved the distinction of";
            contextWording = "in the competition";
        } else if (category === 'leadership') {
            mainWording = "has successfully served with excellence as";
            contextWording = "within the organization unit";
        }

        // --- Main Content Rendering ---
        // "This is to certify that"
        doc.fillColor(greyText).fontSize(20).font('Helvetica').text('This is to certify that', 0, 180, { align: 'center' });

        // Name
        doc.fillColor(deepBlue).fontSize(50).font('Helvetica-Bold').text(name, 0, 220, { align: 'center' });

        // Achievement Text (Line 1)
        doc.fillColor(greyText).fontSize(18).font('Helvetica').text(mainWording, 0, 300, { align: 'center' });
        
        // Role
        doc.fillColor(sectionBlue).fontSize(24).font('Helvetica-Bold').text(role || 'Participant', 0, 335, { align: 'center' });

        // Context (Line 2)
        doc.fillColor(greyText).fontSize(18).font('Helvetica').text(contextWording, 0, 375, { align: 'center' });
        
        // Event/Project/Competition Title
        doc.fillColor(deepBlue).fontSize(28).font('Helvetica-Bold').text(eventTitle, 0, 410, { align: 'center' });

        // --- Signature & Date Section ---
        const footerY = 490;
        
        // Date
        doc.rect(100, footerY, 200, 1).fill(greyText);
        doc.fillColor(sectionBlue).fontSize(14).font('Helvetica-Bold').text(new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 100, footerY + 10, { width: 200, align: 'center' });
        doc.fillColor(greyText).fontSize(10).font('Helvetica').text('DATE ISSUED', 100, footerY + 30, { width: 200, align: 'center' });

        // Signature Placeholder
        doc.rect(doc.page.width - 300, footerY, 200, 1).fill(greyText);
        doc.fillColor(sectionBlue).fontSize(14).font('Helvetica-Bold').text('Executive Board', doc.page.width - 300, footerY + 10, { width: 200, align: 'center' });
        doc.fillColor(greyText).fontSize(10).font('Helvetica').text('AIAA ZEWAIL CITY', doc.page.width - 300, footerY + 30, { width: 200, align: 'center' });

        // --- Bottom Bar ---
        doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(deepBlue);
        doc.fillColor(white).fontSize(9).text('AIAA Student Branch - Zewail City of Science & Technology • Official Document', 0, doc.page.height - 25, { align: 'center', width: doc.page.width });

        doc.end();
    } catch (error) {
        console.error('Error generating certificate:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating certificate PDF' });
        }
    }
}
