"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { FinancialStorage } from "@/lib/financial-storage"
import type { FinancialEntry } from "@/types/financial"

interface FinancialEntryFormProps {
  selectedYear: string
  selectedMonth: string
  onEntryAdded: () => void
}

export function FinancialEntryForm({ selectedYear, selectedMonth, onEntryAdded }: FinancialEntryFormProps) {
  const [type, setType] = useState<"entrada" | "saida">("entrada")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"impostos" | "folha-pagamento" | "outras">("outras")
  const [quantity, setQuantity] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validações
      if (!value || Number.parseFloat(value) <= 0) {
        toast({
          title: "Erro",
          description: "O valor deve ser maior que zero",
          variant: "destructive",
        })
        return
      }

      const numQuantity = Number.parseInt(quantity) || 1
      if (numQuantity <= 0 || numQuantity > 100) {
        toast({
          title: "Erro",
          description: "A quantidade deve ser entre 1 e 100",
          variant: "destructive",
        })
        return
      }

      // Criar os lançamentos baseado na quantidade
      const baseEntry: Omit<FinancialEntry, "id"> = {
        type,
        value: Number.parseFloat(value),
        description: description.trim() || undefined,
        category: type === "saida" && category ? category : undefined,
        date: `${selectedYear}-${selectedMonth.padStart(2, "0")}-01`,
        createdAt: new Date().toISOString(),
      }

      // Adicionar múltiplos lançamentos se quantidade > 1
      for (let i = 0; i < numQuantity; i++) {
        const entry: FinancialEntry = {
          ...baseEntry,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
        }
        FinancialStorage.addEntry(entry)
      }

      // Limpar formulário
      setValue("")
      setDescription("")
      setCategory("outras")
      setQuantity("1")

      toast({
        title: "Sucesso",
        description: `${numQuantity} lançamento(s) adicionado(s) com sucesso`,
      })

      onEntryAdded()
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o lançamento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="type" className="text-sm font-medium">
            Tipo *
          </Label>
          <Select value={type} onValueChange={(value: "entrada" | "saida") => setType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="value" className="text-sm font-medium">
            Valor (R$) *
          </Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrição
        </Label>
        <Textarea
          id="description"
          placeholder="Descrição opcional do lançamento..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {type === "saida" && (
        <div className="space-y-3">
          <Label htmlFor="category" className="text-sm font-medium">
            Categoria
          </Label>
          <Select
            value={category}
            onValueChange={(value: "impostos" | "folha-pagamento" | "outras") => setCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outras">Outras</SelectItem>
              <SelectItem value="impostos">Impostos</SelectItem>
              <SelectItem value="folha-pagamento">Folha de Pagamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="quantity" className="text-sm font-medium">
          Quantidade de Lançamentos
        </Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max="100"
          placeholder="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Número de vezes que este lançamento será repetido (útil para lançamentos recorrentes)
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adicionando..." : `Adicionar ${quantity} Lançamento(s)`}
      </Button>
    </form>
  )
}
