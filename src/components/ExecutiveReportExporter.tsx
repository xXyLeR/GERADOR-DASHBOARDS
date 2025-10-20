import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Save, Presentation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExecutiveReportExporterProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  datasetId?: string;
}

export const ExecutiveReportExporter = ({ dashboardRef, datasetId }: ExecutiveReportExporterProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveReport = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para o relatório",
        variant: "destructive",
      });
      return;
    }

    if (!datasetId) {
      toast({
        title: "Erro",
        description: "Nenhum dataset selecionado",
        variant: "destructive",
      });
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

      // Capture dashboard as image data
      const canvas = await html2canvas(dashboardRef.current!);
      const imageData = canvas.toDataURL("image/png");

      const { error } = await supabase.from("executive_reports").insert({
        organization_id: profile.organization_id,
        user_id: user?.id,
        dataset_id: datasetId,
        title,
        description,
        report_data: { imageData, timestamp: new Date().toISOString() },
        report_type: "executive_summary",
      });

      if (error) throw error;

      toast({
        title: "Relatório salvo!",
        description: "Relatório executivo salvo com sucesso.",
      });

      setTitle("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    setExporting(true);
    toast({
      title: "Gerando PDF...",
      description: "Isso pode levar alguns instantes",
    });

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      
      // Add cover page with title
      if (title) {
        pdf.insertPage(1);
        pdf.setFontSize(32);
        pdf.text(title, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() / 2, {
          align: "center",
        });
        if (description) {
          pdf.setFontSize(16);
          pdf.text(description, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() / 2 + 40, {
            align: "center",
            maxWidth: pdf.internal.pageSize.getWidth() - 100,
          });
        }
      }

      pdf.save(`relatorio-executivo-${new Date().getTime()}.pdf`);

      toast({
        title: "PDF Gerado!",
        description: "Download iniciado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 [box-shadow:var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-accent/10 p-2">
          <Presentation className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Relatório Executivo</h3>
          <p className="text-sm text-muted-foreground">
            Salve e exporte relatórios profissionais para apresentações
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="report-title">Título do Relatório</Label>
          <Input
            id="report-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Análise de Vendas Q4 2024"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-description">Descrição (opcional)</Label>
          <Textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Resumo executivo das principais descobertas..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSaveReport}
          disabled={loading || !datasetId}
          className="flex-1 gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar Relatório
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          variant="outline"
          className="flex-1 gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
    </Card>
  );
};
