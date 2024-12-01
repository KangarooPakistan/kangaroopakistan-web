import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function serializeData(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const result = await db.result.update({
      where: { id: params.id },
      data: {
        AwardLevel: body.AwardLevel,
      },
    });

    // Serialize the result to handle potential BigInt values
    const serializedResult = serializeData(result);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      { message: "Error updating result" },
      { status: 500 }
    );
  }
}
