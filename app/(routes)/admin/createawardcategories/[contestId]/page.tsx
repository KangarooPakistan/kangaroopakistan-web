import { db } from "@/app/lib/prisma";
import { AwardDefinitionForms } from "@/app/components/AwardCategoryForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function CreateAwardCategories({
  params,
}: {
  params: { contestId: string };
}) {
  // Fetch existing award definitions for this contest
  const awardDefinitions = await db.awardDefinition.findMany({
    where: { contestId: params.contestId },
  });

  // Helper function to convert Decimal to number
  const toNumber = (value: any): number =>
    typeof value === "object" && value !== null && "toNumber" in value
      ? value.toNumber()
      : Number(value);

  // Convert database data to form data format
  const convertToFormData = (definition: any) => ({
    goldPercent: toNumber(definition.goldPercent),
    silverPercent: toNumber(definition.silverPercent),
    bronzePercent: toNumber(definition.bronzePercent),
    threeStarPercent: toNumber(definition.threeStarPercent),
    twoStarPercent: toNumber(definition.twoStarPercent),
    oneStarPercent: toNumber(definition.oneStarPercent),
    participationPercent: toNumber(definition.participationPercent),
  });

  // Separate definitions by level
  const juniorDefinition = awardDefinitions.find(
    (def) => def.level === "JUNIOR"
  );
  const seniorDefinition = awardDefinitions.find(
    (def) => def.level === "SENIOR"
  );

  // Prepare initial data for the forms
  const initialData = {
    junior: juniorDefinition ? convertToFormData(juniorDefinition) : undefined,
    senior: seniorDefinition ? convertToFormData(seniorDefinition) : undefined,
  };

  // Fetch contest details for the header
  const contest = await db.contest.findUnique({
    where: { id: params.contestId },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Award Definitions</CardTitle>
          <CardDescription>
            {contest?.name || "Configure award definitions for this contest"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <Card className="p-6">
          <AwardDefinitionForms
            contestId={params.contestId}
            initialData={initialData}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Award Levels Information</CardTitle>
            <CardDescription>
              Understanding the award levels and their criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Junior Level: For students in classes 1-4</li>
              <li>Senior Level: For students in classes 5-12</li>
              <li>
                Gold, Silver, and Bronze medals are awarded to top performers
              </li>
              <li>
                Three Star, Two Star, and One Star certificates recognize
                different achievement levels
              </li>
              <li>
                Participation certificates are awarded to all other participants
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
