import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const updatesLogs = await db.updates.findMany({
      orderBy: {
        createdAt: "desc", // Order by roll number in descending order to get the last student
      },
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

    console.log(updatedUpdates);

    return NextResponse.json(updatedUpdates, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      "There was some error while fetching logs, Please try again later",
      { status: 500 }
    );
  }
}
