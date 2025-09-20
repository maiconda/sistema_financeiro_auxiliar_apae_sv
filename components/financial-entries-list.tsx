"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FinancialStorage } from "@/lib/financial-storage"
import type { FinancialEntry } from "@/types/financial"
import { Trash2, TrendingUp, TrendingDown, List } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FinancialEntriesListProps {
  selectedYear: string
  selectedMonth: string
  refreshTrigger: number
  onEntryDeleted: () => void
}

export function FinancialEntriesList({
  selectedYear,
  selectedMonth,
  refreshTrigger,
  onEntryDeleted,
}: FinancialEntriesListProps) {
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadEntries()
  }, [selectedYear, selectedMonth, refreshTrigger])

  const loadEntries = () => {
    const monthEntries = FinancialStorage.getMonthEntries(selectedYear, selectedMonth)
    // Ordenar por data de criação (mais recente primeiro)
    const sortedEntries = monthEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setEntries(sortedEntries)
  }

  const handleDeleteEntry = (entryId: string) => {
    try {
      const data = FinancialStorage.getData()
      const monthKey = `${selectedYear}-${selectedMonth.padStart(2, "0")}`

      if (data.entries[monthKey]) {
        data.entries[monthKey] = data.entries[monthKey].filter((entry) => entry.id !== entryId)
        FinancialStorage.saveData(data)
        loadEntries()
        onEntryDeleted()

        toast({
          title: "Sucesso",
          description: "Lançamento excluído com sucesso",
        })
      }
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lançamento",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "impostos":
        return "Impostos"
      case "folha-pagamento":
        return "Folha de Pagamento"
      default:
        return "Outras"
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <List className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum lançamento encontrado</h3>
        <p className="text-muted-foreground">Adicione o primeiro lançamento usando o formulário acima</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{entries.length} lançamento(s) registrado(s) neste período</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead className="w-[120px]">Valor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[140px]">Categoria</TableHead>
              <TableHead className="w-[80px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-full ${
                        entry.type === "entrada" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {entry.type === "entrada" ? (
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <Badge variant={entry.type === "entrada" ? "default" : "destructive"} className="text-xs">
                      {entry.type === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={`font-semibold ${
                      entry.type === "entrada" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(entry.value)}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="max-w-[200px]">
                    {entry.description ? (
                      <p className="text-sm truncate" title={entry.description}>
                        {entry.description}
                      </p>
                    ) : (
                      <span className="text-transparent">-</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {entry.category ? (
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(entry.category)}
                    </Badge>
                  ) : (
                    <span className="text-transparent">-</span>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
