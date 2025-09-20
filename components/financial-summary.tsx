"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialStorage } from "@/lib/financial-storage"
import type { MonthSummary } from "@/types/financial"
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react"

interface FinancialSummaryProps {
  year: string
  month: string
  refreshTrigger: number
}

export function FinancialSummary({ year, month, refreshTrigger }: FinancialSummaryProps) {
  const [summary, setSummary] = useState<MonthSummary>({
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    totalLancamentos: 0,
  })

  useEffect(() => {
    const monthSummary = FinancialStorage.getMonthSummary(year, month)
    setSummary(monthSummary)
  }, [year, month, refreshTrigger])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const monthName = months[Number.parseInt(month) - 1]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.totalEntradas)}
          </div>
          <p className="text-xs text-muted-foreground">
            {monthName} de {year}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalSaidas)}</div>
          <p className="text-xs text-muted-foreground">
            {monthName} de {year}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${summary.saldo >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
          >
            {formatCurrency(summary.saldo)}
          </div>
          <p className="text-xs text-muted-foreground">Entradas - Saídas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Lançamentos</CardTitle>
          <FileText className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.totalLancamentos}</div>
          <p className="text-xs text-muted-foreground">Registros no período</p>
        </CardContent>
      </Card>
    </div>
  )
}
