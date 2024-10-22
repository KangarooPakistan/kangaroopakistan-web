// src/lib/schemas/awardCategory.ts
import { z } from "zod";

export const levelEnum = z.enum(["SCHOOL", "DISTRICT", "NATION"]);

export const awardCategorySchema = z.object({
  level: levelEnum,
  goldPercent: z.number().min(0).max(100),
  silverPercent: z.number().min(0).max(100),
  bronzePercent: z.number().min(0).max(100),
  threeStarPercent: z.number().min(0).max(100),
  twoStarPercent: z.number().min(0).max(100),
  oneStarPercent: z.number().min(0).max(100),
  participationPercent: z.number().min(0).max(100),
});

export type AwardCategoryFormData = z.infer<typeof awardCategorySchema>;

export function validatePercentageOrder(data: AwardCategoryFormData) {
  const percentages = [
    { name: "Gold", value: data.goldPercent },
    { name: "Silver", value: data.silverPercent },
    { name: "Bronze", value: data.bronzePercent },
    { name: "3 Star", value: data.threeStarPercent },
    { name: "2 Star", value: data.twoStarPercent },
    { name: "1 Star", value: data.oneStarPercent },
    { name: "Participation", value: data.participationPercent },
  ];

  for (let i = 0; i < percentages.length - 1; i++) {
    if (percentages[i].value <= percentages[i + 1].value) {
      throw new Error(
        `${percentages[i].name} percentage must be greater than ${
          percentages[i + 1].name
        } percentage`
      );
    }
  }
}
