"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { FinancialEntryForm } from "@/components/financial-entry-form"
import { FinancialEntriesList } from "@/components/financial-entries-list"
import { FinancialSummary } from "@/components/financial-summary"

export default function LancamentosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const year = searchParams.get("year") || ""
  const month = searchParams.get("month") || ""

  useEffect(() => {
    if (!year || !month) {
      router.push("/")
    }
  }, [year, month, router])

  const handleEntryAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
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

  if (!year || !month) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Lançamentos Financeiros</h1>
          <p className="text-primary-foreground/80">
            {monthName} de {year} - APAE Salto Veloso
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Resumo Financeiro */}
        <FinancialSummary year={year} month={month} refreshTrigger={refreshTrigger} />

        {/* Formulário de Novo Lançamento */}
        <FinancialEntryForm year={year} month={month} onEntryAdded={handleEntryAdded} />

        {/* Lista de Lançamentos */}
        <FinancialEntriesList year={year} month={month} refreshTrigger={refreshTrigger} />
      </main>
    </div>
  )
}
