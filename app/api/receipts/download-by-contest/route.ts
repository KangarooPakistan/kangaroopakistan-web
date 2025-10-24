import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Function to extract timestamp from filename
const extractTimestampFromUrl = (url: string): Date | null => {
  try {
    // Extract filename from URL
    // Example: https://bucket.s3.region.amazonaws.com/filename_1234567890.jpg
    const filename = url.split("/").pop() || "";

    // Extract timestamp from filename (format: originalname_timestamp.extension)
    const match = filename.match(/_(\d{13})\./);

    if (match && match[1]) {
      const timestamp = parseInt(match[1], 10);
      return new Date(timestamp);
    }

    return null;
  } catch (error) {
    console.error("Error extracting timestamp from URL:", error);
    return null;
  }
};

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
    const pkStartDate = new Date(startDate);
    pkStartDate.setHours(0, 0, 0, 0);
    const utcStartDate = new Date(pkStartDate.getTime() - 5 * 60 * 60 * 1000);

    const pkEndDate = new Date(endDate);
    pkEndDate.setHours(23, 59, 59, 999);
    const utcEndDate = new Date(pkEndDate.getTime() - 5 * 60 * 60 * 1000);

    console.log("Fetching receipts for contest:", contestId);
    console.log("Date range (UTC):", {
      start: utcStartDate.toISOString(),
      end: utcEndDate.toISOString(),
    });

    // Get all registrations for this contest
    const registrations = await db.registration.findMany({
      where: {
        contestId: contestId,
      },
      select: {
        id: true,
        contestId: true,
        schoolId: true,
        schoolName: true,
        registeredBy: true,
        createdAt: true,
      },
    });

    if (registrations.length === 0) {
      return NextResponse.json(
        {
          message: "No registrations found for this contest",
          data: [],
        },
        { status: 200 }
      );
    }

    const registrationIds = registrations.map((r) => r.id);

    // Fetch all payment proofs for these registrations
    const paymentProofs = await db.paymentProof.findMany({
      where: {
        registrationId: {
          in: registrationIds,
        },
      },
    });

    console.log(`Found ${paymentProofs.length} total payment proofs`);

    // Filter payment proofs by timestamp extracted from URL
    const filteredPaymentProofs = paymentProofs.filter((proof: any) => {
      const uploadDate = extractTimestampFromUrl(proof.imageUrl);

      if (!uploadDate) {
        console.warn(`Could not extract timestamp from URL: ${proof.imageUrl}`);
        return false;
      }

      return uploadDate >= utcStartDate && uploadDate <= utcEndDate;
    });

    console.log(
      `Found ${filteredPaymentProofs.length} receipts within date range`
    );

    if (filteredPaymentProofs.length === 0) {
      return NextResponse.json(
        {
          message: "No receipts found for the selected date range and contest",
          data: [],
        },
        { status: 200 }
      );
    }

    // Get unique user IDs - Using Array.from instead of spread operator
    const userIdsSet = new Set(registrations.map((r) => r.registeredBy));
    const userIds = Array.from(userIdsSet);

    // Fetch users
    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        schoolId: true,
        schoolName: true,
        email: true,
        contactNumber: true,
        district: true,
        city: true,
      },
    });

    // Fetch contest
    const contest = await db.contest.findUnique({
      where: {
        id: contestId,
      },
      select: {
        id: true,
        name: true,
        contestCh: true,
      },
    });

    // Create maps
    const registrationMap = new Map(registrations.map((r) => [r.id, r]));
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Enrich data and sort by upload date (descending)
    const enrichedPaymentProofs = filteredPaymentProofs
      .map((proof) => {
        const registration = registrationMap.get(proof.registrationId);
        const user = registration
          ? userMap.get(registration.registeredBy)
          : null;
        const uploadDate = extractTimestampFromUrl(proof.imageUrl);

        return {
          proof,
          registration,
          user,
          uploadDate,
        };
      })
      .sort((a, b) => {
        // Sort by upload date descending (newest first)
        if (!a.uploadDate || !b.uploadDate) return 0;
        return b.uploadDate.getTime() - a.uploadDate.getTime();
      })
      .map(({ proof, registration, user, uploadDate }, index) => {
        return {
          "S.No": index + 1,
          "Receipt ID": proof.id,
          "Registration ID": proof.registrationId,
          "School ID": user?.schoolId || registration?.schoolId || "N/A",
          "School Name": user?.schoolName || registration?.schoolName || "N/A",
          "Contest Name": contest?.name || "N/A",
          "Image URL": proof.imageUrl,
          "Upload Date": uploadDate
            ? new Date(uploadDate).toLocaleString("en-PK", {
                timeZone: "Asia/Karachi",
              })
            : "N/A",
          // Raw data for frontend
          id: proof.id,
          imageUrl: proof.imageUrl,
          registrationId: proof.registrationId,
          createdAt: uploadDate,
          registration: {
            id: registration?.id,
            contestId: registration?.contestId,
            schoolId: registration?.schoolId,
            schoolName: registration?.schoolName,
            user: user
              ? {
                  schoolId: user.schoolId,
                  schoolName: user.schoolName,
                  email: user.email,
                  contactNumber: user.contactNumber,
                  district: user.district,
                  city: user.city,
                }
              : null,
            contest: contest,
          },
        };
      });

    return NextResponse.json(
      {
        data: enrichedPaymentProofs,
        contest: contest,
        total: enrichedPaymentProofs.length,
      },
      { status: 200 }
    );
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
