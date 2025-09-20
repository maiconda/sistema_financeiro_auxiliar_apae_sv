export interface FinancialEntry {
  id: string
  type: "entrada" | "saida"
  value: number
  description?: string
  category?: "impostos" | "folha-pagamento"
  date: string // formato YYYY-MM-DD
  createdAt: string
}

export interface MonthlyData {
  [key: string]: FinancialEntry[] // key formato: YYYY-MM
}

export interface FinancialData {
  entries: MonthlyData
  lastUpdated: string
}

export interface MonthSummary {
  totalEntradas: number
  totalSaidas: number
  saldo: number
  totalLancamentos: number
}

export interface YearSummary {
  [month: string]: MonthSummary
}
