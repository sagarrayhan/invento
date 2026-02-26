import { ExcelData, SubmittedItems, Tile } from "@/app/data/types";
import * as XLSX from 'xlsx'



export function tilesToExcel(submits: SubmittedItems) {


    const plainData: ExcelData[] = []



    submits.items.forEach(item => {
        const nestedItems = item.items || []
        nestedItems.forEach(g => {
            plainData.push({
                CODE: item.code,
                GRID: g.grid,
                HISTORY: g.history,
                QUANTITY: g.quantity,
                TOTAL: item.quantity

            })
        })
    })

    if (plainData.length === 0) {
        return
    }

    const tilesSheet = XLSX.utils.json_to_sheet(plainData)
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, tilesSheet, "Tiles List")
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })

    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${submits.key}.xlsx`
    a.click()
}


export function exportAll(tiles: Tile[] | null) {
    interface ExportRow {
        Code: string,
        Quantity: number
    }
    const plainData: ExportRow[] = []

    if(!tiles){
        return
    }



    tiles.forEach(item => {
        plainData.push({
            Code: item.code,
            Quantity: Number(item.quantity || 0)
        })
    })

    if (plainData.length === 0) {
        return
    }

    ExcelDownload(plainData)


}

export function ExcelDownload<T extends object>(data: T[]) {
    const tilesSheet = XLSX.utils.json_to_sheet(data)
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, tilesSheet, "Tiles List")
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })

    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "allTiles.xlsx"
    a.click()
}

export function mergedTilesToExcel(tiles: Tile[], fileName = "all_submitted_merged.xlsx") {
    const rows: ExcelData[] = []

    tiles.forEach((tile) => {
        const items = tile.items || []

        if (items.length === 0) {
            rows.push({
                CODE: tile.code,
                GRID: "",
                HISTORY: "",
                QUANTITY: "0",
                TOTAL: Number(tile.quantity || 0),
            })
            return
        }

        items.forEach((item) => {
            rows.push({
                CODE: tile.code,
                GRID: item.grid,
                HISTORY: item.history,
                QUANTITY: item.quantity,
                TOTAL: Number(tile.quantity || 0),
            })
        })
    })

    if (rows.length === 0) {
        return
    }

    const tilesSheet = XLSX.utils.json_to_sheet(rows)
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, tilesSheet, "Merged Tiles")
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })

    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
}
