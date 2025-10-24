import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contestId = searchParams.get("contestId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!contestId) {
      return NextResponse.json(
        { message: "Contest ID is required" },
        { status: 400 }
      );
    }

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { message: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Parse the dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { message: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Convert dates to Pakistan Time (UTC+5)
    // Set start date to 00:00:00 Pakistan Time
    const pkStartDate = new Date(startDate);
    pkStartDate.setHours(0, 0, 0, 0);
    // Convert to UTC by subtracting 5 hours
    const utcStartDate = new Date(pkStartDate.getTime() - 5 * 60 * 60 * 1000);

    // Set end date to 23:59:59 Pakistan Time
    const pkEndDate = new Date(endDate);
    pkEndDate.setHours(23, 59, 59, 999);
    // Convert to UTC by subtracting 5 hours
    const utcEndDate = new Date(pkEndDate.getTime() - 5 * 60 * 60 * 1000);

    console.log("Fetching receipts for contest:", contestId);
    console.log("Date range:", {
      startDatePK: pkStartDate.toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
      }),
      endDatePK: pkEndDate.toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
      }),
      utcStartDate: utcStartDate.toISOString(),
      utcEndDate: utcEndDate.toISOString(),
    });

    // Fetch payment proofs within the date range for specific contest
    const paymentProofs = await (db as any).paymentProof.findMany({
      where: {
        createdAt: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
        registration: {
          contestId: contestId,
        },
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                schoolId: true,
                schoolName: true,
                email: true,
                contactNumber: true,
              },
            },
            contest: {
              select: {
                id: true,
                name: true,
                contestCh: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${paymentProofs.length} receipts for contest ${contestId}`);

    if (paymentProofs.length === 0) {
      return NextResponse.json(
        {
          message: "No receipts found for the selected date range and contest",
          data: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(paymentProofs, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching payment proofs:", error);
    return NextResponse.json(
      {
        message: "Error fetching payment receipts",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
