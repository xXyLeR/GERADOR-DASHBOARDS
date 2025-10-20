import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface OverviewChartsProps {
  data: any[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const OverviewCharts = ({ data }: OverviewChartsProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível para análise</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );

  const topRecords = data.slice(0, 10);
  
  const summaryData = numericColumns.slice(0, 5).map(col => ({
    name: col,
    value: data.reduce((sum, row) => sum + (Number(row[col]) || 0), 0) / data.length,
  }));

  const chartConfig = {
    value: {
      label: "Valor",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>Primeiras 10 entradas do dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRecords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={Object.keys(data[0])[0]} 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey={numericColumns[0] || "value"} 
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Dados</CardTitle>
          <CardDescription>Médias das principais colunas numéricas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Estatísticas Gerais</CardTitle>
          <CardDescription>Resumo do dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total de Registros</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Colunas</p>
              <p className="text-2xl font-bold">{Object.keys(data[0] || {}).length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Colunas Numéricas</p>
              <p className="text-2xl font-bold">{numericColumns.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Completude</p>
              <p className="text-2xl font-bold">
                {(Object.values(data[0] || {}).filter(v => v != null).length / Object.keys(data[0] || {}).length * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
