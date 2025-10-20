import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryAnalysisProps {
  data: any[];
  columns: string[];
}

export const CategoryAnalysis = ({ data, columns }: CategoryAnalysisProps) => {
  const categoryData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Procura por colunas que podem representar categorias ou IDs
    const textColumns = columns.filter((col) => {
      const sampleValues = data.slice(0, 10).map(row => row[col]);
      return sampleValues.some(val => val !== null && val !== undefined);
    });

    if (textColumns.length === 0) return null;

    // Usa a primeira coluna disponível
    const column = textColumns[0];
    const frequencyByDay: { [key: string]: number } = {};

    data.forEach(row => {
      const value = row[column];
      if (value === null || value === undefined) return;
      
      // Converte o valor para string
      const stringValue = String(value);
      frequencyByDay[stringValue] = (frequencyByDay[stringValue] || 0) + 1;
    });

    const chartData = Object.entries(frequencyByDay)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        dia: name.length > 30 ? name.substring(0, 30) + "..." : name,
        quantidade: count,
        percentual: ((count / data.length) * 100).toFixed(1),
      }));

    return { column, chartData, total: data.length };
  }, [data, columns]);

  if (!categoryData) return null;

  return (
    <Card className="p-6 [box-shadow:var(--shadow-card)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Frequência por {categoryData.column}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categoryData.chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="dia" 
            stroke="hsl(var(--muted-foreground))"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: any, name: string) => {
              if (name === "quantidade") {
                const item = categoryData.chartData.find(d => d.quantidade === value);
                return [`${value} (${item?.percentual}%)`, "Quantidade"];
              }
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="quantidade" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
