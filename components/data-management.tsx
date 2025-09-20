"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FinancialStorage } from "@/lib/financial-storage"
import { Download, Upload, Database, AlertTriangle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null)
  const { toast } = useToast()

  const handleExportData = () => {
    try {
      setIsExporting(true)
      const jsonData = FinancialStorage.exportData()

      // Criar arquivo para download
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      const now = new Date()
      const filename = `apae-financeiro-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}.json`

      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso",
      })
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        FinancialStorage.importData(jsonData)

        toast({
          title: "Sucesso",
          description: "Dados importados com sucesso",
        })

        // Limpar o input
        event.target.value = ""

        // Recarregar a página para atualizar todos os componentes
        window.location.reload()
      } catch (error) {
        console.error("Erro ao importar dados:", error)
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Não foi possível importar os dados",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
      }
    }

    reader.onerror = () => {
      toast({
        title: "Erro",
        description: "Não foi possível ler o arquivo",
        variant: "destructive",
      })
      setIsImporting(false)
    }

    reader.readAsText(file)
  }

  const handleValidateData = () => {
    try {
      const result = FinancialStorage.validateData()
      setValidationResult(result)

      if (result.isValid) {
        toast({
          title: "Validação Concluída",
          description: "Todos os dados estão íntegros",
        })
      } else {
        toast({
          title: "Problemas Encontrados",
          description: `${result.errors.length} erro(s) encontrado(s)`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro na validação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível validar os dados",
        variant: "destructive",
      })
    }
  }

  const stats = FinancialStorage.getSystemStats()

  return (
    <div className="w-full space-y-6 p-4">
      {/* Estatísticas do Sistema */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Database className="h-6 w-6" />
            Estatísticas do Sistema
          </CardTitle>
          <CardDescription className="text-base">Informações sobre os dados armazenados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalEntries}</p>
              <p className="text-sm text-muted-foreground mt-1">Total de Lançamentos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.totalEntradas}</p>
              <p className="text-sm text-muted-foreground mt-1">Entradas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.totalSaidas}</p>
              <p className="text-sm text-muted-foreground mt-1">Saídas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalMonths}</p>
              <p className="text-sm text-muted-foreground mt-1">Meses com Dados</p>
            </div>
          </div>

          {stats.lastUpdated && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <p className="text-sm text-muted-foreground">
                  Última atualização: {new Date(stats.lastUpdated).toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tamanho dos dados: {(stats.dataSize / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gerenciamento de Dados - Layout Vertical */}
      <div className="space-y-6">
        {/* Exportar Dados */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Download className="h-6 w-6" />
              Exportar Dados
            </CardTitle>
            <CardDescription className="text-base">Faça backup dos seus dados em formato JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-base font-semibold">Informações sobre o Backup</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• O arquivo será salvo com a data atual no nome para facilitar a organização dos backups</p>
                    <p>• Recomendamos fazer backups regulares para garantir a segurança dos dados</p>
                    <p>• O arquivo JSON contém todos os lançamentos financeiros registrados</p>
                    <p>• Compatível com importação em outros sistemas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-base font-semibold">Dados Incluídos</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Todas as entradas e saídas financeiras</p>
                    <p>• Categorias e descrições</p>
                    <p>• Datas e valores completos</p>
                    <p>• Metadados do sistema</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-3">
                <Button onClick={handleExportData} disabled={isExporting} className="w-full max-w-md h-12 text-base">
                  <Download className="h-5 w-5 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar Dados"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Importar Dados */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Upload className="h-6 w-6" />
              Importar Dados
            </CardTitle>
            <CardDescription className="text-base">Restaure dados de um arquivo JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-file" className="text-base font-medium">
                      Selecionar arquivo JSON
                    </Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      disabled={isImporting}
                      className="mt-2 h-10 text-sm"
                    />
                  </div>
                  {isImporting && <p className="text-sm text-muted-foreground">Importando dados...</p>}
                </div>
                <div className="flex items-center">
                  <Alert className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Atenção:</strong> A importação substituirá todos os dados atuais. Faça um backup antes de
                      prosseguir para evitar perda de informações.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validação de Dados */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <CheckCircle className="h-6 w-6" />
            Validação de Dados
          </CardTitle>
          <CardDescription className="text-base">Verifique a integridade dos dados armazenados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={handleValidateData}
                variant="outline"
                className="w-full max-w-md h-12 text-base bg-transparent"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Validar Dados
              </Button>
            </div>

            {validationResult && (
              <Alert variant={validationResult.isValid ? "default" : "destructive"} className="text-sm">
                {validationResult.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertDescription>
                  {validationResult.isValid ? (
                    "Todos os dados estão íntegros e válidos."
                  ) : (
                    <div>
                      <p className="font-semibold mb-2">Problemas encontrados:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
