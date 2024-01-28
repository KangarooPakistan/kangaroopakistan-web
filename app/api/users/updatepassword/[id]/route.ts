import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id; // Assuming you pass the user ID as a query parameter
    const reqBody = await request.json();
    const { currentPassword, newPassword } = reqBody; // Get the current and new passwords from the request body


    console.log(reqBody)
    // Find the user by ID
    const user = await db.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    // Check if the user exists
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the current password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    const updatedUser = await db.user.update({
      where: {
        id: Number(id),
      },
      data: {
        password: hashedPassword, // Update the password field with the hashed new password
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
