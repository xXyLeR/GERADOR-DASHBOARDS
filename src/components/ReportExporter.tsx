import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useState } from "react";

interface ReportExporterProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
}

export const ReportExporter = ({ dashboardRef }: ReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) {
      toast.error("Nenhum relatório para exportar");
      return;
    }

    if (isExporting) return;
    setIsExporting(true);

    const toastId = toast.loading("Gerando PDF...");
    
    try {
      // Aguarda um momento para garantir que os gráficos estão renderizados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: dashboardRef.current.scrollWidth,
        windowHeight: dashboardRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Adiciona primeira página
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adiciona páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `relatorio-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF exportado com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!dashboardRef.current) {
      toast.error("Nenhum relatório para exportar");
      return;
    }

    if (isExporting) return;
    setIsExporting(true);

    const toastId = toast.loading("Gerando imagem...");
    
    try {
      // Aguarda um momento para garantir que os gráficos estão renderizados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: dashboardRef.current.scrollWidth,
        windowHeight: dashboardRef.current.scrollHeight,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Erro ao criar imagem", { id: toastId });
          setIsExporting(false);
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `relatorio-${new Date().toISOString().split("T")[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("Imagem exportada com sucesso!", { id: toastId });
        setIsExporting(false);
      }, "image/png");
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      toast.error("Erro ao gerar imagem. Tente novamente.", { id: toastId });
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-3 justify-center animate-slide-in-right">
      <Button
        onClick={handleExportPDF}
        variant="default"
        size="lg"
        disabled={isExporting}
        className="[box-shadow:var(--shadow-elegant)]"
      >
        <FileText className="mr-2 h-5 w-5" />
        {isExporting ? "Exportando..." : "Exportar PDF"}
      </Button>
      <Button
        onClick={handleExportImage}
        variant="secondary"
        size="lg"
        disabled={isExporting}
        className="[box-shadow:var(--shadow-card)]"
      >
        <Download className="mr-2 h-5 w-5" />
        {isExporting ? "Exportando..." : "Exportar Imagem"}
      </Button>
    </div>
  );
};
