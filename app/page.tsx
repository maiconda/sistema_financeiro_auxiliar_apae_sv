"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  FileText,
  Download,
  Database,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Building2,
} from "lucide-react"
import { FinancialStorage } from "@/lib/financial-storage"
import { DataManagement } from "@/components/data-management"
import { ReportsGenerator } from "@/components/reports-generator"
import { FinancialEntryForm } from "@/components/financial-entry-form"
import { FinancialEntriesList } from "@/components/financial-entries-list"

export default function HomePage() {
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [summary, setSummary] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    totalLancamentos: 0,
    mediaEntradas: 0,
    mediaSaidas: 0,
  })
  const [globalStats, setGlobalStats] = useState({
    totalAnos: 0,
    totalMeses: 0,
    totalGeral: 0,
    saldoGeral: 0,
  })
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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

  useEffect(() => {
    const allEntries = FinancialStorage.getAllEntries()
    const years = new Set(allEntries.map((e) => e.date.substring(0, 4)))
    const months = new Set(allEntries.map((e) => e.date.substring(0, 7)))

    const totalEntradas = allEntries.filter((e) => e.type === "entrada").reduce((sum, e) => sum + e.value, 0)
    const totalSaidas = allEntries.filter((e) => e.type === "saida").reduce((sum, e) => sum + e.value, 0)

    setGlobalStats({
      totalAnos: years.size,
      totalMeses: months.size,
      totalGeral: allEntries.length,
      saldoGeral: totalEntradas - totalSaidas,
    })

    if (selectedYear && selectedMonth) {
      const monthSummary = FinancialStorage.getMonthSummary(selectedYear, selectedMonth)
      const monthEntries = FinancialStorage.getMonthEntries(selectedYear, selectedMonth)
      const entradas = monthEntries.filter((e) => e.type === "entrada")
      const saidas = monthEntries.filter((e) => e.type === "saida")

      setSummary({
        ...monthSummary,
        mediaEntradas: entradas.length > 0 ? monthSummary.totalEntradas / entradas.length : 0,
        mediaSaidas: saidas.length > 0 ? monthSummary.totalSaidas / saidas.length : 0,
      })
    }
  }, [selectedYear, selectedMonth, refreshTrigger])

  const handleEntryAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="relative bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Sistema Financeiro</h1>
                <p className="text-xl text-primary-foreground/90">APAE Salto Veloso</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              {globalStats.totalGeral} lançamentos
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{globalStats.totalAnos}</div>
              <div className="text-sm opacity-90">Anos com dados</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{globalStats.totalMeses}</div>
              <div className="text-sm opacity-90">Meses ativos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{globalStats.totalGeral}</div>
              <div className="text-sm opacity-90">Total lançamentos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(globalStats.saldoGeral)}</div>
              <div className="text-sm opacity-90">Saldo geral</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 -mt-8 relative z-10">
        <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              Seleção de Período
            </CardTitle>
            <CardDescription className="text-base">
              Selecione o ano e mês para gerenciar os lançamentos financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground/80 block">Ano</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year} className="text-lg">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground/80 block">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!selectedYear}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value} className="text-lg">
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedYear && selectedMonth && (
          <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-10 w-10 text-accent" />
                </div>
                Novo Lançamento - {months.find((m) => m.value === selectedMonth)?.label} de {selectedYear}
              </CardTitle>
              <CardDescription className="text-base">
                Cadastre entradas e saídas financeiras de forma rápida e intuitiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialEntryForm
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onEntryAdded={handleEntryAdded}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Dialog open={showReports} onOpenChange={setShowReports}>
            <DialogTrigger asChild>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Download className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Relatórios Excel</h3>
                  <p className="text-muted-foreground mb-6 text-base">
                    Gere relatórios detalhados em formato XLSX com análises completas
                  </p>
                  <Button size="lg" className="w-full">
                    Gerar Relatórios
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Gerador de Relatórios Excel (XLSX)</DialogTitle>
                <DialogDescription className="text-base">
                  Gere relatórios detalhados em formato Excel para análise financeira completa
                </DialogDescription>
              </DialogHeader>
              <ReportsGenerator />
            </DialogContent>
          </Dialog>

          <Dialog open={showDataManagement} onOpenChange={setShowDataManagement}>
            <DialogTrigger asChild>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-secondary/10 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Database className="h-10 w-10 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Gerenciar Dados</h3>
                  <p className="text-muted-foreground mb-6 text-base">
                    Importar, exportar e validar dados do sistema financeiro
                  </p>
                  <Button size="lg" variant="secondary" className="w-full">
                    Gerenciar Dados
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Gerenciamento de Dados</DialogTitle>
                <DialogDescription className="text-base">
                  Importe, exporte e gerencie os dados do sistema financeiro
                </DialogDescription>
              </DialogHeader>
              <DataManagement />
            </DialogContent>
          </Dialog>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-accent/10 rounded-2xl w-fit mx-auto mb-4">
                <Activity className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Backup Automático</h3>
              <p className="text-muted-foreground mb-6 text-base">Sistema protegido com backup automático dos dados</p>
              <Button size="lg" variant="outline" className="w-full bg-transparent" disabled>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Sistema Ativo
              </Button>
            </CardContent>
          </Card>
        </div>

        {selectedYear && selectedMonth && (
          <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-chart-1" />
                </div>
                Dashboard - {months.find((m) => m.value === selectedMonth)?.label} de {selectedYear}
              </CardTitle>
              <CardDescription className="text-base">
                Análise detalhada do desempenho financeiro do período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Entradas
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(summary.totalEntradas)}
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">Total de Entradas</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(summary.mediaEntradas)}
                    </p>
                    <p className="text-xs text-green-600/60 dark:text-green-400/60">Média por lançamento</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Saídas
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(summary.totalSaidas)}
                    </p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">Total de Saídas</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(summary.mediaSaidas)}
                    </p>
                    <p className="text-xs text-red-600/60 dark:text-red-400/60">Média por lançamento</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <DollarSign className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      Saldo
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(summary.saldo)}
                    </p>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Saldo do Mês</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{summary.totalLancamentos}</p>
                    <p className="text-xs text-blue-600/60 dark:text-blue-400/60">Total de lançamentos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedYear && selectedMonth && (
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-muted rounded-lg">
                  <PieChart className="h-6 w-6 text-foreground" />
                </div>
                Lançamentos - {months.find((m) => m.value === selectedMonth)?.label} de {selectedYear}
              </CardTitle>
              <CardDescription className="text-base">
                Histórico completo de entradas e saídas do período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialEntriesList
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                refreshTrigger={refreshTrigger}
                onEntryDeleted={handleEntryAdded}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
