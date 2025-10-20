import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataTableProps {
  data: any[];
  maxRows?: number;
}

export const DataTable = ({ data, maxRows = 10 }: DataTableProps) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]).filter(col => col !== "");
  const displayData = data.slice(0, maxRows);

  return (
    <Card className="p-6 [box-shadow:var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Dados Brutos
        </h3>
        <span className="text-sm text-muted-foreground">
          Mostrando {displayData.length} de {data.length} registros
        </span>
      </div>
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {typeof row[col] === 'number' 
                      ? row[col].toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                      : row[col]?.toString() || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
