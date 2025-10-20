import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";

interface TrendAnalysisProps {
  data: any[];
}

export const TrendAnalysis = ({ data }: TrendAnalysisProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível para análise de tendências</p>
        </CardContent>
      </Card>
    );
  }

  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );

  // Sample data for trend analysis (first 20 records)
  const trendData = data.slice(0, 20).map((row, index) => ({
    index: index + 1,
    ...Object.fromEntries(
      numericColumns.slice(0, 3).map(col => [col, Number(row[col]) || 0])
    ),
  }));

  const chartConfig = {
    [numericColumns[0]]: {
      label: numericColumns[0] || "Valor 1",
      color: "hsl(var(--chart-1))",
    },
    [numericColumns[1]]: {
      label: numericColumns[1] || "Valor 2",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tendência Temporal</CardTitle>
          <CardDescription>Evolução dos valores ao longo das primeiras 20 entradas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {numericColumns.slice(0, 3).map((col, index) => (
                  <Line
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={`hsl(var(--chart-${index + 1}))`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Área</CardTitle>
          <CardDescription>Visualização acumulativa dos valores</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {numericColumns.slice(0, 2).map((col, index) => (
                  <Area
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stackId="1"
                    stroke={`hsl(var(--chart-${index + 1}))`}
                    fill={`hsl(var(--chart-${index + 1}))`}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Tendência</CardTitle>
          <CardDescription>Métricas de crescimento e variação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {numericColumns.slice(0, 4).map(col => {
              const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
              const firstValue = values[0];
              const lastValue = values[values.length - 1];
              const growth = ((lastValue - firstValue) / firstValue * 100);
              const avgChange = values.slice(1).reduce((sum, val, i) => {
                return sum + Math.abs(val - values[i]);
              }, 0) / (values.length - 1);

              return (
                <div key={col} className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">{col}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Crescimento</p>
                      <p className={`text-lg font-bold ${growth >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Variação Média</p>
                      <p className="text-sm font-medium">{avgChange.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
