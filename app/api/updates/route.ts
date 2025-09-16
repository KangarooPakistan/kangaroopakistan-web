import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build where condition for search
    const whereCondition = search ? {
      OR: [
        { schoolName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { contestName: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { type: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get total count for pagination
    const totalCount = await db.updates.count({
      where: whereCondition,
    });

    // Fetch paginated updates
    const updatesLogs = await db.updates.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const updatedUpdates = await db.$transaction(async (prisma) => {
      return Promise.all(
        updatesLogs.map(async (update) => {
          if (update.students) {
            const studentIds = update.students as number[];
            const students = await prisma.student.findMany({
              where: {
                id: {
                  in: studentIds,
                },
              },
            });
            return { ...update, students };
          }
          return update;
        })
      );
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: updatedUpdates,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      {
        message:
          "There was some error while fetching logs, Please try again later",
      },
      { status: 500 }
    );
  }
}
