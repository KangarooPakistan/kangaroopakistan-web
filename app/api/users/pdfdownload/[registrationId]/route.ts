import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import PDFDocument from 'pdfkit';



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
            const doc = new PDFDocument({font: 'Courier'});

        // Pipe the PDF document to a buffer
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // You can return the PDF data here or save it to a file
            // For simplicity, let's return the PDF data as JSON response
            return NextResponse.json({ pdfData }, { status: 200 });
        });

        // Populate PDF with student data
        doc.fontSize(12);
        for (const student of studentsArray) {
            doc.text(`Roll Number: ${student.rollNumber}`);
            doc.text(`Student Name: ${student.studentName}`);
            doc.text(`Father's Name: ${student.fatherName}`);
            doc.text(`Student Level: ${student.studentLevel}`);
            doc.text(`Student Class: ${student.studentClass}`);
            doc.text(`School Name: ${student.schoolName}`);
            doc.text(`Address: ${student.address}`);
            doc.text(`District Code: ${student.districtCode}`);
            doc.moveDown(); // Move down for next student
        }

        doc.end(); 
              return NextResponse.json(studentsArray, { status: 200 });
        } catch (error) {
            console.log(error)
            return NextResponse.json(params.registrationId,  { status: 400 });
            
        }

    }