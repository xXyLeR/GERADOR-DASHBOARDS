import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentAnalysisProps {
  analyses: any[];
}

export const RecentAnalysis = ({ analyses }: RecentAnalysisProps) => {
  const navigate = useNavigate();

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Nenhuma análise encontrada</p>
          <p className="text-sm text-muted-foreground">
            Análises aparecerão aqui após você processar um dataset
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Análises</CardTitle>
        <CardDescription>Suas análises mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div>
                <p className="font-medium">{analysis.analysis_type}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(analysis.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/analysis/${analysis.dataset_id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
