import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const updatesLogs = await db.updates.findMany();

    return NextResponse.json(updatesLogs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      "There was some error while fetching logs, Please try again later",
      { status: 500 }
    );
  }
}
