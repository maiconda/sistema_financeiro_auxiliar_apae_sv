import { FinancialStorage } from "./financial-storage"
import * as XLSX from "xlsx"

// Função para converter dados para formato Excel (usando SheetJS)
export class ExcelGenerator {
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  private static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  private static getCategoryLabel(category?: string): string {
    switch (category) {
      case "impostos":
        return "Impostos"
      case "folha-pagamento":
        return "Folha de Pagamento"
      default:
        return "Outras"
    }
  }

  private static formatField(value?: string): string {
    return value && value.trim() !== "" ? value : "-"
  }

  private static getWeekday(dateString: string): string {
    const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    return weekdays[new Date(dateString).getDay()]
  }

  private static calculateTrends(entries: any[]): any {
    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2))
    const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2))

    const firstHalfTotal = firstHalf.reduce((sum, e) => sum + (e.type === "entrada" ? e.value : -e.value), 0)
    const secondHalfTotal = secondHalf.reduce((sum, e) => sum + (e.type === "entrada" ? e.value : -e.value), 0)

    const trend =
      secondHalfTotal > firstHalfTotal ? "Crescimento" : secondHalfTotal < firstHalfTotal ? "Declínio" : "Estável"
    const trendPercentage =
      firstHalfTotal !== 0 ? ((secondHalfTotal - firstHalfTotal) / Math.abs(firstHalfTotal)) * 100 : 0

    return { trend, trendPercentage: trendPercentage.toFixed(2) }
  }

  private static downloadExcel(workbook: any, filename: string): void {
    try {
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        compression: true,
      })

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao gerar arquivo XLSX:", error)
      this.downloadFallback(workbook, filename)
    }
  }

  private static downloadFallback(workbook: any, filename: string): void {
    let content = ""

    workbook.SheetNames.forEach((sheetName: string, sheetIndex: number) => {
      if (sheetIndex > 0) content += "\n\n"
      content += `=== ${sheetName} ===\n`

      const sheet = workbook.Sheets[sheetName]
      const range = sheet["!ref"]
      if (!range) return

      const [start, end] = range.split(":")
      const startCol = start.charCodeAt(0) - 65
      const startRow = Number.parseInt(start.slice(1))
      const endCol = end.charCodeAt(0) - 65
      const endRow = Number.parseInt(end.slice(1))

      for (let row = startRow; row <= endRow; row++) {
        const rowData = []
        for (let col = startCol; col <= endCol; col++) {
          const cellAddress = String.fromCharCode(65 + col) + row
          const cell = sheet[cellAddress]
          rowData.push(cell ? cell.v : "")
        }
        content += rowData.join("\t") + "\n"
      }
    })

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename.replace(".xlsx", ".txt")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  private static createWorkbook(): any {
    return XLSX.utils.book_new()
  }

  private static addWorksheet(workbook: any, sheetName: string, data: any[][]): void {
    const worksheet = XLSX.utils.aoa_to_sheet(data)

    const colWidths = data[0].map((_, colIndex) => {
      const maxLength = Math.max(...data.map((row) => String(row[colIndex] || "").length))
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
    })
    worksheet["!cols"] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  }

  static generateAllYearsReport(): void {
    try {
      const allEntries = FinancialStorage.getAllEntries()

      if (allEntries.length === 0) {
        throw new Error("Nenhum dado encontrado para gerar o relatório")
      }

      const workbook = this.createWorkbook()

      const yearGroups = new Map<string, any[]>()
      const yearSummaries = new Map<string, { entradas: number; saidas: number; saldo: number; count: number }>()
      const categorySummaries = new Map<string, number>()

      allEntries.forEach((entry) => {
        const year = entry.date.substring(0, 4)

        if (!yearGroups.has(year)) {
          yearGroups.set(year, [])
          yearSummaries.set(year, { entradas: 0, saidas: 0, saldo: 0, count: 0 })
        }

        yearGroups.get(year)!.push(entry)
        const summary = yearSummaries.get(year)!

        if (entry.type === "entrada") {
          summary.entradas += entry.value
        } else {
          summary.saidas += entry.value
          const category = entry.category || "outras"
          categorySummaries.set(category, (categorySummaries.get(category) || 0) + entry.value)
        }
        summary.saldo = summary.entradas - summary.saidas
        summary.count++
      })

      const totalEntradas = Array.from(yearSummaries.values()).reduce((sum, s) => sum + s.entradas, 0)
      const totalSaidas = Array.from(yearSummaries.values()).reduce((sum, s) => sum + s.saidas, 0)
      const saldoGeralTodosAnos = totalEntradas - totalSaidas

      const allEntriesData = [
        ["RELATÓRIO GERAL - TODOS OS LANÇAMENTOS - APAE SALTO VELOSO"],
        ["Gerado em:", new Date().toLocaleString("pt-BR")],
        [""],
        ["=== SALDO GERAL DE TODOS OS ANOS ==="],
        ["SALDO GERAL:", this.formatCurrency(saldoGeralTodosAnos)],
        ["Total de Entradas:", this.formatCurrency(totalEntradas)],
        ["Total de Saídas:", this.formatCurrency(totalSaidas)],
        ["Status:", saldoGeralTodosAnos > 0 ? "POSITIVO" : saldoGeralTodosAnos < 0 ? "NEGATIVO" : "NEUTRO"],
        [""],
        ["=== LANÇAMENTOS POR ANO ==="],
        ["Tipo", "Valor", "Descrição", "Categoria"],
      ]

      Array.from(yearGroups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([year, entries]) => {
          allEntriesData.push([`=== ANO ${year} ===`, "", "", ""])

          entries
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach((entry) => {
              allEntriesData.push([
                entry.type === "entrada" ? "Entrada" : "Saída",
                this.formatCurrency(entry.value),
                this.formatField(entry.description),
                entry.category ? this.getCategoryLabel(entry.category) : "-",
              ])
            })

          const yearSummary = yearSummaries.get(year)!
          allEntriesData.push([
            `SALDO DO ANO ${year}:`,
            this.formatCurrency(yearSummary.saldo),
            `Entradas: ${this.formatCurrency(yearSummary.entradas)}`,
            `Saídas: ${this.formatCurrency(yearSummary.saidas)}`,
          ])
          allEntriesData.push(["", "", "", ""])
        })

      this.addWorksheet(workbook, "Todos os Lançamentos", allEntriesData)

      const yearSummaryData = [
        ["SOMAS POR ANO"],
        [""],
        ["Ano", "Total Entradas", "Total Saídas", "Saldo", "Qtd Lançamentos", "Média Entradas", "Média Saídas"],
      ]

      Array.from(yearSummaries.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([year, summary]) => {
          const avgEntradas =
            summary.entradas > 0
              ? summary.entradas / allEntries.filter((e) => e.date.startsWith(year) && e.type === "entrada").length
              : 0
          const avgSaidas =
            summary.saidas > 0
              ? summary.saidas / allEntries.filter((e) => e.date.startsWith(year) && e.type === "saida").length
              : 0

          yearSummaryData.push([
            year,
            this.formatCurrency(summary.entradas),
            this.formatCurrency(summary.saidas),
            this.formatCurrency(summary.saldo),
            summary.count.toString(),
            this.formatCurrency(avgEntradas),
            this.formatCurrency(avgSaidas),
          ])
        })

      this.addWorksheet(workbook, "Somas dos Anos", yearSummaryData)

      const totalSummaryData = [
        ["RESUMO GERAL DE TODOS OS ANOS"],
        [""],
        ["=== SALDO GERAL ==="],
        ["SALDO GERAL DE TODOS OS ANOS", this.formatCurrency(saldoGeralTodosAnos)],
        [""],
        ["=== DETALHAMENTO ==="],
        ["Métrica", "Valor"],
        ["Total de Anos com Dados", yearSummaries.size.toString()],
        ["Total de Lançamentos", allEntries.length.toString()],
        ["Total de Entradas", this.formatCurrency(totalEntradas)],
        ["Total de Saídas", this.formatCurrency(totalSaidas)],
        ["Média Anual de Entradas", this.formatCurrency(totalEntradas / yearSummaries.size)],
        ["Média Anual de Saídas", this.formatCurrency(totalSaidas / yearSummaries.size)],
        ["Média de Lançamentos por Ano", (allEntries.length / yearSummaries.size).toFixed(2)],
        ["Status Geral", saldoGeralTodosAnos > 0 ? "POSITIVO" : saldoGeralTodosAnos < 0 ? "NEGATIVO" : "NEUTRO"],
      ]

      this.addWorksheet(workbook, "Totais Gerais", totalSummaryData)

      const categoryData = [
        ["CATEGORIAS DE TODOS OS ANOS"],
        [""],
        ["Categoria", "Total Gasto", "% do Total de Saídas", "Média por Ano"],
      ]

      Array.from(categorySummaries.entries())
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, total]) => {
          const percentage = ((total / totalSaidas) * 100).toFixed(2)
          const avgPerYear = total / yearSummaries.size

          categoryData.push([
            this.getCategoryLabel(category),
            this.formatCurrency(total),
            `${percentage}%`,
            this.formatCurrency(avgPerYear),
          ])
        })

      this.addWorksheet(workbook, "Categorias Gerais", categoryData)

      const filename = `APAE-Relatorio-Geral-Completo-${new Date().toISOString().split("T")[0]}.xlsx`
      this.downloadExcel(workbook, filename)
    } catch (error) {
      console.error("Erro ao gerar relatório geral:", error)
      throw error
    }
  }

  static generateYearReport(year: string): void {
    try {
      const yearEntries = FinancialStorage.getYearEntries(year)

      if (yearEntries.length === 0) {
        throw new Error(`Nenhum dados encontrado para o ano ${year}`)
      }

      const workbook = this.createWorkbook()

      const monthGroups = new Map<string, any[]>()
      const monthSummaries = new Map<string, { entradas: number; saidas: number; saldo: number; count: number }>()
      const categorySummaries = new Map<string, number>()

      yearEntries.forEach((entry) => {
        const month = entry.date.substring(5, 7)

        if (!monthGroups.has(month)) {
          monthGroups.set(month, [])
          monthSummaries.set(month, { entradas: 0, saidas: 0, saldo: 0, count: 0 })
        }

        monthGroups.get(month)!.push(entry)
        const summary = monthSummaries.get(month)!

        if (entry.type === "entrada") {
          summary.entradas += entry.value
        } else {
          summary.saidas += entry.value
          const category = entry.category || "outras"
          categorySummaries.set(category, (categorySummaries.get(category) || 0) + entry.value)
        }
        summary.saldo = summary.entradas - summary.saidas
        summary.count++
      })

      const monthNames = [
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

      const yearTotals = Array.from(monthSummaries.values()).reduce(
        (acc, month) => ({
          entradas: acc.entradas + month.entradas,
          saidas: acc.saidas + month.saidas,
          count: acc.count + month.count,
        }),
        { entradas: 0, saidas: 0, count: 0 },
      )

      const saldoAnual = yearTotals.entradas - yearTotals.saidas

      const allMonthsData = [
        [`TODOS OS LANÇAMENTOS DE ${year} - APAE SALTO VELOSO`],
        ["Gerado em:", new Date().toLocaleString("pt-BR")],
        [""],
        [`=== SALDO ANUAL DE ${year} ===`],
        [`SALDO ANUAL:`, this.formatCurrency(saldoAnual)],
        ["Total de Entradas:", this.formatCurrency(yearTotals.entradas)],
        ["Total de Saídas:", this.formatCurrency(yearTotals.saidas)],
        ["Status:", saldoAnual > 0 ? "POSITIVO" : saldoAnual < 0 ? "NEGATIVO" : "NEUTRO"],
        [""],
        ["=== LANÇAMENTOS POR MÊS ==="],
        ["Tipo", "Valor", "Descrição", "Categoria"],
      ]

      for (let i = 1; i <= 12; i++) {
        const monthStr = i.toString().padStart(2, "0")
        const monthName = monthNames[i - 1]
        const entries = monthGroups.get(monthStr) || []

        if (entries.length > 0) {
          allMonthsData.push([`=== ${monthName.toUpperCase()} ${year} ===`, "", "", ""])

          entries
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach((entry) => {
              allMonthsData.push([
                entry.type === "entrada" ? "Entrada" : "Saída",
                this.formatCurrency(entry.value),
                this.formatField(entry.description),
                entry.category ? this.getCategoryLabel(entry.category) : "-",
              ])
            })

          const monthSummary = monthSummaries.get(monthStr)!
          allMonthsData.push([
            `SALDO DE ${monthName.toUpperCase()}:`,
            this.formatCurrency(monthSummary.saldo),
            `Entradas: ${this.formatCurrency(monthSummary.entradas)}`,
            `Saídas: ${this.formatCurrency(monthSummary.saidas)}`,
          ])
          allMonthsData.push(["", "", "", ""])
        }
      }

      this.addWorksheet(workbook, "Lançamentos por Mês", allMonthsData)

      const monthSummaryData = [
        [`SOMAS DE CADA MÊS - ${year}`],
        [""],
        ["Mês", "Total Entradas", "Total Saídas", "Saldo", "Qtd Lançamentos", "Média Diária"],
      ]

      for (let i = 1; i <= 12; i++) {
        const monthStr = i.toString().padStart(2, "0")
        const monthName = monthNames[i - 1]
        const summary = monthSummaries.get(monthStr) || { entradas: 0, saidas: 0, saldo: 0, count: 0 }
        const daysInMonth = new Date(Number.parseInt(year), i, 0).getDate()
        const avgDaily = summary.count > 0 ? (summary.entradas - summary.saidas) / daysInMonth : 0

        monthSummaryData.push([
          monthName,
          this.formatCurrency(summary.entradas),
          this.formatCurrency(summary.saidas),
          this.formatCurrency(summary.saldo),
          summary.count.toString(),
          this.formatCurrency(avgDaily),
        ])
      }

      this.addWorksheet(workbook, "Somas Mensais", monthSummaryData)

      const categoryYearData = [
        [`SOMAS DE CATEGORIA - ${year}`],
        [""],
        ["Categoria", "Total Gasto", "% do Total", "Qtd Lançamentos", "Valor Médio"],
      ]

      const totalSaidasYear = Array.from(categorySummaries.values()).reduce((sum, val) => sum + val, 0)

      Array.from(categorySummaries.entries())
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, total]) => {
          const percentage = totalSaidasYear > 0 ? ((total / totalSaidasYear) * 100).toFixed(2) : "0.00"
          const count = yearEntries.filter((e) => e.type === "saida" && (e.category || "outras") === category).length
          const avgValue = count > 0 ? total / count : 0

          categoryYearData.push([
            this.getCategoryLabel(category),
            this.formatCurrency(total),
            `${percentage}%`,
            count.toString(),
            this.formatCurrency(avgValue),
          ])
        })

      this.addWorksheet(workbook, "Categorias do Ano", categoryYearData)

      const totalYearData = [
        [`TOTAIS DO ANO ${year}`],
        [""],
        [`=== SALDO ANUAL DE ${year} ===`],
        [`SALDO ANUAL:`, this.formatCurrency(saldoAnual)],
        [""],
        ["=== DETALHAMENTO ==="],
        ["Métrica", "Valor"],
        ["Total de Lançamentos", yearTotals.count.toString()],
        ["Total de Entradas", this.formatCurrency(yearTotals.entradas)],
        ["Total de Saídas", this.formatCurrency(yearTotals.saidas)],
        ["Média Mensal de Entradas", this.formatCurrency(yearTotals.entradas / 12)],
        ["Média Mensal de Saídas", this.formatCurrency(yearTotals.saidas / 12)],
        ["Média de Lançamentos por Mês", (yearTotals.count / 12).toFixed(2)],
        ["Status do Ano", saldoAnual > 0 ? "POSITIVO" : saldoAnual < 0 ? "NEGATIVO" : "NEUTRO"],
      ]

      this.addWorksheet(workbook, "Totais do Ano", totalYearData)

      const filename = `APAE-Relatorio-Anual-${year}-${new Date().toISOString().split("T")[0]}.xlsx`
      this.downloadExcel(workbook, filename)
    } catch (error) {
      console.error(`Erro ao gerar relatório do ano ${year}:`, error)
      throw error
    }
  }

  static generateMonthReport(year: string, month: string): void {
    try {
      const monthEntries = FinancialStorage.getMonthEntries(year, month)

      if (monthEntries.length === 0) {
        throw new Error(`Nenhum dado encontrado para ${month}/${year}`)
      }

      const workbook = this.createWorkbook()

      const monthNames = [
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
      const monthName = monthNames[Number.parseInt(month) - 1]

      const totalEntradas = monthEntries.filter((e) => e.type === "entrada").reduce((sum, e) => sum + e.value, 0)
      const totalSaidas = monthEntries.filter((e) => e.type === "saida").reduce((sum, e) => sum + e.value, 0)
      const saldoMes = totalEntradas - totalSaidas

      const allEntriesData = [
        [`TODOS OS LANÇAMENTOS - ${monthName.toUpperCase()} ${year} - APAE SALTO VELOSO`],
        ["Gerado em:", new Date().toLocaleString("pt-BR")],
        [""],
        [`=== SALDO DO MÊS DE ${monthName.toUpperCase()} ===`],
        [`SALDO MENSAL:`, this.formatCurrency(saldoMes)],
        ["Total de Entradas:", this.formatCurrency(totalEntradas)],
        ["Total de Saídas:", this.formatCurrency(totalSaidas)],
        ["Status:", saldoMes > 0 ? "POSITIVO" : saldoMes < 0 ? "NEGATIVO" : "NEUTRO"],
        [""],
        ["=== LANÇAMENTOS DO MÊS ==="],
        ["Tipo", "Valor", "Descrição", "Categoria"],
      ]

      monthEntries
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach((entry) => {
          allEntriesData.push([
            entry.type === "entrada" ? "Entrada" : "Saída",
            this.formatCurrency(entry.value),
            this.formatField(entry.description),
            entry.category ? this.getCategoryLabel(entry.category) : "-",
          ])
        })

      this.addWorksheet(workbook, "Todos os Lançamentos", allEntriesData)

      const categorySums = new Map<string, { total: number; count: number; entries: any[] }>()

      monthEntries.forEach((entry) => {
        if (entry.type === "saida") {
          const category = entry.category || "outras"
          if (!categorySums.has(category)) {
            categorySums.set(category, { total: 0, count: 0, entries: [] })
          }
          const catData = categorySums.get(category)!
          catData.total += entry.value
          catData.count++
          catData.entries.push(entry)
        }
      })

      const categorySumsData = [
        [`SOMAS POR CATEGORIA - ${monthName.toUpperCase()} ${year}`],
        [""],
        ["Categoria", "Total Gasto", "Qtd Lançamentos", "Valor Médio", "Maior Valor", "Menor Valor"],
      ]

      Array.from(categorySums.entries())
        .sort(([, a], [, b]) => b.total - a.total)
        .forEach(([category, data]) => {
          const values = data.entries.map((e) => e.value)
          const maxValue = Math.max(...values)
          const minValue = Math.min(...values)
          const avgValue = data.total / data.count

          categorySumsData.push([
            this.getCategoryLabel(category),
            this.formatCurrency(data.total),
            data.count.toString(),
            this.formatCurrency(avgValue),
            this.formatCurrency(maxValue),
            this.formatCurrency(minValue),
          ])
        })

      this.addWorksheet(workbook, "Somas por Categoria", categorySumsData)

      const totalMonthData = [
        [`TOTAIS DO MÊS - ${monthName.toUpperCase()} ${year}`],
        [""],
        [`=== SALDO DO MÊS DE ${monthName.toUpperCase()} ===`],
        [`SALDO MENSAL:`, this.formatCurrency(saldoMes)],
        [""],
        ["=== DETALHAMENTO ==="],
        ["Métrica", "Valor"],
        ["Total de Lançamentos", monthEntries.length.toString()],
        ["Quantidade de Entradas", monthEntries.filter((e) => e.type === "entrada").length.toString()],
        ["Quantidade de Saídas", monthEntries.filter((e) => e.type === "saida").length.toString()],
        ["Total de Entradas", this.formatCurrency(totalEntradas)],
        ["Total de Saídas", this.formatCurrency(totalSaidas)],
        [
          "Média por Entrada",
          totalEntradas > 0
            ? this.formatCurrency(totalEntradas / monthEntries.filter((e) => e.type === "entrada").length)
            : "R$ 0,00",
        ],
        [
          "Média por Saída",
          totalSaidas > 0
            ? this.formatCurrency(totalSaidas / monthEntries.filter((e) => e.type === "saida").length)
            : "R$ 0,00",
        ],
        [
          "Média Diária",
          this.formatCurrency(saldoMes / new Date(Number.parseInt(year), Number.parseInt(month), 0).getDate()),
        ],
        ["Status do Mês", saldoMes > 0 ? "POSITIVO" : saldoMes < 0 ? "NEGATIVO" : "NEUTRO"],
      ]

      this.addWorksheet(workbook, "Totais do Mês", totalMonthData)

      const filename = `APAE-Relatorio-Mensal-${monthName}-${year}-${new Date().toISOString().split("T")[0]}.xlsx`
      this.downloadExcel(workbook, filename)
    } catch (error) {
      console.error(`Erro ao gerar relatório do mês ${month}/${year}:`, error)
      throw error
    }
  }
}
