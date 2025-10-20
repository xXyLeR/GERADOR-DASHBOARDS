import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewCharts } from "@/components/analysis/OverviewCharts";
import { DistributionAnalysis } from "@/components/analysis/DistributionAnalysis";
import { TrendAnalysis } from "@/components/analysis/TrendAnalysis";
import { CorrelationAnalysis } from "@/components/analysis/CorrelationAnalysis";
import { InsightsPanel } from "@/components/analysis/InsightsPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: dataset, isLoading } = useQuery({
    queryKey: ["dataset", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{dataset?.name}</h1>
                <p className="text-sm text-muted-foreground">{dataset?.file_name}</p>
              </div>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="correlation">Correlações</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewCharts data={Array.isArray(dataset?.data) ? dataset.data : []} />
          </TabsContent>

          <TabsContent value="distribution">
            <DistributionAnalysis data={Array.isArray(dataset?.data) ? dataset.data : []} />
          </TabsContent>

          <TabsContent value="trends">
            <TrendAnalysis data={Array.isArray(dataset?.data) ? dataset.data : []} />
          </TabsContent>

          <TabsContent value="correlation">
            <CorrelationAnalysis data={Array.isArray(dataset?.data) ? dataset.data : []} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel data={Array.isArray(dataset?.data) ? dataset.data : []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analysis;
