import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InsightsPanelProps {
  data: any[];
}

export const InsightsPanel = ({ data }: InsightsPanelProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível para gerar insights</p>
        </CardContent>
      </Card>
    );
  }

  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );

  // Generate insights
  const insights = [];

  // Data quality insight
  const completenessRate = Object.values(data[0] || {}).filter(v => v != null).length / 
                          Object.keys(data[0] || {}).length;
  
  insights.push({
    type: completenessRate > 0.9 ? 'success' : completenessRate > 0.7 ? 'warning' : 'error',
    title: 'Qualidade dos Dados',
    description: `Taxa de completude: ${(completenessRate * 100).toFixed(1)}%. ${
      completenessRate > 0.9 ? 'Excelente qualidade de dados!' : 
      completenessRate > 0.7 ? 'Alguns valores ausentes detectados.' : 
      'Muitos valores ausentes. Considere limpeza de dados.'
    }`,
    icon: completenessRate > 0.9 ? CheckCircle : AlertTriangle,
  });

  // Trend insights
  numericColumns.slice(0, 2).forEach(col => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = ((avgSecond - avgFirst) / avgFirst * 100);

    if (Math.abs(trend) > 10) {
      insights.push({
        type: trend > 0 ? 'success' : 'warning',
        title: `Tendência em ${col}`,
        description: `${trend > 0 ? 'Crescimento' : 'Queda'} de ${Math.abs(trend).toFixed(1)}% observado ao longo do dataset.`,
        icon: trend > 0 ? TrendingUp : TrendingDown,
      });
    }
  });

  // Outlier detection
  numericColumns.slice(0, 2).forEach(col => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    const outliers = values.filter(v => Math.abs(v - mean) > 3 * std).length;
    
    if (outliers > 0) {
      insights.push({
        type: 'warning',
        title: `Outliers em ${col}`,
        description: `${outliers} valores extremos detectados (${(outliers / values.length * 100).toFixed(1)}% dos dados).`,
        icon: AlertCircle,
      });
    }
  });

  // Volume insight
  insights.push({
    type: 'info',
    title: 'Volume de Dados',
    description: `Dataset contém ${data.length.toLocaleString()} registros com ${Object.keys(data[0] || {}).length} colunas. ${
      data.length > 1000 ? 'Volume robusto para análises estatísticas.' : 
      'Considere ampliar a amostra para análises mais precisas.'
    }`,
    icon: AlertCircle,
  });

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'default';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insights Automáticos</CardTitle>
          <CardDescription>Análises e recomendações baseadas nos seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Alert key={index} variant={getAlertVariant(insight.type)}>
                <Icon className="h-4 w-4" />
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>{insight.description}</AlertDescription>
              </Alert>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
          <CardDescription>Próximos passos sugeridos</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Explore correlações</p>
                <p className="text-sm text-muted-foreground">
                  Verifique relações entre variáveis na aba de Correlações
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Analise tendências temporais</p>
                <p className="text-sm text-muted-foreground">
                  Identifique padrões de crescimento ou sazonalidade
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Verifique distribuições</p>
                <p className="text-sm text-muted-foreground">
                  Entenda a distribuição de valores e identifique anomalias
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Exporte relatórios</p>
                <p className="text-sm text-muted-foreground">
                  Compartilhe suas descobertas com a equipe
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
