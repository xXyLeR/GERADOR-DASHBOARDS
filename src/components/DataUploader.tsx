import { useState, useRef, ChangeEvent } from "react";
import { Upload, FileSpreadsheet, Type, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DataUploaderProps {
  onDataLoaded: (data: any[]) => void;
  onDatasetSaved?: () => void;
}

export const DataUploader = ({ onDataLoaded, onDatasetSaved }: DataUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [textData, setTextData] = useState("");
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [datasetName, setDatasetName] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Por favor, envie apenas arquivos CSV");
      return;
    }

    setFileName(file.name);
    setDatasetName(file.name.replace(".csv", ""));

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
          toast.success(`${results.data.length} registros carregados!`);
        } else {
          toast.error("Nenhum dado encontrado no arquivo");
        }
      },
      error: (error) => {
        toast.error(`Erro ao processar: ${error.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleTextData = () => {
    if (!textData.trim()) {
      toast.error("Por favor, insira alguns dados");
      return;
    }

    Papa.parse(textData, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
          setFileName("manual-input.csv");
          setDatasetName("Dados Manuais");
          toast.success(`${results.data.length} registros processados!`);
        } else {
          toast.error("Nenhum dado encontrado");
        }
      },
      error: (error) => {
        toast.error(`Erro: ${error.message}`);
      },
    });
  };

  const handleSaveDataset = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error("Nenhum dado para salvar");
      return;
    }

    if (!datasetName.trim()) {
      toast.error("Por favor, insira um nome para o dataset");
      return;
    }

    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organização não encontrada");
      }

      const columns = Object.keys(parsedData[0]);

      const { error } = await supabase.from("datasets").insert({
        organization_id: profile.organization_id,
        user_id: user?.id,
        name: datasetName,
        file_name: fileName,
        data: parsedData,
        row_count: parsedData.length,
        column_count: columns.length,
      });

      if (error) throw error;

      toast.success("Dataset salvo com sucesso!");
      onDataLoaded(parsedData);
      if (onDatasetSaved) onDatasetSaved();
      
      // Reset form
      setParsedData(null);
      setDatasetName("");
      setFileName("");
      setTextData("");
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadWithoutSaving = () => {
    if (parsedData) {
      onDataLoaded(parsedData);
      toast.success("Dados carregados!");
    }
  };

  return (
    <Card className="p-8 [box-shadow:var(--shadow-card)] hover:[box-shadow:var(--shadow-hover)] transition-all duration-300">
      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={mode === "upload" ? "default" : "outline"}
          onClick={() => setMode("upload")}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload de Arquivo
        </Button>
        <Button
          variant={mode === "text" ? "default" : "outline"}
          onClick={() => setMode("text")}
          className="gap-2"
        >
          <Type className="h-4 w-4" />
          Entrada Manual
        </Button>
      </div>

      {mode === "upload" ? (
        <div
          className={`flex flex-col items-center justify-center space-y-4 text-center p-8 rounded-lg border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="rounded-full bg-primary/10 p-6">
            {isDragging ? (
              <FileSpreadsheet className="h-12 w-12 text-primary animate-pulse" />
            ) : (
              <Upload className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Carregue seu arquivo CSV
            </h3>
            <p className="text-muted-foreground">
              Arraste e solte aqui ou clique para selecionar
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="[box-shadow:var(--shadow-elegant)]"
          >
            Selecionar Arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Insira seus dados
            </h3>
            <p className="text-sm text-muted-foreground">
              Cole seus dados no formato CSV (cabeçalhos na primeira linha, valores separados por vírgula)
            </p>
          </div>
          <Textarea
            placeholder="nome,idade,cidade&#10;João,25,São Paulo&#10;Maria,30,Rio de Janeiro&#10;Pedro,28,Belo Horizonte"
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
          <Button
            onClick={handleTextData}
            size="lg"
            className="w-full [box-shadow:var(--shadow-elegant)]"
          >
            Processar Dados
          </Button>
        </div>
      )}

      {parsedData && parsedData.length > 0 && (
        <div className="mt-6 space-y-4 pt-6 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="dataset-name">Nome do Dataset</Label>
            <Input
              id="dataset-name"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="Ex: Vendas Q1 2024"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveDataset}
              className="flex-1 gap-2"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              Salvar e Analisar
            </Button>
            <Button
              onClick={handleLoadWithoutSaving}
              variant="outline"
              className="flex-1"
            >
              Apenas Analisar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {parsedData.length} registros • {Object.keys(parsedData[0]).length} colunas
          </p>
        </div>
      )}
    </Card>
  );
};
