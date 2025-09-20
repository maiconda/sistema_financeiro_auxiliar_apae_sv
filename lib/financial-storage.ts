import type { FinancialData, FinancialEntry, MonthSummary } from "@/types/financial"

const STORAGE_KEY = "apae-financial-data"
const BACKUP_KEY = "apae-financial-backup"

export class FinancialStorage {
  static getData(): FinancialData {
    if (typeof window === "undefined") {
      return { entries: {}, lastUpdated: new Date().toISOString() }
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        return { entries: {}, lastUpdated: new Date().toISOString() }
      }
      return JSON.parse(data)
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error)
      return this.getBackupData()
    }
  }

  static saveData(data: FinancialData): void {
    if (typeof window === "undefined") return

    try {
      data.lastUpdated = new Date().toISOString()
      const jsonData = JSON.stringify(data)

      const currentData = localStorage.getItem(STORAGE_KEY)
      if (currentData) {
        localStorage.setItem(BACKUP_KEY, currentData)
      }

      localStorage.setItem(STORAGE_KEY, jsonData)
    } catch (error) {
      console.error("Erro ao salvar dados no localStorage:", error)
      throw new Error("Não foi possível salvar os dados")
    }
  }

  static getBackupData(): FinancialData {
    if (typeof window === "undefined") {
      return { entries: {}, lastUpdated: new Date().toISOString() }
    }

    try {
      const backupData = localStorage.getItem(BACKUP_KEY)
      if (!backupData) {
        return { entries: {}, lastUpdated: new Date().toISOString() }
      }
      return JSON.parse(backupData)
    } catch (error) {
      console.error("Erro ao carregar backup:", error)
      return { entries: {}, lastUpdated: new Date().toISOString() }
    }
  }

  static addEntry(entry: FinancialEntry): void {
    const data = this.getData()
    const monthKey = entry.date.substring(0, 7) // YYYY-MM

    if (!data.entries[monthKey]) {
      data.entries[monthKey] = []
    }

    data.entries[monthKey].push(entry)
    this.saveData(data)
  }

  static updateEntry(entryId: string, updatedEntry: Partial<FinancialEntry>): boolean {
    const data = this.getData()

    for (const monthKey in data.entries) {
      const entryIndex = data.entries[monthKey].findIndex((entry) => entry.id === entryId)
      if (entryIndex !== -1) {
        data.entries[monthKey][entryIndex] = {
          ...data.entries[monthKey][entryIndex],
          ...updatedEntry,
        }
        this.saveData(data)
        return true
      }
    }
    return false
  }

  static deleteEntry(entryId: string): boolean {
    const data = this.getData()

    for (const monthKey in data.entries) {
      const initialLength = data.entries[monthKey].length
      data.entries[monthKey] = data.entries[monthKey].filter((entry) => entry.id !== entryId)

      if (data.entries[monthKey].length < initialLength) {
        this.saveData(data)
        return true
      }
    }
    return false
  }

  static getMonthEntries(year: string, month: string): FinancialEntry[] {
    const data = this.getData()
    const monthKey = `${year}-${month.padStart(2, "0")}`
    return data.entries[monthKey] || []
  }

  static getYearEntries(year: string): FinancialEntry[] {
    const data = this.getData()
    const yearEntries: FinancialEntry[] = []

    for (let month = 1; month <= 12; month++) {
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`
      if (data.entries[monthKey]) {
        yearEntries.push(...data.entries[monthKey])
      }
    }

    return yearEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  static getAllEntries(): FinancialEntry[] {
    const data = this.getData()
    const allEntries: FinancialEntry[] = []

    for (const monthKey in data.entries) {
      allEntries.push(...data.entries[monthKey])
    }

    return allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  static getMonthSummary(year: string, month: string): MonthSummary {
    const entries = this.getMonthEntries(year, month)

    const totalEntradas = entries
      .filter((entry) => entry.type === "entrada")
      .reduce((sum, entry) => sum + entry.value, 0)

    const totalSaidas = entries.filter((entry) => entry.type === "saida").reduce((sum, entry) => sum + entry.value, 0)

    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      totalLancamentos: entries.length,
    }
  }

  static getYearSummary(year: string): MonthSummary {
    const entries = this.getYearEntries(year)

    const totalEntradas = entries
      .filter((entry) => entry.type === "entrada")
      .reduce((sum, entry) => sum + entry.value, 0)

    const totalSaidas = entries.filter((entry) => entry.type === "saida").reduce((sum, entry) => sum + entry.value, 0)

    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      totalLancamentos: entries.length,
    }
  }

  static getOverallSummary(): MonthSummary {
    const entries = this.getAllEntries()

    const totalEntradas = entries
      .filter((entry) => entry.type === "entrada")
      .reduce((sum, entry) => sum + entry.value, 0)

    const totalSaidas = entries.filter((entry) => entry.type === "saida").reduce((sum, entry) => sum + entry.value, 0)

    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      totalLancamentos: entries.length,
    }
  }

  static exportData(): string {
    const data = this.getData()
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: "1.0",
      source: "APAE Salto Veloso - Sistema Financeiro",
    }
    return JSON.stringify(exportData, null, 2)
  }

  static importData(jsonData: string): void {
    try {
      const importedData = JSON.parse(jsonData)

      // Validação da estrutura
      if (!importedData.entries || typeof importedData.entries !== "object") {
        throw new Error("Formato de dados inválido: estrutura 'entries' não encontrada")
      }

      // Validação dos lançamentos
      for (const monthKey in importedData.entries) {
        if (!Array.isArray(importedData.entries[monthKey])) {
          throw new Error(`Formato inválido para o mês ${monthKey}`)
        }

        for (const entry of importedData.entries[monthKey]) {
          if (!entry.id || !entry.type || typeof entry.value !== "number") {
            throw new Error("Lançamento com dados inválidos encontrado")
          }
        }
      }

      // Criar backup dos dados atuais antes de importar
      const currentData = this.getData()
      localStorage.setItem(BACKUP_KEY, JSON.stringify(currentData))

      // Importar os novos dados
      const finalData: FinancialData = {
        entries: importedData.entries,
        lastUpdated: new Date().toISOString(),
      }

      this.saveData(finalData)
    } catch (error) {
      console.error("Erro ao importar dados:", error)
      throw new Error("Arquivo JSON inválido ou corrompido")
    }
  }

  static validateData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      const data = this.getData()

      if (!data.entries) {
        errors.push("Estrutura de dados inválida")
        return { isValid: false, errors }
      }

      let totalEntries = 0
      for (const monthKey in data.entries) {
        if (!Array.isArray(data.entries[monthKey])) {
          errors.push(`Dados do mês ${monthKey} estão corrompidos`)
          continue
        }

        for (const entry of data.entries[monthKey]) {
          totalEntries++

          if (!entry.id) {
            errors.push(`Lançamento sem ID encontrado no mês ${monthKey}`)
          }

          if (!entry.type || !["entrada", "saida"].includes(entry.type)) {
            errors.push(`Tipo inválido no lançamento ${entry.id}`)
          }

          if (typeof entry.value !== "number" || entry.value <= 0) {
            errors.push(`Valor inválido no lançamento ${entry.id}`)
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    } catch (error) {
      errors.push("Erro crítico na validação dos dados")
      return { isValid: false, errors }
    }
  }

  static getSystemStats() {
    const data = this.getData()
    const allEntries = this.getAllEntries()

    const stats = {
      totalMonths: Object.keys(data.entries).length,
      totalEntries: allEntries.length,
      totalEntradas: allEntries.filter((e) => e.type === "entrada").length,
      totalSaidas: allEntries.filter((e) => e.type === "saida").length,
      oldestEntry: allEntries.length > 0 ? allEntries[0].date : null,
      newestEntry: allEntries.length > 0 ? allEntries[allEntries.length - 1].date : null,
      lastUpdated: data.lastUpdated,
      dataSize: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY)?.length || 0 : 0,
    }

    return stats
  }

  static clearAllData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BACKUP_KEY)
  }
}
