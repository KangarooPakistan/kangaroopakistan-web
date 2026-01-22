import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    // Fetch schools that are on hold for this contest
    const schoolsOnHold = await db.resultHold.findMany({
      where: {
        contestId: params.contestId,
        hold: true,
      },
    });

    // Get school details from UserNew table
    const schoolIds = schoolsOnHold.map(record => record.schoolId);
    
    const schoolDetails = await db.user.findMany({
      where: {
        schoolId: {
          in: schoolIds,
        },
      },
      select: {
        schoolId: true,
        schoolName: true,
        district: true,
        districtName: true,
        schoolAddress: true,
        contactNumber: true,
        email: true,
      },
    });

    // Create a map for quick lookup
    const schoolDetailsMap = new Map(
      schoolDetails.map(school => [school.schoolId, school])
    );

    // Transform the data for Excel export
    const schoolsData = schoolsOnHold.map((record) => {
      const schoolInfo = schoolDetailsMap.get(record.schoolId);
      return {
        schoolId: record.schoolId,
        schoolName: schoolInfo?.schoolName || "Unknown",
        district: schoolInfo?.districtName || schoolInfo?.district || "Unknown",
        schoolAddress: schoolInfo?.schoolAddress || "Unknown",
        contactNumber: schoolInfo?.contactNumber || "Unknown",
        email: schoolInfo?.email || "Unknown",
        holdStatus: record.hold ? "On Hold" : "Released",
        holdUpdatedAt: record.updatedAt,
      };
    });

    return NextResponse.json(schoolsData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching schools on hold:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools on hold" },
      { status: 500 }
    );
  }
}