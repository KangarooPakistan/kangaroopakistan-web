import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';

interface UserData {
  email: string;
  password?: string; // Password is optional for editing
  role: string;
  contactNumber?: string | null; // Optional field
  schoolId?: number | null; // Optional field
  schoolName?: string | null; // Optional field
}

export async function PUT(request: NextRequest,
  { params }: { params: { id: number } }) {
  try {
    const reqBody = await request.json();
    const { email, password, role, schoolId, schoolName, contactNumber } = reqBody;
    const userIdToUpdate = params.id; // Assuming you have the user's ID in the route

    // Check if the user exists
    const userExists = await db.user.findUnique({
      where: {
        id: userIdToUpdate,
      },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user's data
    const updatedUserData: UserData = {
      email,
      role,
      contactNumber: contactNumber || null, // Use null if not provided
      schoolId: schoolId || null, // Use null if not provided
      schoolName: schoolName || null, // Use null if not provided
    };

    if (password) {
      // If a new password is provided, hash and update it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedUserData.password = hashedPassword;
    }

    // Update the user in the database
    const updatedUser = await db.user.update({
      where: {
        id: userIdToUpdate,
      },
      data: updatedUserData,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
