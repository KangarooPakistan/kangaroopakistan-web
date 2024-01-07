import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        const {email , password, role} = reqBody;
        console.log(reqBody)
        const userExists = await db.user.findUnique({
            where: {
                email: reqBody.email
            }
        })
        if(userExists){
            return NextResponse.json({error: "User Already Exists"}, {status: 400})
        }
        // hash password
        
            const salt  = await bcrypt.genSalt(10)
            const hashedPassword  = await bcrypt.hash(password, salt)
            
            const user = await db.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role
                }
        });
        return NextResponse.json(user)

    }catch(error: any){
        return NextResponse.json({error: error.message},
            {status: 500}
            )
    }
}