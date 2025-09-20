"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ExcelGenerator } from "@/lib/excel-generator"
import { FileSpreadsheet, Calendar, CalendarDays, Database, Download, BarChart3 } from "lucide-react"

export function ReportsGenerator() {
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<string>("")
  const { toast } = useToast()

  // Gerar anos de 2020 até 2030
  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString())

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ]

  const handleGenerateAllYears = async () => {
    try {
      setIsGenerating("all")
      ExcelGenerator.generateAllYearsReport()
      toast({
        title: "Sucesso",
        description: "Relatório geral completo gerado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao gerar relatório geral:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsGenerating("")
    }
  }

  const handleGenerateYear = async () => {
    if (!selectedYear) {
      toast({
        title: "Erro",
        description: "Selecione um ano para gerar o relatório",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating("year")
      ExcelGenerator.generateYearReport(selectedYear)
      toast({
        title: "Sucesso",
        description: `Relatório anual de ${selectedYear} gerado com sucesso`,
      })
    } catch (error) {
      console.error("Erro ao gerar relatório anual:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsGenerating("")
    }
  }

  const handleGenerateMonth = async () => {
    if (!selectedYear || !selectedMonth) {
      toast({
        title: "Erro",
        description: "Selecione um ano e mês para gerar o relatório",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating("month")
      ExcelGenerator.generateMonthReport(selectedYear, selectedMonth)
      const monthName = months.find((m) => m.value === selectedMonth)?.label
      toast({
        title: "Sucesso",
        description: `Relatório mensal de ${monthName} ${selectedYear} gerado com sucesso`,
      })
    } catch (error) {
      console.error("Erro ao gerar relatório mensal:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsGenerating("")
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header do Modal */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h2>
        </div>
        <p className="text-muted-foreground text-base">
          Gere relatórios detalhados em formato Excel (.xlsx) com análises completas dos dados financeiros da APAE
        </p>
      </div>

      {/* Seleção de Período */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Calendar className="h-6 w-6 text-primary" />
            Seleção de Período
          </CardTitle>
          <CardDescription className="text-sm">
            Escolha o período específico para gerar relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground block">Ano para Relatórios Específicos</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground block">Mês para Relatório Mensal</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!selectedYear}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatórios */}
      <div className="space-y-4">
        {/* Relatório Geral */}
        <Card className="border-2 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Database className="h-6 w-6 text-blue-600" />
              Relatório Geral
            </CardTitle>
            <CardDescription className="text-sm">
              Análise completa de todos os dados registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Todos os lançamentos separados por ano</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Somas detalhadas de cada ano</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Totais gerais de todos os anos</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Análise de categorias globais</span>
                </div>
              </div>
              <Button onClick={handleGenerateAllYears} disabled={isGenerating !== ""} className="w-full h-10">
                <Download className="h-4 w-4 mr-2" />
                {isGenerating === "all" ? "Gerando Relatório..." : "Gerar Relatório Geral"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relatório Anual */}
        <Card className="border-2 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <CalendarDays className="h-6 w-6 text-green-600" />
              Relatório Anual
            </CardTitle>
            <CardDescription className="text-sm">Análise detalhada de um ano específico selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Lançamentos de todos os meses do ano</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Somas detalhadas de cada mês</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Análise de categorias do ano</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Totais consolidados do ano</span>
                </div>
              </div>
              <Button
                onClick={handleGenerateYear}
                disabled={!selectedYear || isGenerating !== ""}
                className="w-full h-10 bg-transparent"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating === "year" ? "Gerando Relatório..." : "Gerar Relatório Anual"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relatório Mensal */}
        <Card className="border-2 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <FileSpreadsheet className="h-6 w-6 text-purple-600" />
              Relatório Mensal
            </CardTitle>
            <CardDescription className="text-sm">Análise completa de um mês específico selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Todos os lançamentos do mês</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Somas detalhadas por categoria</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Totais consolidados do mês</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Análise de performance mensal</span>
                </div>
              </div>
              <Button
                onClick={handleGenerateMonth}
                disabled={!selectedYear || !selectedMonth || isGenerating !== ""}
                className="w-full h-10 bg-transparent"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating === "month" ? "Gerando Relatório..." : "Gerar Relatório Mensal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Técnicas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900 flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6" />
            Especificações dos Relatórios XLSX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 text-sm">Formato e Qualidade</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Arquivos Excel nativos (.xlsx)</p>
                <p>• Múltiplas planilhas organizadas</p>
                <p>• Formatação profissional</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 text-sm">Dados e Análises</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Valores em Real brasileiro (R$)</p>
                <p>• Saldos calculados automaticamente</p>
                <p>• Análises estatísticas detalhadas</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 text-sm">Organização</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Categorias bem estruturadas</p>
                <p>• Totais e subtotais automáticos</p>
                <p>• Layout profissional e limpo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
