import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import zlib from "zlib";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Convert Buffer to Uint8Array for compatibility with Response API
    const compressedUint8 = new Uint8Array(compressedData);

    return new NextResponse(compressedUint8, {
      status: 200,
      headers: {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
