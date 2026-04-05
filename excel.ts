import { getAllSubmittedData } from "@/app/data/tiles";
import { ExcelData, Item, SubmittedItems, Tile, Total } from "@/app/data/types";
import * as XLSX from 'xlsx'
import { getDbUser } from "./app/data/user";
import { log } from "console";

interface ExcelDataWithSubmitted extends ExcelData {
  SUBMITTED: string
}


export async function indivisualExcel(submits: SubmittedItems) {


  const plainData: ExcelDataWithSubmitted[] = []

  const creator = submits.items[0]?.items[0]?.createdBy || "Unknown"

  const user = await getDbUser(creator)

  console.log(user);
  

  let index = 0


  submits.items.forEach((item) => {
    const nestedItems = item.items || []
    nestedItems.forEach(g => {
      index += 1
      plainData.push({
        INDEX : index,
        CODE: item.code,
        SIZE : item.size,
        GRID: g.grid,
        HISTORY: g.history,
        TOTAL : Number(g.quantity || 0),
        SUBMITTED : ""
      })
    })
  })

  if (plainData.length === 0) {
    return
  }
  const tilesSheets = XLSX.utils.aoa_to_sheet([])

  // Format date as dd-mm-yyyy
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  XLSX.utils.sheet_add_aoa(tilesSheets, [
    ["Tile Inventory Report"],
    [`Created By: ${creator}`],
    [`Date: ${formattedDate}`],
    []
  ], { origin: "B2" })

  XLSX.utils.sheet_add_json(tilesSheets, plainData, { origin: "B6" })
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, tilesSheets, "Tiles List")
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
  let index = 0
  const map = new Map<string, number>()

  tiles.forEach(tile => {

    tile.items?.forEach(item => {
      const existing = map.get(tile.code) || 0
      map.set(tile.code, existing + Number(item.quantity || 0))
    })

  })

  const flatData: Total[] = []

  map.forEach((totalQuantity, code) => {
    index+=1
    flatData.push({
      INDEX : index,
      CODE: code,
      QUANTITY: totalQuantity
    })
  })

  exportToExcel(flatData, ids)
}

export async function donwloadDetailed(ids: string[]) {
  const mergedTile = mergeAll(ids)
  let rowIndex = 0
  const flatData: ExcelDataWithSubmitted[] = [];

  (await mergedTile).forEach((tile: Tile) => {
    tile.items.forEach((i: Item) => {
      rowIndex += 1
      flatData.push({
        INDEX : rowIndex,
        CODE: tile.code,
        SIZE : tile.size,
        GRID: i.grid,
        HISTORY: i.history,
        TOTAL : Number(i.quantity || 0),
        SUBMITTED: i.createdBy
      })

    })
  })

  exportToExcel(flatData, ids)

}

export function exportToExcel(items: Array<ExcelDataWithSubmitted | Total>, ids: string[]) {

  const sheet = XLSX.utils.aoa_to_sheet([])
  // Format date as dd-mm-yyyy
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  XLSX.utils.sheet_add_aoa(sheet, [
    ["Tile Inventory Report"],
    [`Created By: ${ids}`],
    ["Developed by Coders Cottage"],
    [`Date: ${formattedDate}`],
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
