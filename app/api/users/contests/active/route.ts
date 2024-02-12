
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";



export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const today = new Date();
  const activeContests = await db.contest.findMany({
    where: {
      endDate: {
        gt: today,
      },
    },
    include: {
      contestType: true, // assuming you want to include details from the ContestType model
    },
  });

    return NextResponse.json(activeContests);
  } catch (error) {
          console.error('Error:', error);
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}



// export async function GET(req: NextRequest, res: NextResponse) {
//   try {
//     const url = new URL(req.url);
//     const contestTypeId = url.searchParams.get("contestTypeId");
    
//     // Optionally, you can validate if contestTypeId is provided
//     if (!contestTypeId) {
//       return NextResponse.json({ error: "Missing contestTypeId" }, { status: 401 });
//     }

//     // Get the current date
//     const currentDate = new Date();

//     // Query the database to get contests with the specified contestTypeId
//     const contests = await db.contest.findMany({
//       where: { 
//         contestTypeId: contestTypeId,
//         endDate: {
//           gte: currentDate, // Filter for contests where endDate is greater than or equal to the current date
//         },
//       },
//     });

//     return NextResponse.json(contests);
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

