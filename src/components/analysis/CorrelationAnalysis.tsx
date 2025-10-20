import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ZAxis } from "recharts";

interface CorrelationAnalysisProps {
  data: any[];
}

export const CorrelationAnalysis = ({ data }: CorrelationAnalysisProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível para análise de correlação</p>
        </CardContent>
      </Card>
    );
  }

  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );

  if (numericColumns.length < 2) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">São necessárias pelo menos 2 colunas numéricas para análise de correlação</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate correlation coefficient
  const calculateCorrelation = (col1: string, col2: string) => {
    const values1 = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
    const values2 = data.map(row => Number(row[col2])).filter(v => !isNaN(v));
    
    const mean1 = values1.reduce((a, b) => a + b) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b) / values2.length;
    
    const numerator = values1.reduce((sum, val, i) => 
      sum + (val - mean1) * (values2[i] - mean2), 0
    );
    
    const denominator = Math.sqrt(
      values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
      values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Scatter plot data
  const scatterData = data.slice(0, 50).map(row => ({
    x: Number(row[numericColumns[0]]) || 0,
    y: Number(row[numericColumns[1]]) || 0,
  }));

  const correlation = calculateCorrelation(numericColumns[0], numericColumns[1]);

  // Correlation matrix
  const correlationMatrix = numericColumns.slice(0, 4).map(col1 => 
    numericColumns.slice(0, 4).map(col2 => ({
      col1,
      col2,
      value: calculateCorrelation(col1, col2),
    }))
  ).flat();

  const chartConfig = {
    x: {
      label: numericColumns[0],
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Dispersão</CardTitle>
          <CardDescription>
            Correlação entre {numericColumns[0]} e {numericColumns[1]}
            <span className={`ml-2 font-bold ${Math.abs(correlation) > 0.7 ? 'text-accent' : 'text-muted-foreground'}`}>
              (r = {correlation.toFixed(3)})
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={numericColumns[0]}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={numericColumns[1]}
                />
                <ZAxis range={[100, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter 
                  data={scatterData} 
                  fill="hsl(var(--chart-1))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Correlação</CardTitle>
          <CardDescription>Correlações entre as principais variáveis numéricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {correlationMatrix.map((cell, index) => (
              <div
                key={index}
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: `hsla(var(--chart-${Math.abs(cell.value) > 0.7 ? '2' : '1'}), ${Math.abs(cell.value) * 0.5})`,
                }}
              >
                <p className="text-xs font-medium mb-1">
                  {cell.col1.substring(0, 8)} × {cell.col2.substring(0, 8)}
                </p>
                <p className="text-lg font-bold">{cell.value.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interpretação de Correlações</CardTitle>
          <CardDescription>Força das relações entre variáveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {numericColumns.slice(0, 3).map((col1, i) => 
              numericColumns.slice(i + 1, 4).map(col2 => {
                const corr = calculateCorrelation(col1, col2);
                const strength = Math.abs(corr) > 0.7 ? 'Forte' : 
                               Math.abs(corr) > 0.4 ? 'Moderada' : 'Fraca';
                const direction = corr > 0 ? 'positiva' : 'negativa';
                
                return (
                  <div key={`${col1}-${col2}`} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{col1} × {col2}</p>
                        <p className="text-sm text-muted-foreground">
                          Correlação {strength.toLowerCase()} {direction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${Math.abs(corr) > 0.7 ? 'text-accent' : 'text-foreground'}`}>
                          {corr.toFixed(3)}
                        </p>
                        <p className="text-xs text-muted-foreground">{strength}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
