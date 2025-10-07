import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const { imageUrl } = reqBody;
    const notificationImage = await db.notification.create({
      data: {
        imageUrl: imageUrl,
      },
    });

    return NextResponse.json(notificationImage, { status: 200 });
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
export async function GET(request: Request) {
  try {
    const notification = await db.notification.findFirst({
      orderBy: {
        id: "desc", // Assuming 'createdAt' is the timestamp field
      },
    });
    console.log(notification);

    if (!notification) {
      return NextResponse.json(
        { message: "No Notifications found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "No Notifications found" },
      { status: 404 }
    );
  }
}
