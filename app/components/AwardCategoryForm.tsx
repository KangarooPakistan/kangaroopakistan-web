"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";

// Define the schema for award definition
const awardDefinitionSchema = z
  .object({
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

type AwardDefinitionFormData = z.infer<typeof awardDefinitionSchema>;

interface AwardDefinitionFormsProps {
  contestId: string;
  initialData?: {
    junior?: AwardDefinitionFormData;
    senior?: AwardDefinitionFormData;
  };
}

const defaultValues = {
  goldPercent: 95,
  silverPercent: 90,
  bronzePercent: 85,
  threeStarPercent: 80,
  twoStarPercent: 70,
  oneStarPercent: 60,
  participationPercent: 0,
};

const AwardDefinitionForm = ({
  level,
  form,
  isSubmitting,
}: {
  level: "JUNIOR" | "SENIOR";
  form: any;
  isSubmitting: boolean;
}) => {
  const percentageFields = [
    { name: "goldPercent", label: "Gold Medal Percentage" },
    { name: "silverPercent", label: "Silver Medal Percentage" },
    { name: "bronzePercent", label: "Bronze Medal Percentage" },
    { name: "threeStarPercent", label: "Three Star Percentage" },
    { name: "twoStarPercent", label: "Two Star Percentage" },
    { name: "oneStarPercent", label: "One Star Percentage" },
    {
      name: "participationPercent",
      label: "Participation Certificate Percentage",
    },
  ];

  return (
    <div className="space-y-4">
      {percentageFields.map(({ name, label }) => (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Enter percentage required for {label.toLowerCase()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export function AwardDefinitionForms({
  contestId,
  initialData,
}: AwardDefinitionFormsProps) {
  const params = useParams();
  console.log(params.contestId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const juniorForm = useForm<AwardDefinitionFormData>({
    resolver: zodResolver(awardDefinitionSchema),
    defaultValues: initialData?.junior || defaultValues,
  });

  const seniorForm = useForm<AwardDefinitionFormData>({
    resolver: zodResolver(awardDefinitionSchema),
    defaultValues: initialData?.senior || defaultValues,
  });

  const onSubmit = async (
    level: "JUNIOR" | "SENIOR",
    data: AwardDefinitionFormData
  ) => {
    setIsSubmitting(true);
    try {
      const sendData = {
        ...data,
        contestId: params.contestId,
        level,
      };
      console.log(sendData);

      const isUpdate =
        level === "JUNIOR" ? !!initialData?.junior : !!initialData?.senior;
      console.log(isUpdate);

      const response = await fetch(
        `/api/users/contests/${params.contestId}/award-definition`,
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sendData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} award definition`
        );
      }

      console.log(
        `${level} award definition ${
          isUpdate ? "updated" : "created"
        } successfully`
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="junior" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="junior">Junior Level (Classes 1-4)</TabsTrigger>
        <TabsTrigger value="senior">Senior Level (Classes 5-12)</TabsTrigger>
      </TabsList>

      <TabsContent value="junior">
        <Card>
          <CardHeader>
            <CardTitle>Junior Level Award Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...juniorForm}>
              <form
                onSubmit={juniorForm.handleSubmit((data) =>
                  onSubmit("JUNIOR", data)
                )}
                className="space-y-8">
                <AwardDefinitionForm
                  level="JUNIOR"
                  form={juniorForm}
                  isSubmitting={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                  Save Junior Awards
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="senior">
        <Card>
          <CardHeader>
            <CardTitle>Senior Level Award Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...seniorForm}>
              <form
                onSubmit={seniorForm.handleSubmit((data) =>
                  onSubmit("SENIOR", data)
                )}
                className="space-y-8">
                <AwardDefinitionForm
                  level="SENIOR"
                  form={seniorForm}
                  isSubmitting={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                  Save Senior Awards
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
