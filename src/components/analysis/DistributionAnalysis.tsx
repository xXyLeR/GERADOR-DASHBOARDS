import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";

interface DistributionAnalysisProps {
  data: any[];
}

export const DistributionAnalysis = ({ data }: DistributionAnalysisProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível para análise de distribuição</p>
        </CardContent>
      </Card>
    );
  }

  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );

  // Create histogram data for first numeric column
  const createHistogram = (column: string) => {
    const values = data.map(row => Number(row[column])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 10;
    const binSize = (max - min) / bins;
    
    const histogram = Array.from({ length: bins }, (_, i) => {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = values.filter(v => v >= binStart && v < binEnd).length;
      return {
        range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count,
      };
    });
    
    return histogram;
  };

  const histogramData = numericColumns.length > 0 ? createHistogram(numericColumns[0]) : [];

  // Calculate percentiles for box plot
  const calculatePercentiles = (column: string) => {
    const values = data.map(row => Number(row[column])).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const median = values[Math.floor(values.length * 0.5)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const min = values[0];
    const max = values[values.length - 1];
    
    return [
      { label: 'Min', value: min },
      { label: 'Q1', value: q1 },
      { label: 'Mediana', value: median },
      { label: 'Q3', value: q3 },
      { label: 'Max', value: max },
    ];
  };

  const percentileData = numericColumns.length > 0 ? calculatePercentiles(numericColumns[0]) : [];

  const chartConfig = {
    count: {
      label: "Frequência",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Histograma de Frequência</CardTitle>
          <CardDescription>
            Distribuição dos valores - {numericColumns[0] || "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--chart-2))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Quartis</CardTitle>
          <CardDescription>
            Distribuição por percentis - {numericColumns[0] || "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={percentileData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-3))", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Métricas de Distribuição</CardTitle>
          <CardDescription>Estatísticas descritivas das colunas numéricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {numericColumns.slice(0, 4).map(col => {
              const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
              const mean = values.reduce((a, b) => a + b, 0) / values.length;
              const sorted = [...values].sort((a, b) => a - b);
              const median = sorted[Math.floor(sorted.length / 2)];
              
              return (
                <div key={col} className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">{col}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Média:</span>
                      <span className="font-medium">{mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mediana:</span>
                      <span className="font-medium">{median.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min:</span>
                      <span className="font-medium">{Math.min(...values).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max:</span>
                      <span className="font-medium">{Math.max(...values).toFixed(2)}</span>
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
