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
    { params }: { params: { registrationId: string } }){
        console.log(params.registrationId)
        try {
            const registrations = await db.registration.findMany({
                where: {
                    id:params.registrationId
                },
                include: {
                    students: true, // Include related students
                    // paymentProof: true, // Include related payment proofs
                    user: true, // Include the related user
                    // Add other related fields if necessary
                },
            });
            console.log('--------------------------------------')
            console.log('--------------------------------------')
            console.log('--------------------------------------')
            console.log(registrations)
            const studentsArray: Student[] = [];

            // Loop through registrations
            for (const registration of registrations) {
              const { user, students } = registration;
        
              const { district, schoolName, schoolAddress } = user;
              for (const student of students) {
                const {
                  rollNumber,
                  studentName,
                  fatherName,
                  level: studentLevel,
                  class: studentClass // Changed to `studentClass`
                } = student;
        
                // Create student object and push to array
                const studentObj: Student = {
                  rollNumber,
                  studentLevel,
                  studentName,
                  fatherName,
                  studentClass,
                  schoolName, // Use extracted schoolName
                  address: schoolAddress, // Use extracted schoolAddress
                  districtCode: district // Use extracted district
                };
        
                studentsArray.push(studentObj);
              }
              console.log(studentsArray)
              console.log("studentsArray")
              console.log(studentsArray.length)
            }
            const pdfDoc = await PDFDocument.create();
            let page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const fontSize = 12;
            let yOffset = height - 30; // Start 30 units from the top
    
            // Loop through each student and add their details to the PDF
            for (const student of studentsArray) {
                const text = `Roll Number: ${student.rollNumber}, Name: ${student.studentName}, Father's Name: ${student.fatherName}, Level: ${student.studentLevel}, Class: ${student.studentClass}, School: ${student.schoolName || 'N/A'}, Address: ${student.address || 'N/A'}, District: ${student.districtCode || 'N/A'}`;
                page.drawText(text, {
                    x: 50,
                    y: yOffset,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });
                yOffset -= 15; // Move down for the next entry
                if (yOffset < 30) { // Check if we need a new page
                    page = pdfDoc.addPage();
                    yOffset = height - 30; // Reset Y Offset
                }
            }
    
            // Serialize the PDF to bytes (a Uint8Array)
            const pdfBytes = await pdfDoc.save();
    
        return new Response(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=students.pdf',
            },
        });
             
              return NextResponse.json(studentsArray, { status: 200 });
        } catch (error) {
            console.log(error)
            return NextResponse.json(params.registrationId,  { status: 400 });
            
        }

    }