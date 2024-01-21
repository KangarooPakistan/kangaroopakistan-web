import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';

interface UserData {
    email: string;
    password: string;
    role: string;
    contactNumber?: string | null; // Optional field
    schoolId?: string  | null;     // Optional field
    schoolName?: string  | null;   // Optional field
    district?: string  | null;   // Optional field
    tehsil?: string  | null;   // Optional field
    fax?: string  | null;   // Optional field
    bankTitle?: string  | null;   // Optional field
    p_fName?: string  | null;   // Optional field
    p_mName?: string  | null;   // Optional field
    p_lName?: string  | null;   // Optional field
    p_contact?: string  | null;   // Optional field
    p_phone?: string  | null;   // Optional field
    p_email?: string  | null;   // Optional field
    c_fName?: string  | null;   // Optional field
    c_mName?: string  | null;   // Optional field
    c_lName?: string  | null;   // Optional field
    c_contact?: string  | null;   // Optional field
    c_phone?: string  | null;   // Optional field
    c_email?: string  | null;   // Optional field
    c_accountDetails?: string  | null;   // Optional field
  }
export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        const {email , password, role, schoolId, schoolName, contactNumber,district, tehsil,fax , 
            bankTitle,p_fName,p_mName, p_lName ,p_contact, p_phone, p_email , c_fName,c_mName
            ,c_lName, c_contact, c_phone, c_email, c_accountDetails
        } = reqBody;
        console.log(reqBody)
        console.log(typeof schoolId)
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
        
        
            const salt  = await bcrypt.genSalt(10)
            const hashedPassword  = await bcrypt.hash(password, salt)
            const userData: UserData  = {
                email,
                    password: hashedPassword,
                    role,
                    contactNumber: contactNumber || null, // Use null if not provided
                    schoolId: schoolId || null,           // Use null if not provided
                    schoolName: schoolName || null,       // Use null if not provided
                    tehsil: tehsil || null,       // Use null if not provided
                    fax: fax || null,       // Use null if not provided
                    bankTitle: bankTitle || null,       // Use null if not provided
                    p_fName: p_fName || null,       // Use null if not provided
                    p_mName: p_mName || null,       // Use null if not provided
                    p_lName: p_lName || null,       // Use null if not provided
                    p_contact: p_contact || null,       // Use null if not provided
                    p_phone: p_phone || null,       // Use null if not provided
                    p_email: p_email || null,       // Use null if not provided
                    c_fName: c_fName || null,       // Use null if not provided
                    c_mName: c_mName || null,       // Use null if not provided
                    c_lName: c_lName || null,       // Use null if not provided
                    c_contact: c_contact || null,       // Use null if not provided
                    c_phone: c_phone || null,       // Use null if not provided
                    c_email: c_email || null,       // Use null if not provided
                    c_accountDetails: c_accountDetails || null,       // Use null if not provided
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