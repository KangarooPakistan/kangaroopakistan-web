import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import puppeteer from 'puppeteer';


// Assuming PDFDocument from 'pdf-lib' is used for combining PDFs if necessary
import { PDFDocument } from 'pdf-lib';

interface Student {
    rollNumber: string;
    studentName: string;
    fatherName: string;
    studentLevel: string;
    studentClass: string;
    schoolName: string | null;
    address: string | null;
    districtCode: string | null;
    schoolId: number;
}

export async function GET(request: Request, { params }: { params: { registrationId: string } }) {
    try {
        // Your database query and data manipulation here
        // ...
        const studentsArray: Student[] = []; // Assume this is filled from your database logic

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
            console.log(registrations)
        

            // Loop through registrations
            for (const registration of registrations) {
              const { user, students } = registration;
                    console.log(students)
              const { district, schoolName, schoolAddress, schoolId } = user;
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
                  schoolId,
                  schoolName, // Use extracted schoolName
                  address: schoolAddress, // Use extracted schoolAddress
                  districtCode: district // Use extracted district
                };
        
                studentsArray.push(studentObj);
              }
            }
        if (studentsArray.length === 0) {
            throw new Error("No students found for this registration.");
        }
        const combinedPdfBuffer = await generatePdf(studentsArray);
        return new Response(combinedPdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="students_${params.registrationId}.pdf"`
            }
        });
    } catch (error:any) {
        return new Response(JSON.stringify({ message: error.message }), { status: 400 });
    }
}

async function generatePdf(students: Student[]) {
        let browser;
        try {
                console.log('----------------------------');
                browser = await puppeteer.launch({
                        executablePath: "/usr/bin/chromium-browser",
                args: [
                        "--proxy-server=34.236.95.111:3000",
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-accelerated-2d-canvas",
                        "--no-first-run",
                        "--no-zygote",
                        "--single-process",
                        "--disable-gpu",
                ],
                headless: true,
                timeout: 60000000,
        });

            console.log('----------------------------');
            const combinedPdfDoc = await PDFDocument.create();

            for (const student of students) {
                let page;
                try {
                        page = await browser.newPage();
                        console.log(student);
                        const htmlContent = generateHTMLForPuppeteerFunction([student]); // Assuming this should be for each student
                        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 0 }); // Set timeout as needed
                        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
                        const studentPdfDoc = await PDFDocument.load(pdfBuffer);
                        const [copiedPage] = await combinedPdfDoc.copyPages(studentPdfDoc, [0]);
                        combinedPdfDoc.addPage(copiedPage);
            } catch (err) {
                    console.error(`Error processing student ${student.rollNumber}: ${err}`);
            } finally {
                    if (page) await page.close();
            }
        }

            const pdfBytes = await combinedPdfDoc.save();
            return pdfBytes;
    } catch (err) {
            console.error(`An error occurred: ${err}`);
            throw new Error('Failed to generate PDF'); // Propagate error or handle as needed
    } finally {
            if (browser) await browser.close();
    }
}


function generateHTMLForPuppeteerFunction(students: Student[]) {
        // Start of HTML content
        let htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>International Kangaroo Mathematics Contest - Answer Sheet</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    margin: 0;
                    background-color: #fff;
                }
                .page-break {
                        page-break-after: always;
                        margin-top: 1rem; /* Add some top margin if needed */
                        clear: both;
                        display: block;
                    }
                .inst-box {
                border: 1px solid black;
                padding: 10px;
                margin-bottom: 20px;
                }
                      
                .option-text {
                font-size: 10px;
                }
                      
                .correct-box{      
                display: flex;
                flex-direction: row;
                align-items: center;
                
                margin-bottom: 5px;
                }
                .wrong-box {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: flex-end;
                        margin-bottom: 5px;
                }
                      
                .answer-row-inst {
                display: flex;
                flex-wrap: wrap;
                }
                      
                .option-box {
                width: 14px;
                height: 14px;
                border: 1px solid black;
                border-radius: 50%;
                margin-right: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                }
                      
                .correct-filling {
                background-color: blue !important;
                }
                
                .wrong-box .option-box:first-child {
                position: relative;
                }
                .wrong-box .option-box:second-child {
                        position: relative;
                        }
                      
                .cross {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                }
                      
                .cross-line,
                .cross-line-reverse {
                position: absolute;
                width: 100%;
                height: 2px;
                background-color: blue;
                }
                      
                .cross-line {
                transform: rotate(-45deg);
                }
                
                .cross-line-reverse {
                transform: rotate(45deg);
                }              
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h1, .header p {
                    margin: 0;
                }
                .info-section {
                    margin-bottom: 15px;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 5px;
                }
                .info-title {
                    min-width: 140px;
                    font-weight: bold;
                }
                .info-content {
                    flex: 1;
                }
                .answer-grid {
                    display: grid;
                    grid-template-columns: repeat(3, auto); /* Adjust based on your layout needs */
                    gap: 20px;
                    margin-bottom: 10px;
                }
                .question-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .question-cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 10px;
                    font-size: 20px;
                     /* Space between question number and options */
                }
                .answer-cell {
                    display: flex;
                }
                .answer-cell span {
                    display: inline-block;
                    width: 25px;
                    height: 25px;
                    line-height: 25px;
                    border: 3px solid black;
                    text-align: center;
                    border-radius: 50%;
                    font-size: 20px;
                    margin: 2px;
                }
                .correct-answer {
                    background-color: black;
                    color: white;
                }
                .answer-box{
                        border: 3px solid black;
                }
                .optionTextWrong: {
                        fontSize: 10px,
                        position: relative,
                        zIndex: 1,
                }
                .tick {
                        position: absolute;
                        width: 12px; /* Adjust based on the size of your option box */
                        height: 6px; /* Adjust based on the size of your option box */
                        border-left: 2px solid blue; /* Color of the tick */
                        border-bottom: 2px solid blue; /* Color of the tick */
                        transform: translate(-50%, -50%) rotate(-45deg);
                        top: 50%;
                        left: 50%;
                }
                .halfbox {
                        width: 24px; /* Adjust this to match the diameter of your option boxes */
                        height: 15px; /* Half of the option-box height for the half-filled effect */
                        background-color: black; /* Or any color you want for the fill */
                        position: absolute;
                        top: 50%; /* Centers vertically in the option box, adjust as needed */
                        left: 40%; /* Shift to the middle of two boxes */
                        transform: translateX(-50%) translateY(-50%) scale(1, 0.5); /* Adjusts the position and scale */
                        z-index: 1; /* Makes sure the half box is above the line connecting B and C */
                }
                        
                .gradient-box {
                        position: relative; /* New class for the container of the option boxes and half box */
                        display: flex;
                        align-items: center;
                }
                        
                .line-connector {
                height: 2px; /* Height of the line */
                background-color: black; /* Color of the line */
                flex-grow: 1; /* Ensures the line fills the space between circles */
                position: relative;
                top: 50%; /* Adjust if needed to align with the middle of the circles */
                z-index: 0; /* Ensures the line is below the half-filled box */
                }
                        
                </style>
            </head>
            <body>`;
    
        // Iterate over students array to create PDF for each student
        students.forEach(student => {
            // Determine the number of questions based on student level
            const numberOfQuestions = (student.studentLevel === 'preecolier' || student.studentLevel === 'ecolier') ? 24 : 30;
    
            // Student information section
            htmlContent += `
                <div class="header">
                    <h3>INTERNATIONAL KANGAROO MATHEMATICS CONTEST</h3>
                    <p>Answer Sheet</p>
                    <p>${student.studentLevel.toUpperCase()} (CLASS ${student.studentClass})</p>
                </div>
                <div class="info-section">
                    <div class="info-row"><div class="info-title">Roll No:</div><div class="info-content">${student.rollNumber}</div></div>
                    <div class="info-row"><div class="info-title">Student Name:</div><div class="info-content">${student.studentName}</div></div>
                    <div class="info-row"><div class="info-title">Father Name:</div><div class="info-content">${student.fatherName}</div></div>
                    <div class="info-row"><div class="info-title">Class/Grade:</div><div class="info-content">${student.studentClass}</div></div>
                    <div class="info-row"><div class="info-title">School Name:</div><div class="info-content">${student.schoolName || ''}</div></div>
                    <div class="info-row"><div class="info-title">District:</div><div class="info-content">${student.districtCode || ''}</div></div>
                    <!-- Add more student information if necessary -->
                </div>
                <div class="inst-box">
                        <p class="option-text">
                        Choose only one of the five proposed answers [A,B,C,D,E] and fill in
                        the box with your answer. Example of correctly filled table of
                        answer is.
                        </p>
                        <div class="correct-box">
                                <div class="answer-row-inst">
                                        <div class="option-box">
                                                <p class="option-text">A</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">B</p>
                                        </div>
                                        <div class="option-box correct-filling"></div>
                                        <div class="option-box">
                                                <p class="option-text">D</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">E</p>
                                        </div>
                                </div>
                                <p class="option-text">Correct filling</p>
                        </div>
                        <div class="wrong-box">
                                <div class="answer-row-inst">
                                        <div class="option-box">
                                                <p class="option-text">A</p>
                                                <div class="cross">
                                                        <div class="cross-line"></div>
                                                        <div class="cross-line-reverse"></div>
                                                </div>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">B</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">C</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">D</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">E</p>
                                        </div>
                                </div>
                                <p class="option-text">Wrong filling</p>
                        </div>
                        <div class="wrong-box">
                                <div class="answer-row-inst">
                                        <div class="option-box">
                                                <p class="option-text">A</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">B</p>
                                                <div class="tick"></div>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">C</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">D</p>
                                        </div>
                                        <div class="option-box">
                                                <p class="option-text">E</p>
                                        </div>
                                </div>
                                <p class="option-text">Wrong filling</p>
                        </div>  
                        <div class="wrong-box">
                                <div class="answer-row-inst">
                                        <div class="option-box">
                                        <p class="option-text">A</p>
                                        </div>
                                        <div class="gradient-box"> <!-- New container for B, half-box, and C -->
                                        <div class="option-box">
                                                <p class="option-text">B</p>
                                        </div>
                                        <div class="halfbox"></div> <!-- The half-filled box -->
                                        <div class="option-box">
                                                <p class="option-text">C</p>
                                        </div>
                                        </div>
                                        <div class="line-connector"></div> <!-- Line connecting B and C -->
                                        <div class="option-box">
                                        <p class="option-text">D</p>
                                        </div>
                                        <div class="option-box">
                                        <p class="option-text">E</p>
                                        </div>
                                </div>
                                <p class="option-text">Wrong filling</p>
                        </div>
                </div>`
                ;
    
            // Questions section
            htmlContent += `<div class="answer-box"><div class="answer-grid">`;
            for (let i = 1; i <= numberOfQuestions; i++) {
                htmlContent += `
                    <div class="question-row">
                        <div class="question-cell">${i}</div>
                        <div class="answer-cell"><span>A</span></div>
                        <div class="answer-cell"><span>B</span></div>
                        <div class="answer-cell"><span>C</span></div>
                        <div class="answer-cell"><span>D</span></div>
                        <div class="answer-cell"><span>E</span></div>
                    </div>`;
            }
            htmlContent += `</div></div><div class="page-break"></div>`; // Close answer-box and answer-grid divs
        });
    
        // End of HTML content
        htmlContent += `</body></html>`;
    
        return htmlContent;
    }
