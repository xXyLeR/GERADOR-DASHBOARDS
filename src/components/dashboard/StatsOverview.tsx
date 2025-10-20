import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, BarChart3, TrendingUp, FileText } from "lucide-react";

interface StatsOverviewProps {
  datasets: any[];
  analyses: any[];
}

export const StatsOverview = ({ datasets, analyses }: StatsOverviewProps) => {
  const totalRows = datasets.reduce((sum, d) => sum + (d.row_count || 0), 0);
  const totalColumns = datasets.reduce((sum, d) => sum + (d.column_count || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{datasets.length}</div>
          <p className="text-xs text-muted-foreground">
            {totalRows.toLocaleString()} linhas totais
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Análises Realizadas</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analyses.length}</div>
          <p className="text-xs text-muted-foreground">
            Últimas 5 análises
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Colunas Analisadas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalColumns}</div>
          <p className="text-xs text-muted-foreground">
            Em todos os datasets
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Disponíveis
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
