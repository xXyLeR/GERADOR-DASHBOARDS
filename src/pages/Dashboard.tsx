import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, TrendingUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DatasetsList } from "@/components/dashboard/DatasetsList";
import { RecentAnalysis } from "@/components/dashboard/RecentAnalysis";
import { StatsOverview } from "@/components/dashboard/StatsOverview";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: datasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: analyses } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Data Analytics Platform</h1>
            </div>
            <Button onClick={() => navigate("/upload")}>
              <Database className="mr-2 h-4 w-4" />
              Upload Dataset
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <StatsOverview datasets={datasets || []} analyses={analyses || []} />

        <Tabs defaultValue="datasets" className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="datasets">
              <Database className="mr-2 h-4 w-4" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="analyses">
              <FileText className="mr-2 h-4 w-4" />
              Análises Recentes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datasets" className="mt-6">
            <DatasetsList datasets={datasets || []} />
          </TabsContent>

          <TabsContent value="analyses" className="mt-6">
            <RecentAnalysis analyses={analyses || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
