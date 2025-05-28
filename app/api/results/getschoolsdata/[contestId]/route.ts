import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    // Define the type for the school details
    type SchoolWithDetails = {
      schoolId: number | bigint;
      schoolName: string;
      district: string;
      city: string;
      schoolAddress: string;
      contactNumber: string;
      email: string;
      resultCount: number | bigint;
      juniorBronzeCount: number | bigint;
      seniorBronzeCount: number | bigint;
    };

    // Single raw SQL query to get all school statistics
    const schoolsWithDetails = await db.$queryRaw<SchoolWithDetails[]>`
      SELECT 
        u.schoolId,
        u.schoolName,
        u.district,
        u.city,
        u.schoolAddress,
        u.contactNumber,
        u.email,
        COALESCE(stats.resultCount, 0) as resultCount,
        COALESCE(stats.juniorBronzeCount, 0) as juniorBronzeCount,
        COALESCE(stats.seniorBronzeCount, 0) as seniorBronzeCount
      FROM User u
      INNER JOIN (
        SELECT 
          r.schoolId,
          COUNT(*) as resultCount,
          SUM(CASE WHEN r.AwardLevel = 'BRONZE' AND r.level = 'JUNIOR' THEN 1 ELSE 0 END) as juniorBronzeCount,
          SUM(CASE WHEN r.AwardLevel = 'BRONZE' AND r.level = 'SENIOR' THEN 1 ELSE 0 END) as seniorBronzeCount
        FROM results r
        WHERE r.contestId = ${params.contestId}
        GROUP BY r.schoolId
      ) stats ON u.schoolId = stats.schoolId
      ORDER BY u.schoolName
    `;

    // Serialize BigInt values if any
    const serializedResults = schoolsWithDetails.map(
      (school: {
        schoolId: any;
        resultCount: any;
        juniorBronzeCount: any;
        seniorBronzeCount: any;
      }) => ({
        ...school,
        schoolId: Number(school.schoolId),
        resultCount: Number(school.resultCount),
        juniorBronzeCount: Number(school.juniorBronzeCount),
        seniorBronzeCount: Number(school.seniorBronzeCount),
      })
    );

    return NextResponse.json(serializedResults, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { message: "Error fetching schools" },
      { status: 500 }
    );
  }
}
