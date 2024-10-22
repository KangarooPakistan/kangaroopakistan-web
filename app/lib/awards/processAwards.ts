import { db } from "../prisma";
import { Score, AwardType, Level, AwardCategory } from "@/lib/types";
import { Prisma } from "@prisma/client";

interface StudentAward {
  studentRollNo: string;
  contestId: string;
  schoolId: number;
  districtId: string;
  percentage: Prisma.Decimal | null;
  class: string;
  schoolAward?: AwardType;
  districtAward?: AwardType;
  nationalAward?: AwardType;
}

export async function processAwards(contestId: string) {
  console.log(`Starting award processing for contest ${contestId}`);

  const scores = await db.score.findMany({
    where: { contestId },
    orderBy: { percentage: "desc" },
    include: { contest: true },
  });
  console.log("Sample score percentage:", scores[0]?.percentage?.toString());
  console.log(
    "Sample score percentage as number:",
    scores[0]?.percentage?.toNumber()
  );
  console.log("Sample score percentage type:", typeof scores[0]?.percentage);
  const categories = await db.awardCategory.findMany({
    where: { contestId },
  });

  const schoolAwards = await processSchoolAwards(scores, categories);
  const districtAwards = await processDistrictAwards(scores, categories);
  const nationalAwards = await processNationalAwards(scores, categories);

  await saveStudentAwards(
    schoolAwards,
    districtAwards,
    nationalAwards,
    contestId
  );

  console.log(`Completed award processing for contest ${contestId}`);
}

async function saveStudentAwards(
  schoolAwards: any[],
  districtAwards: any[],
  nationalAwards: any[],
  contestId: string
) {
  console.log(`Starting to save student awards for contest ${contestId}`);

  await db.studentAward.deleteMany({
    where: { contestId },
  });

  const allAwards = [...schoolAwards, ...districtAwards, ...nationalAwards];

  const studentAwards = new Map<string, any>();
  allAwards.forEach((award) => {
    const existing = studentAwards.get(award.studentRollNo) || {
      contestId,
      schoolId: award.schoolId,
      districtId: award.districtId,
      percentage: award.percentage,
      class: award.class,
    };

    if (award.level === Level.SCHOOL) existing.schoolAward = award.awardType;
    if (award.level === Level.DISTRICT)
      existing.districtAward = award.awardType;
    if (award.level === Level.NATION) existing.nationalAward = award.awardType;

    studentAwards.set(award.studentRollNo, existing);
  });
  const awardsToSave = Array.from(studentAwards.entries());

  console.log(`Total awards to process: ${awardsToSave.length}`);

  for (const [studentRollNo, award] of awardsToSave) {
    try {
      // Check if the student exists
      const student = await db.student.findUnique({
        where: { rollNumber: studentRollNo },
      });

      if (!student) {
        console.warn(
          `No student found with roll number: ${studentRollNo}. Skipping award.`
        );
        continue; // Skip to the next award
      }

      // Create the award
      await db.studentAward.create({
        data: {
          contestId: award.contestId,
          schoolId: award.schoolId,
          districtId: award.districtId,
          percentage: new Prisma.Decimal(award.percentage.toString()),
          class: award.class,
          schoolAward: award.schoolAward,
          districtAward: award.districtAward,
          nationalAward: award.nationalAward,
          student: {
            connect: { rollNumber: studentRollNo },
          },
        },
      });

      console.log(`Successfully created award for student: ${studentRollNo}`);
    } catch (error) {
      console.error(
        `Error creating award for student ${studentRollNo}:`,
        error
      );
      // You might want to add additional error handling here
    }
  }

  console.log(`Finished saving student awards for contest ${contestId}`);
}

