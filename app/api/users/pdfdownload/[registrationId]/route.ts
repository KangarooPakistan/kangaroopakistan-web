import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from 'pdf-lib';

interface Student {
    rollNumber: string;
    studentName: string;
    fatherName: string;
    studentLevel: string;
    studentClass: string; // Changed from `class` to `studentClass`
    schoolName: string | null;
    address: string | null;
    districtCode: string | null;
    
  }
  export async function GET(request: Request,
    { params }: { params: { registrationId: string } }) {
    console.log(params.registrationId)
    try {
        const registrations = await db.registration.findMany({
            where: {
                id: params.registrationId
            },
            include: {
                students: true, // Include related students
                user: true, // Include the related user
            },
        });

        const pdfDocs = [];

        for (const registration of registrations) {
            const { user, students } = registration;
            const { district, schoolName, schoolAddress } = user;

            for (const student of students) {
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const fontSize = 12;
                let yOffset = height - 30;

                const {
                    rollNumber,
                    studentName,
                    fatherName,
                    level: studentLevel,
                    class: studentClass
                } = student;

                const text = `Roll Number: ${rollNumber}, Name: ${studentName}, Father's Name: ${fatherName}, Level: ${studentLevel}, Class: ${studentClass}, School: ${schoolName || 'N/A'}, Address: ${schoolAddress || 'N/A'}, District: ${district || 'N/A'}`;
                page.drawText(text, {
                    x: 50,
                    y: yOffset,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });

                pdfDocs.push(pdfDoc);
            }
        }

        // Combine all PDF documents into a single document
        const combinedPdfDoc = await PDFDocument.create();
        for (const doc of pdfDocs) {
            const copiedPages = await combinedPdfDoc.copyPages(doc, [0]);
            combinedPdfDoc.addPage(copiedPages[0]);
        }

        // Serialize the combined PDF document to bytes
        const combinedPdfBytes = await combinedPdfDoc.save();

        // Return the combined PDF
        return new Response(combinedPdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=students.pdf',
            },
        });
    } catch (error:any) {
        console.log(error);
        return new Response(error.message, { status: 500 });
    }

    return NextResponse.json({ message: "No students found" }, { status: 404 });
}
