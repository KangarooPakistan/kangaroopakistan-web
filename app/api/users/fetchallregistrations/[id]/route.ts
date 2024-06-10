import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import zlib from "zlib";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const registrations = await db.registration.findMany({
      where: {
        contestId: params.id,
      },
      include: {
        students: true,
        paymentProof: true,
        user: true, // Include related students
      },
    });

    const json = JSON.stringify(registrations);
    const compressedData = zlib.gzipSync(json);

    return new NextResponse(compressedData, {
      status: 200,
      headers: {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