async function processSchoolAwards(
  scores: Score[],
  categories: AwardCategory[]
): Promise<any[]> {
  const schoolCategory = categories.find((c) => c.level === Level.SCHOOL);
  if (!schoolCategory) throw new Error("School category not found");

  const schoolResults = new Map<number, Score[]>();

  scores.forEach((score) => {
    if (score.rollNo) {
      const schoolId = extractSchoolId(score.rollNo);
      if (!schoolResults.has(schoolId)) {
        schoolResults.set(schoolId, []);
      }
      schoolResults.get(schoolId)!.push(score);
    }
  });

  return Array.from(schoolResults.entries()).flatMap(
    ([schoolId, schoolScores]) => {
      return assignAwards(schoolScores, schoolCategory, Level.SCHOOL);
    }
  );
}
async function processDistrictAwards(
  scores: Score[],
  categories: AwardCategory[]
): Promise<any[]> {
  const schoolCategory = categories.find((c) => c.level === Level.DISTRICT);
  if (!schoolCategory) throw new Error("School category not found");

  const schoolResults = new Map<number, Score[]>();

  scores.forEach((score) => {
    if (score.rollNo) {
      const schoolId = extractSchoolId(score.rollNo);
      if (!schoolResults.has(schoolId)) {
        schoolResults.set(schoolId, []);
      }
      schoolResults.get(schoolId)!.push(score);
    }
  });

  return Array.from(schoolResults.entries()).flatMap(
    ([schoolId, schoolScores]) => {
      return assignAwards(schoolScores, schoolCategory, Level.DISTRICT);
    }
  );
}
async function processNationalAwards(
  scores: Score[],
  categories: AwardCategory[]
): Promise<any[]> {
  const nationalCategory = categories.find((c) => c.level === Level.NATION);
  if (!nationalCategory) throw new Error("National category not found");

  // Sort all scores in descending order
  const sortedScores = [...scores].sort((a, b) => {
    const percentA = a.percentage?.toNumber() ?? 0;
    const percentB = b.percentage?.toNumber() ?? 0;
    return percentB - percentA; // Simple descending sort by percentage
  });

  // Optional: Apply quotas
  const maxAwardsPerSchool = 5; // Example quota
  const schoolAwardCounts = new Map<number, number>();

  return sortedScores
    .map((score) => {
      if (!score.rollNo) return null;

      const schoolId = extractSchoolId(score.rollNo);
      const currentSchoolCount = schoolAwardCounts.get(schoolId) ?? 0;

      // Check quota
      // if (currentSchoolCount >= maxAwardsPerSchool) return null;

      // Increment count for this school
      schoolAwardCounts.set(schoolId, currentSchoolCount + 1);

      return {
        studentRollNo: score.rollNo,
        level: Level.NATION,
        awardType: determineAwardType(score.percentage, nationalCategory),
        schoolId,
        districtId: extractDistrictId(score.rollNo),
        percentage: score.percentage,
        class: extractClass(score.rollNo),
      };
    })
    .filter((award): award is NonNullable<typeof award> => award !== null);
}

function assignAwards(
  scores: Score[],
  category: AwardCategory,
  level: Level
): any[] {
  return scores.map((score) => {
    const award = {
      studentRollNo: score.rollNo,
      level,
      awardType: determineAwardType(score.percentage, category),
      schoolId: score.rollNo ? extractSchoolId(score.rollNo) : null,
      districtId: score.rollNo ? extractDistrictId(score.rollNo) : null,
      percentage: score.percentage,
      class: score.rollNo ? extractClass(score.rollNo) : null, // Add the class field
    };
    console.log(`${level} award percentage:`, award.percentage);
    return award;
  });
}

function determineAwardType(
  percentage: Prisma.Decimal | null,
  category: AwardCategory
): AwardType {
  if (!percentage) return AwardType.PARTICIPATION;

  const percentageNumber = percentage.toNumber();

  if (percentageNumber >= category.goldPercent.toNumber())
    return AwardType.GOLD;
  if (percentageNumber >= category.silverPercent.toNumber())
    return AwardType.SILVER;
  if (percentageNumber >= category.bronzePercent.toNumber())
    return AwardType.BRONZE;
  if (percentageNumber >= category.threeStarPercent.toNumber())
    return AwardType.THREE_STAR;
  if (percentageNumber >= category.twoStarPercent.toNumber())
    return AwardType.TWO_STAR;
  if (percentageNumber >= category.oneStarPercent.toNumber())
    return AwardType.ONE_STAR;
  return AwardType.PARTICIPATION;
}

function extractSchoolId(rollNo: string): number {
  const parts = rollNo.split("-");
  return parseInt(parts[2]);
}

function extractDistrictId(rollNo: string): string {
  const parts = rollNo.split("-");
  return parts[1];
}
function extractClass(rollNo: string): string {
  const parts = rollNo.split("-");
  return parts[3];
}
