import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { StatisticsCard } from "./dashboard/StatisticsCard";
import { DataInsights } from "./dashboard/DataInsights";
import { DataTable } from "./dashboard/DataTable";
import { CorrelationMatrix } from "./dashboard/CorrelationMatrix";
import { CategoryAnalysis } from "./dashboard/CategoryAnalysis";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, Users, DollarSign, Activity, AlertTriangle, TrendingDown, Minus } from "lucide-react";

interface DashboardProps {
  data: any[];
}

const COLORS = [
  "hsl(217, 91%, 60%)",   // Azul
  "hsl(142, 76%, 36%)",   // Verde
  "hsl(45, 93%, 47%)",    // Amarelo
  "hsl(0, 84%, 60%)",     // Vermelho
  "hsl(280, 70%, 60%)",   // Roxo
  "hsl(33, 100%, 50%)",   // Laranja
  "hsl(195, 100%, 50%)",  // Ciano
  "hsl(330, 70%, 60%)",   // Rosa
  "hsl(150, 60%, 45%)",   // Verde Mar
  "hsl(270, 50%, 50%)",   // Violeta
];

export const Dashboard = ({ data }: DashboardProps) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filtra linhas vazias
    const validData = data.filter(row => 
      Object.values(row).some(val => val !== null && val !== undefined && val !== "")
    );

    if (validData.length === 0) return null;

    const columns = Object.keys(validData[0]).filter(col => col !== "");
    
    // Detecta colunas numéricas com mais flexibilidade
    const numericColumns = columns.filter((col) => {
      const numericCount = validData.filter((row) => {
        const value = row[col];
        if (typeof value === "number") return true;
        if (typeof value === "string") {
          const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
          return !isNaN(parsed);
        }
        return false;
      }).length;
      
      return numericCount > validData.length * 0.5;
    });

    // Função para converter valores em números
    const toNumber = (value: any): number => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const totalRecords = validData.length;
    const avgValues: { [key: string]: number } = {};
    const medianValues: { [key: string]: number } = {};
    const stdDevValues: { [key: string]: number } = {};
    const q1Values: { [key: string]: number } = {};
    const q3Values: { [key: string]: number } = {};
    
    // Calcula estatísticas avançadas para cada coluna numérica
    numericColumns.forEach((col) => {
      const values = validData.map(row => toNumber(row[col])).sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      
      // Média
      avgValues[col] = sum / totalRecords;
      
      // Mediana
      const mid = Math.floor(values.length / 2);
      medianValues[col] = values.length % 2 === 0 
        ? (values[mid - 1] + values[mid]) / 2 
        : values[mid];
      
      // Desvio padrão
      const variance = values.reduce((acc, val) => acc + Math.pow(val - avgValues[col], 2), 0) / totalRecords;
      stdDevValues[col] = Math.sqrt(variance);
      
      // Quartis
      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      q1Values[col] = values[q1Index];
      q3Values[col] = values[q3Index];
    });

    // Seleciona a primeira coluna para labels (texto) e a primeira numérica para valores
    const labelColumn = columns[0];
    const valueColumn = numericColumns[0] || columns[1] || columns[0];

    // Dados para gráfico de barras (primeiras 10 linhas com valores válidos)
    const barData = validData.slice(0, 10).map((row, index) => {
      const label = row[labelColumn]?.toString() || `Item ${index + 1}`;
      const value = toNumber(row[valueColumn]);
      return {
        name: label.length > 15 ? label.substring(0, 15) + "..." : label,
        valor: value,
      };
    }).filter(item => item.valor !== 0 || validData.length <= 10);

    // Dados para gráfico de linha (tendência com valores válidos)
    const lineData = validData.slice(0, 15).map((row, index) => {
      const label = row[labelColumn]?.toString() || `Ponto ${index + 1}`;
      return {
        name: label.length > 10 ? label.substring(0, 10) + "..." : label,
        valor: toNumber(row[valueColumn]),
      };
    });

    // Dados para gráfico de pizza (top 6 categorias por valor)
    const pieDataRaw = validData.map((row, index) => ({
      name: row[labelColumn]?.toString() || `Cat ${index + 1}`,
      value: toNumber(row[valueColumn]),
    }));

    // Agrupa valores iguais e pega os top 6
    const pieDataGrouped = pieDataRaw.reduce((acc, item) => {
      const existing = acc.find(x => x.name === item.name);
      if (existing) {
        existing.value += item.value;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

    const pieData = pieDataGrouped
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
        value: item.value,
      }))
      .filter(item => item.value > 0);

    // Calcula estatísticas adicionais
    const numericValues = validData
      .map(row => toNumber(row[valueColumn]))
      .filter(val => val !== 0);
    
    const maxValue = Math.max(...numericValues, 0);
    const minValue = Math.min(...numericValues, 0);
    const sumValue = numericValues.reduce((a, b) => a + b, 0);
    const avgValue = sumValue / numericValues.length;
    
    // Análise de outliers (método IQR)
    const q1 = q1Values[valueColumn];
    const q3 = q3Values[valueColumn];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = numericValues.filter(val => val < lowerBound || val > upperBound);
    
    // Coeficiente de variação
    const cv = (stdDevValues[valueColumn] / avgValues[valueColumn]) * 100;
    
    // Análise de tendência (regressão linear simples)
    let trend = "estável";
    if (lineData.length > 2) {
      const firstHalf = lineData.slice(0, Math.floor(lineData.length / 2));
      const secondHalf = lineData.slice(Math.floor(lineData.length / 2));
      const avgFirst = firstHalf.reduce((acc, d) => acc + d.valor, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((acc, d) => acc + d.valor, 0) / secondHalf.length;
      
      if (avgSecond > avgFirst * 1.1) trend = "crescente";
      else if (avgSecond < avgFirst * 0.9) trend = "decrescente";
    }
    
    // Dados para gráfico de área (acumulado)
    const areaData = lineData.map((item, index) => {
      const accumulated = lineData.slice(0, index + 1).reduce((acc, d) => acc + d.valor, 0);
      return {
        name: item.name,
        valor: item.valor,
        acumulado: accumulated,
      };
    });

    // Gera insights automáticos
    const insights = [];
    
    if (outliers.length > totalRecords * 0.1) {
      insights.push({
        type: "warning" as const,
        title: "Alto número de outliers detectado",
        description: `${outliers.length} valores (${((outliers.length / totalRecords) * 100).toFixed(1)}%) estão fora do padrão esperado. Isso pode indicar erros nos dados ou valores excepcionais.`
      });
    }
    
    if (cv > 50) {
      insights.push({
        type: "warning" as const,
        title: "Alta variabilidade nos dados",
        description: `O coeficiente de variação é ${cv.toFixed(1)}%, indicando grande dispersão nos valores.`
      });
    } else if (cv < 15) {
      insights.push({
        type: "success" as const,
        title: "Baixa variabilidade nos dados",
        description: `O coeficiente de variação é ${cv.toFixed(1)}%, indicando valores consistentes e homogêneos.`
      });
    }
    
    if (trend === "crescente") {
      insights.push({
        type: "info" as const,
        title: "Tendência de crescimento identificada",
        description: `Os dados mostram uma tendência de crescimento ao longo do período analisado.`
      });
    } else if (trend === "decrescente") {
      insights.push({
        type: "warning" as const,
        title: "Tendência de queda identificada",
        description: `Os dados mostram uma tendência de queda ao longo do período analisado.`
      });
    }
    
    const skewness = (sumValue / totalRecords - medianValues[valueColumn]) / stdDevValues[valueColumn];
    if (Math.abs(skewness) > 0.5) {
      insights.push({
        type: "info" as const,
        title: skewness > 0 ? "Distribuição assimétrica positiva" : "Distribuição assimétrica negativa",
        description: skewness > 0 
          ? "A maioria dos valores está concentrada abaixo da média, com alguns valores muito altos."
          : "A maioria dos valores está concentrada acima da média, com alguns valores muito baixos."
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        type: "success" as const,
        title: "Dados em bom estado",
        description: "Os dados apresentam boa qualidade, sem anomalias significativas detectadas."
      });
    }

    return {
      totalRecords,
      avgValues,
      medianValues,
      stdDevValues,
      q1Values,
      q3Values,
      numericColumns,
      columns,
      barData,
      lineData,
      pieData,
      areaData,
      maxValue,
      minValue,
      sumValue,
      valueColumn,
      outliers,
      cv,
      trend,
      insights,
    };
  }, [data]);

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum dado válido para exibir</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total de Registros"
          value={metrics.totalRecords}
          icon={Users}
          bgColor="bg-primary/10"
          iconColor="text-primary"
        />
        
        <StatisticsCard
          title="Tendência"
          value={metrics.trend}
          icon={metrics.trend === 'crescente' ? TrendingUp : metrics.trend === 'decrescente' ? TrendingDown : Minus}
          bgColor={
            metrics.trend === 'crescente' ? 'bg-accent/10' : 
            metrics.trend === 'decrescente' ? 'bg-destructive/10' : 
            'bg-muted/20'
          }
          iconColor={
            metrics.trend === 'crescente' ? 'text-accent' : 
            metrics.trend === 'decrescente' ? 'text-destructive' : 
            'text-muted-foreground'
          }
        />
        
        <StatisticsCard
          title="Outliers"
          value={metrics.outliers.length}
          icon={AlertTriangle}
          bgColor="bg-[hsl(45,93%,47%)]/10"
          iconColor="text-[hsl(45,93%,47%)]"
        />
        
        <StatisticsCard
          title="Coef. Variação"
          value={`${metrics.cv.toFixed(1)}%`}
          icon={Activity}
          bgColor="bg-destructive/10"
          iconColor="text-destructive"
        />
      </div>

      {/* Insights Automáticos */}
      <DataInsights insights={metrics.insights} />

      {/* Estatísticas Avançadas */}
      <Card className="p-6 [box-shadow:var(--shadow-card)]">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Estatísticas Detalhadas - {metrics.valueColumn}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Média</p>
            <p className="text-xl font-bold text-foreground">
              {(metrics.sumValue / metrics.totalRecords).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mediana</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.medianValues[metrics.valueColumn]?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Máximo</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.maxValue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mínimo</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.minValue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Desvio Padrão</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.stdDevValues[metrics.valueColumn]?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Soma Total</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.sumValue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Q1 (25%)</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.q1Values[metrics.valueColumn]?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Q3 (75%)</p>
            <p className="text-xl font-bold text-foreground">
              {metrics.q3Values[metrics.valueColumn]?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amplitude</p>
            <p className="text-xl font-bold text-foreground">
              {(metrics.maxValue - metrics.minValue).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">IQR</p>
            <p className="text-xl font-bold text-foreground">
              {(metrics.q3Values[metrics.valueColumn] - metrics.q1Values[metrics.valueColumn]).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.barData.length > 0 && (
          <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Distribuição por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={metrics.barData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => 
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={110}
                  fill="hsl(217, 91%, 60%)"
                  dataKey="valor"
                >
                  {metrics.barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`Valor: ${value}`, props.payload.name];
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {metrics.barData.length > 0 && (
          <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Distribuição por Categoria - Top 5º
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.barData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar dataKey="valor" fill="hsl(142, 76%, 36%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {metrics.lineData.length > 0 && (
          <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Tendência dos Dados
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(142, 76%, 36%)", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {metrics.pieData.length > 0 && (
          <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Proporção dos Dados (Top 6)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="hsl(217, 91%, 60%)"
                  dataKey="value"
                >
                  {metrics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {metrics.areaData.length > 0 && (
          <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Análise Acumulada
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="acumulado"
                  stroke="hsl(217, 91%, 60%)"
                  fill="hsl(217, 91%, 60%)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Análise de Distribuição - Quartis */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Análise de Distribuição - Quartis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Mínimo", valor: metrics.minValue },
                { name: "Q1 (25%)", valor: metrics.q1Values[metrics.valueColumn] },
                { name: "Mediana", valor: metrics.medianValues[metrics.valueColumn] },
                { name: "Q3 (75%)", valor: metrics.q3Values[metrics.valueColumn] },
                { name: "Máximo", valor: metrics.maxValue },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: any) => [value.toFixed(2), "Valor"]}
              />
              <Legend />
              <Bar 
                dataKey="valor" 
                fill="hsl(217, 91%, 60%)" 
                radius={[8, 8, 0, 0]}
              >
                {[0, 1, 2, 3, 4].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Análise Categórica */}
      <CategoryAnalysis data={data} columns={metrics.columns} />

      {/* Matriz de Correlação */}
      {metrics.numericColumns.length >= 2 && (
        <CorrelationMatrix data={data} numericColumns={metrics.numericColumns} />
      )}

      {/* Tabela de Dados */}
      <DataTable data={data} maxRows={20} />

      {/* Informações adicionais */}
      <Card className="p-6 [box-shadow:var(--shadow-card)]">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Informações do Dataset
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total de Colunas</p>
            <p className="font-semibold text-foreground">{metrics.columns.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Colunas Numéricas</p>
            <p className="font-semibold text-foreground">{metrics.numericColumns.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Valor Mínimo</p>
            <p className="font-semibold text-foreground">{metrics.minValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Coluna Analisada</p>
            <p className="font-semibold text-foreground">{metrics.valueColumn}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
