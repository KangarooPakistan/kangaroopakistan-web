import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';

interface UserData {
    email: string;
    password: string;
    role: string;
    contactNumber?: string | null; // Optional field
    schoolId?: number  | null;     // Optional field
    schoolName?: string  | null;   // Optional field
  }
export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        const {email , password, role, schoolId, schoolName, contactNumber} = reqBody;
        console.log(reqBody)
        const userExists = await db.user.findUnique({
            where: {
                email: reqBody.email
            }
        })
        if(userExists){
            return NextResponse.json({error: "User Already Exists"}, {status: 400})
        }
        if (schoolId) {
            const idExists = await db.user.findFirst({
              where: {
                schoolId: {
                  equals: schoolId,
                },
              },
            });
            if(idExists){
                return NextResponse.json({error: "Id  Already Assigned to another school"}, {status: 400})
            }
        }
        
        

        // hash password
        
            const salt  = await bcrypt.genSalt(10)
            const hashedPassword  = await bcrypt.hash(password, salt)
            const userData: UserData  = {
                email,
                    password: hashedPassword,
                    role,
                    contactNumber: contactNumber || null, // Use null if not provided
                    schoolId: schoolId || null,           // Use null if not provided
                    schoolName: schoolName || null,       // Use null if not provided
              };
             
            const user = await db.user.create({
                data: userData,
        });
        return NextResponse.json(user)

    }catch(error: any){
        return NextResponse.json({error: error.message},
            {status: 500}
            )
    }
}