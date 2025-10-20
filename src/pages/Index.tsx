import { useState, useRef, useEffect } from "react";
import { DataUploader } from "@/components/DataUploader";
import { Dashboard } from "@/components/Dashboard";
import { ReportExporter } from "@/components/ReportExporter";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { ExecutiveReportExporter } from "@/components/ExecutiveReportExporter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LogOut, Database, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const [data, setData] = useState<any[] | null>(null);
  const [savedDatasets, setSavedDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadDatasets();
      loadUserRoles();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", user?.id)
      .maybeSingle();
    
    setProfile(profileData);
  };

  const loadUserRoles = async () => {
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id);
    
    if (rolesData) {
      setUserRoles(rolesData.map((r) => r.role));
    }
  };

  const loadDatasets = async () => {
    const { data: datasets, error } = await supabase
      .from("datasets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && datasets) {
      setSavedDatasets(datasets);
    }
  };

  const handleLoadDataset = async (datasetId: string) => {
    const dataset = savedDatasets.find((d) => d.id === datasetId);
    if (dataset) {
      setData(dataset.data);
      setSelectedDataset(datasetId);
      toast({
        title: "Dataset carregado",
        description: `${dataset.name} foi carregado com sucesso.`,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const getUserInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isExecutive = userRoles.includes("c_level") || userRoles.includes("admin") || userRoles.includes("owner");

  return (
    <div className="min-h-screen bg-[image:var(--gradient-subtle)]">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 [box-shadow:var(--shadow-card)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Plataforma de Análise de Dados
                </h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.organizations?.name || "Carregando..."}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {savedDatasets.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Datasets salvos:</span>
              {savedDatasets.map((dataset) => (
                <Button
                  key={dataset.id}
                  variant={selectedDataset === dataset.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLoadDataset(dataset.id)}
                >
                  {dataset.name}
                </Button>
              ))}
            </div>
          )}
          
          {!data ? (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <DataUploader onDataLoaded={setData} onDatasetSaved={loadDatasets} />
            </div>
          ) : (
            <>
              <div className="flex justify-end gap-2">
                {isExecutive && (
                  <div className="flex items-center gap-2 mr-auto px-3 py-1 rounded-lg bg-accent/10 text-accent">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">Modo Executivo</span>
                  </div>
                )}
                <Button variant="outline" onClick={() => setData(null)}>
                  Novo Dataset
                </Button>
              </div>
              
              {isExecutive ? (
                <Tabs defaultValue="standard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="standard">Análise Padrão</TabsTrigger>
                    <TabsTrigger value="executive">Visão Executiva</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="space-y-6">
                    <div ref={dashboardRef} className="space-y-6">
                      <Dashboard data={data} />
                    </div>
                    <ReportExporter dashboardRef={dashboardRef} />
                  </TabsContent>
                  
                  <TabsContent value="executive" className="space-y-6">
                    <div ref={dashboardRef} className="space-y-6">
                      <ExecutiveDashboard data={data} />
                    </div>
                    <ExecutiveReportExporter dashboardRef={dashboardRef} datasetId={selectedDataset || undefined} />
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  <div ref={dashboardRef} className="space-y-6">
                    <Dashboard data={data} />
                  </div>
                  <ReportExporter dashboardRef={dashboardRef} />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
