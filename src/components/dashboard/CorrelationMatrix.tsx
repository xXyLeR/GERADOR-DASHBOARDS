import { Card } from "@/components/ui/card";
import { useMemo } from "react";

interface CorrelationMatrixProps {
  data: any[];
  numericColumns: string[];
}

export const CorrelationMatrix = ({ data, numericColumns }: CorrelationMatrixProps) => {
  const correlations = useMemo(() => {
    if (numericColumns.length < 2) return null;

    const toNumber = (value: any): number => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const matrix: { [key: string]: { [key: string]: number } } = {};

    numericColumns.forEach((col1) => {
      matrix[col1] = {};
      numericColumns.forEach((col2) => {
        const values1 = data.map(row => toNumber(row[col1]));
        const values2 = data.map(row => toNumber(row[col2]));

        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

        let numerator = 0;
        let denom1 = 0;
        let denom2 = 0;

        for (let i = 0; i < values1.length; i++) {
          const diff1 = values1[i] - mean1;
          const diff2 = values2[i] - mean2;
          numerator += diff1 * diff2;
          denom1 += diff1 * diff1;
          denom2 += diff2 * diff2;
        }

        const correlation = numerator / Math.sqrt(denom1 * denom2);
        matrix[col1][col2] = isNaN(correlation) ? 0 : correlation;
      });
    });

    return matrix;
  }, [data, numericColumns]);

  if (!correlations || numericColumns.length < 2) return null;

  const getColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.8) return value > 0 ? "bg-accent" : "bg-destructive";
    if (absValue > 0.6) return value > 0 ? "bg-accent/70" : "bg-destructive/70";
    if (absValue > 0.4) return value > 0 ? "bg-accent/40" : "bg-destructive/40";
    return "bg-muted";
  };

  return (
    <Card className="p-6 [box-shadow:var(--shadow-card)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Matriz de Correlação
      </h3>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${numericColumns.length}, 100px)` }}>
            <div></div>
            {numericColumns.map((col) => (
              <div key={col} className="text-xs font-semibold text-center p-2 truncate" title={col}>
                {col.substring(0, 10)}
              </div>
            ))}
            {numericColumns.map((col1) => (
              <>
                <div key={`label-${col1}`} className="text-xs font-semibold p-2 truncate" title={col1}>
                  {col1.substring(0, 15)}
                </div>
                {numericColumns.map((col2) => (
                  <div
                    key={`${col1}-${col2}`}
                    className={`${getColor(correlations[col1][col2])} p-2 text-xs text-center font-semibold rounded flex items-center justify-center`}
                  >
                    {correlations[col1][col2].toFixed(2)}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent rounded"></div>
          <span>Correlação Positiva Forte (&gt; 0.8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive rounded"></div>
          <span>Correlação Negativa Forte (&lt; -0.8)</span>
        </div>
      </div>
    </Card>
  );
};
