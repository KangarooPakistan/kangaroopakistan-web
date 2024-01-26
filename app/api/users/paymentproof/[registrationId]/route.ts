import { NextResponse } from "next/server";

export async function GET(request: Request, 
    { params }: { params: { registrationId: string } }){
        console.log(params.registrationId)
        try {
            
            return NextResponse.json(params.registrationId,  { status: 200 });
        } catch (error) {
            return NextResponse.json(params.registrationId,  { status: 400 });
            
        }

    }