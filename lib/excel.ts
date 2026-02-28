import { getAllSubmittedData } from "@/app/data/tiles";
import { ExcelData, Item, SubmittedItems, Tile, Total } from "@/app/data/types";
import { getDbUser } from "@/app/data/user";
import { Code } from "lucide-react";
import { it } from "node:test";
import * as XLSX from 'xlsx'



export async function tilesToExcel(submits: SubmittedItems) {


  const plainData: ExcelData[] = []

  const creator = submits.items[0].items[0].createdBy


  submits.items.forEach(item => {
    const nestedItems = item.items || []
    nestedItems.forEach(g => {
      plainData.push({
        CODE: item.code,
        GRID: g.grid,
        HISTORY: g.history,
        SUBMITTED: g.createdBy
      })
    })
  })

  if (plainData.length === 0) {
    return
  }
  const tilesSheet = XLSX.utils.aoa_to_sheet([])

  XLSX.utils.sheet_add_aoa(tilesSheet, [
    ["Tile Inventory Report"],
    [`Created By: ${creator}`],
    [`Date: ${new Date().toLocaleDateString()}`],
    []
  ], { origin: "B2" })

  XLSX.utils.sheet_add_json(tilesSheet, plainData, { origin: "B6" })
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

export async function mergeAll(ids: string[]): Promise<Tile[]> {
  const data = await getAllSubmittedData(ids)
  const tiles = data.flat()


  const mapTile = new Map<string, Tile>()

  tiles.forEach(tile => {
    if (!mapTile.has(tile.code)) {
      mapTile.set(tile.code, { ...tile, items: [...tile.items] })
    } else {
      const existingTile = mapTile.get(tile.code)
      tile.items.forEach(i => {
        const existingGrid = existingTile?.items.find(ei => ei.grid == i.grid)
        if (!existingGrid) {
          existingTile?.items.push(i)
        } else {
          existingGrid.quantity += Number(i.quantity)
          existingGrid.history =
            (existingGrid.history || "") +
            "+" +
            (i.history || "").replace(/^=/, "")
        }
      })

      existingTile!.quantity = existingTile!.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0)

    }
  })

  const items = Array.from(mapTile.values())


  return items
}

export async function downloadTotal(ids: string[]) {

  const data = await getAllSubmittedData(ids)
  const tiles = data.flat()

  const map = new Map<string, number>()

  tiles.forEach(tile => {

    tile.items?.forEach(item => {
      const existing = map.get(tile.code) || 0
      map.set(tile.code, existing + Number(item.quantity || 0))
    })

  })

  const flatData: Total[] = []

  map.forEach((totalQuantity, code) => {
    flatData.push({
      CODE: code,
      QUANTITY: totalQuantity
    })
  })

  exportToExcel(flatData, ids)
}

export async function donwloadDetailed(ids: string[]) {
  const mergedTile = mergeAll(ids)
  const flatData: ExcelData[] = [];

  (await mergedTile).forEach(tile => {
    tile.items.forEach(i => {
      flatData.push({
        CODE: tile.code,
        GRID: i.grid,
        HISTORY: i.history,
        SUBMITTED: i.createdBy
      })

    })
  })

  exportToExcel(flatData, ids)

}

export function exportToExcel(items: any, ids: string[]) {

  const sheet = XLSX.utils.aoa_to_sheet([])
  XLSX.utils.sheet_add_aoa(sheet, [
    ["Tile Inventory Report"],
    ids,
    ["Developed by Coders Cottage"],
    []
  ], {origin : "B2"})

  XLSX.utils.sheet_add_json(sheet, items,{origin: "B6"})
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, "Merged sheet")
  const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })

  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "Download.xlsx"
  a.click()
}
