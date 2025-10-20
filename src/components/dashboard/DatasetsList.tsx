import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface DatasetsListProps {
  datasets: any[];
}

export const DatasetsList = ({ datasets }: DatasetsListProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir dataset");
      return;
    }
    toast.success("Dataset excluído com sucesso");
    queryClient.invalidateQueries({ queryKey: ["datasets"] });
  };

  if (datasets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Nenhum dataset encontrado</p>
          <p className="text-sm text-muted-foreground">
            Faça upload do seu primeiro dataset para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => (
        <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{dataset.name}</CardTitle>
            <CardDescription>{dataset.file_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Linhas:</span>
                <span className="font-medium">{dataset.row_count?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Colunas:</span>
                <span className="font-medium">{dataset.column_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Criado em:</span>
                <span className="font-medium">
                  {new Date(dataset.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => navigate(`/analysis/${dataset.id}`)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analisar
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(dataset.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
