import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart3, Target, Activity, Zap, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle, TrendingDown as TrendDown, Calendar, Globe } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ScatterChart, Scatter } from "recharts";
import { Badge } from "@/components/ui/badge";

interface ExecutiveDashboardProps {
  data: any[];
}

export const ExecutiveDashboard = ({ data }: ExecutiveDashboardProps) => {
  // Análise avançada dos dados
  const analyzeData = () => {
    if (!data || data.length === 0) return null;

    const numericalColumns = Object.keys(data[0]).filter((key) => 
      typeof data[0][key] === "number"
    );

    // KPIs principais
    const kpis = numericalColumns.map((col) => {
      const values = data.map((row) => row[col]).filter((v) => typeof v === "number");
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      // Tendência (comparando primeira e última metade dos dados)
      const half = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, half);
      const secondHalf = values.slice(half);
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const trend = secondAvg > firstAvg ? "up" : "down";
      const trendPercent = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);

      return { column: col, sum, avg, max, min, trend, trendPercent };
    });

    return { kpis, numericalColumns };
  };

  const analysis = analyzeData();

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum dado disponível para análise executiva
        </CardContent>
      </Card>
    );
  }

  const { kpis, numericalColumns } = analysis;

  // Preparar dados para gráficos de tendência
  const trendData = data.map((row, index) => ({
    periodo: `P${index + 1}`,
    ...numericalColumns.reduce((acc, col) => ({ ...acc, [col]: row[col] }), {}),
  }));

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "hsl(var(--muted))"];

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(0, 4).map((kpi, index) => (
          <Card key={kpi.column} className="[box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {kpi.column}
              </CardTitle>
              {index === 0 && <DollarSign className="h-4 w-4 text-muted-foreground" />}
              {index === 1 && <Users className="h-4 w-4 text-muted-foreground" />}
              {index === 2 && <Target className="h-4 w-4 text-muted-foreground" />}
              {index === 3 && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.avg.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-accent mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                )}
                <span className={kpi.trend === "up" ? "text-accent" : "text-destructive"}>
                  {kpi.trendPercent}%
                </span>
                <span className="ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Detalhados */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecast">Projeções</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  {numericalColumns.slice(0, 3).map((col, index) => (
                    <Line
                      key={col}
                      type="monotone"
                      dataKey={col}
                      stroke={COLORS[index]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[index] }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Comparação entre Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  {numericalColumns.slice(0, 3).map((col, index) => (
                    <Bar key={col} dataKey={col} fill={COLORS[index]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Distribuição de Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={kpis.slice(0, 4).map((kpi) => ({
                      name: kpi.column,
                      value: kpi.sum,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percent?.toFixed(0)}%`}
                    outerRadius={120}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {kpis.slice(0, 4).map((_, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scorecard de Performance */}
            <Card className="[box-shadow:var(--shadow-card)]">
              <CardHeader>
                <CardTitle>Scorecard de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis.slice(0, 4).map((kpi, index) => {
                    const performance = parseFloat(kpi.trendPercent);
                    const isPositive = performance > 0;
                    return (
                      <div key={kpi.column} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{kpi.column}</span>
                          <div className="flex items-center gap-2">
                            {isPositive ? (
                              <ArrowUpRight className="h-4 w-4 text-accent" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            )}
                            <span className={`text-sm font-bold ${isPositive ? "text-accent" : "text-destructive"}`}>
                              {Math.abs(performance).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full ${isPositive ? "bg-accent" : "bg-destructive"} transition-all`}
                            style={{ width: `${Math.min(Math.abs(performance), 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Análise Radar */}
            <Card className="[box-shadow:var(--shadow-card)]">
              <CardHeader>
                <CardTitle>Análise Multidimensional</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={kpis.slice(0, 5).map(kpi => ({
                    metric: kpi.column.substring(0, 10),
                    value: Math.abs(parseFloat(kpi.trendPercent)),
                  }))}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top & Bottom Performers */}
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Maiores Variações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-accent flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Maiores Crescimentos
                  </h4>
                  <div className="space-y-3">
                    {[...kpis]
                      .sort((a, b) => parseFloat(b.trendPercent) - parseFloat(a.trendPercent))
                      .slice(0, 3)
                      .map((kpi) => (
                        <div key={kpi.column} className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                          <span className="text-sm font-medium capitalize">{kpi.column}</span>
                          <span className="text-sm font-bold text-accent">+{kpi.trendPercent}%</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-destructive flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Maiores Quedas
                  </h4>
                  <div className="space-y-3">
                    {[...kpis]
                      .sort((a, b) => parseFloat(a.trendPercent) - parseFloat(b.trendPercent))
                      .slice(0, 3)
                      .map((kpi) => (
                        <div key={kpi.column} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                          <span className="text-sm font-medium capitalize">{kpi.column}</span>
                          <span className="text-sm font-bold text-destructive">{kpi.trendPercent}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Projeções e Análise de Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  {numericalColumns.slice(0, 2).map((col, index) => (
                    <>
                      <Area
                        key={`area-${col}`}
                        type="monotone"
                        dataKey={col}
                        fill={COLORS[index]}
                        fillOpacity={0.2}
                        stroke="none"
                      />
                      <Line
                        key={`line-${col}`}
                        type="monotone"
                        dataKey={col}
                        stroke={COLORS[index]}
                        strokeWidth={3}
                        dot={{ fill: COLORS[index], r: 5 }}
                      />
                    </>
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Volatilidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpis.slice(0, 3).map((kpi, index) => {
              const volatility = Math.abs(parseFloat(kpi.trendPercent));
              const stability = volatility < 10 ? "Estável" : volatility < 25 ? "Moderado" : "Volátil";
              return (
                <Card key={kpi.column} className="[box-shadow:var(--shadow-card)]">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${volatility < 10 ? "bg-accent/10" : volatility < 25 ? "bg-primary/10" : "bg-destructive/10"}`}>
                        {volatility < 10 ? <Target className="h-5 w-5 text-accent" /> : 
                         volatility < 25 ? <Activity className="h-5 w-5 text-primary" /> : 
                         <Zap className="h-5 w-5 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Volatilidade</p>
                        <p className="font-semibold capitalize">{kpi.column}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">{volatility.toFixed(1)}%</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          volatility < 10 ? "bg-accent/10 text-accent" : 
                          volatility < 25 ? "bg-primary/10 text-primary" : 
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {stability}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Variação: {kpi.min.toLocaleString("pt-BR")} - {kpi.max.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cenário Otimista */}
            <Card className="[box-shadow:var(--shadow-card)] border-accent/50">
              <CardHeader className="bg-accent/5">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Cenário Otimista
                </CardTitle>
                <CardDescription>Crescimento de 20% em todas as métricas</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {kpis.slice(0, 3).map((kpi) => (
                    <div key={kpi.column} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">{kpi.column}</span>
                        <span className="text-sm font-bold text-accent">
                          {(kpi.avg * 1.2).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Atual: {kpi.avg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cenário Realista */}
            <Card className="[box-shadow:var(--shadow-card)] border-primary/50">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Cenário Realista
                </CardTitle>
                <CardDescription>Crescimento de 10% baseado em tendências</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {kpis.slice(0, 3).map((kpi) => (
                    <div key={kpi.column} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">{kpi.column}</span>
                        <span className="text-sm font-bold text-primary">
                          {(kpi.avg * 1.1).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Atual: {kpi.avg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cenário Pessimista */}
            <Card className="[box-shadow:var(--shadow-card)] border-destructive/50">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  Cenário Pessimista
                </CardTitle>
                <CardDescription>Queda de 10% nas métricas</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {kpis.slice(0, 3).map((kpi) => (
                    <div key={kpi.column} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">{kpi.column}</span>
                        <span className="text-sm font-bold text-destructive">
                          {(kpi.avg * 0.9).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Atual: {kpi.avg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análise de Impacto */}
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Análise de Impacto Financeiro</CardTitle>
              <CardDescription>Projeção de resultados em diferentes cenários</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={kpis.slice(0, 3).map(kpi => ({
                    metric: kpi.column,
                    Atual: kpi.avg,
                    Otimista: kpi.avg * 1.2,
                    Realista: kpi.avg * 1.1,
                    Pessimista: kpi.avg * 0.9,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Atual" fill="hsl(var(--muted))" />
                  <Bar dataKey="Otimista" fill="hsl(var(--accent))" />
                  <Bar dataKey="Realista" fill="hsl(var(--primary))" />
                  <Bar dataKey="Pessimista" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Matriz de Risco */}
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Matriz de Risco e Oportunidade</CardTitle>
              <CardDescription>Análise de variação e impacto das métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    dataKey="volatility"
                    name="Volatilidade"
                    stroke="hsl(var(--foreground))"
                    label={{ value: 'Volatilidade (%)', position: 'bottom' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="impact"
                    name="Impacto"
                    stroke="hsl(var(--foreground))"
                    label={{ value: 'Impacto', angle: -90, position: 'left' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Legend />
                  <Scatter
                    name="Métricas"
                    data={kpis.slice(0, 5).map(kpi => ({
                      name: kpi.column,
                      volatility: Math.abs(parseFloat(kpi.trendPercent)),
                      impact: kpi.sum / 1000,
                    }))}
                    fill="hsl(var(--primary))"
                  >
                    {kpis.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-accent/10">
                  <p className="font-semibold mb-1">Alto Impacto + Baixa Volatilidade</p>
                  <p className="text-muted-foreground">Métricas estáveis e importantes - manter foco</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="font-semibold mb-1">Alto Impacto + Alta Volatilidade</p>
                  <p className="text-muted-foreground">Áreas de risco - requerem atenção imediata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Recomendações Estratégicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="[box-shadow:var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Ações Recomendadas
                </CardTitle>
                <CardDescription>Iniciativas prioritárias baseadas nos dados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis
                    .sort((a, b) => parseFloat(b.trendPercent) - parseFloat(a.trendPercent))
                    .slice(0, 3)
                    .map((kpi, index) => (
                      <div key={kpi.column} className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold capitalize mb-1">{kpi.column}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {parseFloat(kpi.trendPercent) > 0
                                ? `Aproveitar o momentum positivo de ${kpi.trendPercent}% para expandir investimentos nesta área.`
                                : `Reverter a queda de ${kpi.trendPercent}% através de ações corretivas urgentes.`}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant={parseFloat(kpi.trendPercent) > 0 ? "default" : "destructive"}>
                                {parseFloat(kpi.trendPercent) > 0 ? "Oportunidade" : "Urgente"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Impacto: {kpi.sum > 10000 ? "Alto" : "Médio"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="[box-shadow:var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Pontos de Atenção
                </CardTitle>
                <CardDescription>Áreas que requerem monitoramento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis
                    .filter(kpi => parseFloat(kpi.trendPercent) < 0)
                    .slice(0, 3)
                    .map((kpi, index) => (
                      <div key={kpi.column} className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold capitalize mb-1">{kpi.column}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Tendência negativa de {Math.abs(parseFloat(kpi.trendPercent))}%. 
                              Recomenda-se análise detalhada e plano de ação corretivo.
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Variação: {kpi.min.toLocaleString("pt-BR")} - {kpi.max.toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {kpis.filter(kpi => parseFloat(kpi.trendPercent) < 0).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-accent" />
                      <p>Todas as métricas apresentam tendência positiva!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plano de Ação Trimestral */}
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Plano de Ação Trimestral</CardTitle>
              <CardDescription>Roadmap estratégico baseado na análise de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["Curto Prazo (30 dias)", "Médio Prazo (60-90 dias)", "Longo Prazo (90+ dias)"].map((period, periodIndex) => (
                  <div key={period}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {period}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {kpis.slice(periodIndex * 2, periodIndex * 2 + 2).map((kpi) => (
                        <div key={kpi.column} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize text-sm">{kpi.column}</span>
                            <Badge variant="outline" className="text-xs">
                              {parseFloat(kpi.trendPercent) > 0 ? "Expandir" : "Otimizar"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {parseFloat(kpi.trendPercent) > 0
                              ? `Meta: Aumentar em ${Math.abs(parseFloat(kpi.trendPercent) * 0.5).toFixed(1)}%`
                              : `Meta: Reverter tendência e crescer ${Math.abs(parseFloat(kpi.trendPercent) * 0.3).toFixed(1)}%`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPIs de Monitoramento */}
          <Card className="[box-shadow:var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Dashboard de Monitoramento Contínuo</CardTitle>
              <CardDescription>Métricas críticas para acompanhamento semanal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.slice(0, 4).map((kpi) => (
                  <div key={kpi.column} className="text-center p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">{kpi.column}</p>
                    <p className="text-2xl font-bold mb-1">
                      {kpi.avg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs">
                      {parseFloat(kpi.trendPercent) > 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-accent" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-destructive" />
                      )}
                      <span className={parseFloat(kpi.trendPercent) > 0 ? "text-accent" : "text-destructive"}>
                        {Math.abs(parseFloat(kpi.trendPercent))}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="[box-shadow:var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Insights Executivos</CardTitle>
            <CardDescription>Análise automática dos principais indicadores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis.slice(0, 3).map((kpi) => (
              <div key={kpi.column} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className={`p-2 rounded-lg ${kpi.trend === "up" ? "bg-accent/10" : "bg-destructive/10"}`}>
                  {kpi.trend === "up" ? (
                    <TrendingUp className={`h-5 w-5 ${kpi.trend === "up" ? "text-accent" : "text-destructive"}`} />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold capitalize">{kpi.column}</h4>
                    <Badge variant={kpi.trend === "up" ? "default" : "destructive"}>
                      {Math.abs(parseFloat(kpi.trendPercent))}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {kpi.trend === "up" ? "Crescimento" : "Queda"} de {Math.abs(parseFloat(kpi.trendPercent))}% no período analisado.
                    Média de {kpi.avg.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}, 
                    com valores entre {kpi.min.toLocaleString("pt-BR")} e {kpi.max.toLocaleString("pt-BR")}.
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Saúde Geral do Negócio */}
        <Card className="[box-shadow:var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Saúde Geral do Negócio</CardTitle>
            <CardDescription>Indicadores de performance consolidados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Score Geral */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-accent to-primary mb-3">
                  <div className="text-4xl font-bold text-white">
                    {(() => {
                      const positiveCount = kpis.filter(k => parseFloat(k.trendPercent) > 0).length;
                      const score = Math.round((positiveCount / kpis.length) * 100);
                      return score;
                    })()}
                  </div>
                </div>
                <p className="text-sm font-semibold">Score de Performance</p>
                <p className="text-xs text-muted-foreground">
                  {kpis.filter(k => parseFloat(k.trendPercent) > 0).length} de {kpis.length} métricas positivas
                </p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-accent">Forças</span>
                  </div>
                  <p className="text-2xl font-bold">{kpis.filter(k => parseFloat(k.trendPercent) > 0).length}</p>
                  <p className="text-xs text-muted-foreground">Métricas em crescimento</p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-xs font-semibold text-destructive">Atenção</span>
                  </div>
                  <p className="text-2xl font-bold">{kpis.filter(k => parseFloat(k.trendPercent) < 0).length}</p>
                  <p className="text-xs text-muted-foreground">Métricas em queda</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Comparativa Temporal */}
      <Card className="[box-shadow:var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Análise Temporal Comparativa</CardTitle>
              <CardDescription>Evolução das métricas ao longo do tempo</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                {numericalColumns.slice(0, 3).map((col, index) => (
                  <linearGradient key={col} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[index]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[index]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="periodo" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              {numericalColumns.slice(0, 3).map((col, index) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index]}
                  fill={`url(#gradient-${index})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Benchmarking e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kpis.slice(0, 3).map((kpi) => {
          const current = kpi.avg;
          const target = kpi.max * 1.1; // Meta 10% acima do máximo
          const progress = Math.min((current / target) * 100, 100);
          return (
            <Card key={kpi.column} className="[box-shadow:var(--shadow-card)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize flex items-center justify-between">
                  {kpi.column}
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>Meta vs Realizado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {current.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">Atual</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {target.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">Meta</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span className="font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
