import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

interface UserData {
  email: string;
  password: string;
  role: string;
  contactNumber?: string | null; // Optional field
  schoolId: number; // Optional field
  schoolName?: string | null; // Optional field
  district?: string | null; // Optional field
  tehsil?: string | null; // Optional field
  fax?: string | null; // Optional field
  bankTitle?: string | null; // Optional field
  p_Name?: string | null;
  p_fName?: string | null; // Optional field
  p_mName?: string | null; // Optional field
  p_lName?: string | null; // Optional field
  p_contact?: string | null; // Optional field
  p_phone?: string | null; // Optional field
  p_email?: string | null; // Optional field
  c_fName?: string | null; // Optional field
  c_mName?: string | null; // Optional field
  c_lName?: string | null; // Optional field
  c_Name?: string | null;
  c_contact?: string | null; // Optional field
  c_phone?: string | null; // Optional field
  c_email?: string | null; // Optional field
  c_accountDetails?: string | null; // Optional field
  schoolAddress?: string | null; // Optional field
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // Assuming you pass the user ID as a query parameter

    const reqBody = await request.json();
    const {
      email,
      role,
      schoolId,
      schoolName,
      contactNumber,
      district,
      tehsil,
      fax,
      schoolAddress,
      bankTitle,
      p_Name,
      p_fName,
      p_mName,
      p_lName,
      p_contact,
      p_phone,
      p_email,
      c_Name,
      c_fName,
      c_mName,
      c_lName,
      c_contact,
      c_phone,
      c_email,
      c_accountDetails,
    } = reqBody;
    // Check if the user with the specified ID exists
    const existingUser = await db.user.findUnique({
      where: {
        id: id, // Convert the ID to a number (assuming it's a numeric ID)
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user's data
    const updatedUserData: UserData = {
      email,
      password: existingUser.password, // Keep the existing password
      role,
      contactNumber,
      schoolId,
      schoolName,
      district,
      tehsil,
      fax,
      bankTitle,
      schoolAddress,
      p_fName,
      p_Name,
      c_Name,
      p_mName,
      p_lName,
      p_contact,
      p_phone,
      p_email,
      c_fName,
      c_mName,
      c_lName,
      c_contact,
      c_phone,
      c_email,
      c_accountDetails,
    };

    const updatedUser = await db.user.update({
      where: {
        id: id,
      },
      data: updatedUserData,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // Assuming you pass the user ID as a query parameter

    // Check if the user with the specified ID exists
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
