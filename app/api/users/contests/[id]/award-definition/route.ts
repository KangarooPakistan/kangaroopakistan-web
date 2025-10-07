// app/api/contests/[contestId]/award-definitions/route.ts
import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Schema for validation
const awardDefinitionSchema = z
  .object({
    level: z.enum(["JUNIOR", "SENIOR"]),
    goldPercent: z.number().min(0).max(100),
    silverPercent: z.number().min(0).max(100),
    bronzePercent: z.number().min(0).max(100),
    threeStarPercent: z.number().min(0).max(100),
    twoStarPercent: z.number().min(0).max(100),
    oneStarPercent: z.number().min(0).max(100),
    participationPercent: z.number().min(0).max(100),
  })
  .refine(
    (data) => {
      const percentages = [
        data.goldPercent,
        data.silverPercent,
        data.bronzePercent,
        data.threeStarPercent,
        data.twoStarPercent,
        data.oneStarPercent,
        data.participationPercent,
      ];

      for (let i = 0; i < percentages.length - 1; i++) {
        if (percentages[i] <= percentages[i + 1]) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Percentages must be in descending order",
    }
  );

// GET handler
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const awardDefinitions = await db.awardDefinition.findMany({
      where: {
        contestId: params.id,
      },
    });

    return NextResponse.json(awardDefinitions);
  } catch (error) {
    console.error("Error fetching award definitions:", error);
    return NextResponse.json(
      { message: "Error fetching award definitions" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("request.json");
    const reqBody = await request.json();
    // const { email } = reqBody;
    console.log(reqBody);

    // Validate the request body
    const validatedData = awardDefinitionSchema.parse(reqBody);
    console.log(validatedData);

    // Check if definition already exists
    const existingDefinition = await db.awardDefinition.findUnique({
      where: {
        contestId_level: {
          contestId: params.id,
          level: validatedData.level,
        },
      },
    });

    if (existingDefinition) {
      return NextResponse.json(
        { message: "Award definition already exists for this level" },
        { status: 400 }
      );
    }

    // Create new award definition
    const awardDefinition = await db.awardDefinition.create({
      data: {
        contestId: params.id,
        level: validatedData.level,
        goldPercent: validatedData.goldPercent,
        silverPercent: validatedData.silverPercent,
        bronzePercent: validatedData.bronzePercent,
        threeStarPercent: validatedData.threeStarPercent,
        twoStarPercent: validatedData.twoStarPercent,
        oneStarPercent: validatedData.oneStarPercent,
        participationPercent: validatedData.participationPercent,
      },
    });

    return NextResponse.json(awardDefinition, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error);
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating award definition:", error);
    return NextResponse.json(
      { message: "Error creating award definition" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = { ...json, id: params.id };

    // Validate the request body
    const validatedData = awardDefinitionSchema.parse(body);

    // Check if definition exists
    const existingDefinition = await db.awardDefinition.findUnique({
      where: {
        contestId_level: {
          contestId: params.id,
          level: validatedData.level,
        },
      },
    });

    if (!existingDefinition) {
      return NextResponse.json(
        { message: "Award definition not found" },
        { status: 404 }
      );
    }

    // Update award definition
    const updatedDefinition = await db.awardDefinition.update({
      where: {
        contestId_level: {
          contestId: params.id,
          level: validatedData.level,
        },
      },
      data: {
        goldPercent: validatedData.goldPercent,
        silverPercent: validatedData.silverPercent,
        bronzePercent: validatedData.bronzePercent,
        threeStarPercent: validatedData.threeStarPercent,
        twoStarPercent: validatedData.twoStarPercent,
        oneStarPercent: validatedData.oneStarPercent,
        participationPercent: validatedData.participationPercent,
      },
    });

    return NextResponse.json(updatedDefinition);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating award definition:", error);
    return NextResponse.json(
      { message: "Error updating award definition" },
      { status: 500 }
    );
  }
}
