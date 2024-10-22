"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileSpreadsheet, FileText } from "lucide-react";

type Level = "SCHOOL" | "DISTRICT" | "NATION";

interface CategoryData {
  bronzePercent: string;
  contestId: string;
  goldPercent: string;
  id: number;
  level: Level;
  oneStarPercent: string;
  participationPercent: string;
  silverPercent: string;
  threeStarPercent: string;
  twoStarPercent: string;
}

const AwardTypeCard: React.FC<{ type: string; percentage: string }> = ({
  type,
  percentage,
}) => (
  <Card className="mb-4">
    <CardHeader className="font-bold">{type}</CardHeader>
    <CardContent>
      <p>Percentage: {percentage}%</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Certificates
        </Button>
        <Button size="sm" variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel
        </Button>
        <Button size="sm" variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Workbook
        </Button>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    </CardContent>
  </Card>
);

const LevelTab: React.FC<{ categoryData: CategoryData | null }> = ({
  categoryData,
}) => {
  if (!categoryData) {
    return <div>No data available for this level</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AwardTypeCard type="Gold" percentage={categoryData.goldPercent} />
      <AwardTypeCard type="Silver" percentage={categoryData.silverPercent} />
      <AwardTypeCard type="Bronze" percentage={categoryData.bronzePercent} />
      <AwardTypeCard
        type="Three Star"
        percentage={categoryData.threeStarPercent}
      />
      <AwardTypeCard type="Two Star" percentage={categoryData.twoStarPercent} />
      <AwardTypeCard type="One Star" percentage={categoryData.oneStarPercent} />
      <AwardTypeCard
        type="Participation"
        percentage={categoryData.participationPercent}
      />
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Level>("SCHOOL");
  const [categoryData, setCategoryData] = useState<
    Record<Level, CategoryData | null>
  >({
    SCHOOL: null,
    DISTRICT: null,
    NATION: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<CategoryData[]>(
          "/api/results/categories"
        );

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newCategoryData: Record<Level, CategoryData | null> = {
          SCHOOL: null,
          DISTRICT: null,
          NATION: null,
        };

        response.data.forEach((item) => {
          newCategoryData[item.level] = item;
        });

        setCategoryData(newCategoryData);
      } catch (err) {
        console.error("Error details:", err);
        if (axios.isAxiosError(err)) {
          console.error("Axios error details:", err.response?.data);
          setError(
            `Error: ${err.message}. ${err.response?.data?.message || ""}`
          );
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contest Results</h1>
      <p className="mb-4">
        Contest ID: {categoryData.SCHOOL?.contestId || "N/A"}
      </p>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) => setActiveTab(value as Level)}>
        <TabsList className="mb-4">
          <TabsTrigger value="SCHOOL">School</TabsTrigger>
          <TabsTrigger value="DISTRICT">District</TabsTrigger>
          <TabsTrigger value="NATION">Nation</TabsTrigger>
        </TabsList>

        {(Object.keys(categoryData) as Level[]).map((level) => (
          <TabsContent key={level} value={level}>
            <LevelTab categoryData={categoryData[level]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ResultsPage;
