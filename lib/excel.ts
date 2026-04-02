import { getAllSubmittedData } from "@/app/data/tiles";
import { ExcelData, ExcelDataInd, Item, SubmittedItems, Tile, Total } from "@/app/data/types";
import { getDbUser } from "@/app/data/user";
import { formatDateDDMMYYYY } from "@/lib/date";
import * as XLSX from 'xlsx'


const toNumber = (value: number | string | undefined | null) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function triggerExcelDownload(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

async function getFlattenedSubmittedTiles(ids: string[]) {
  const data = await getAllSubmittedData(ids)
  return data.flat()
}

export async function tilesToExcel(submits: SubmittedItems) {


  const plainData: ExcelDataInd[] = []

  const creator = submits.items[0]?.items[0]?.createdBy || "Unknown"

  const user = await getDbUser(creator)

  let index = 0


  submits.items.forEach((item) => {
    const nestedItems = item.items || []
    nestedItems.forEach(g => {
      index += 1
      plainData.push({
        INDEX: index,
        CODE: item.code,
        SIZE: item.size,
        GRID: g.grid,
        HISTORY: g.history,
        TOTAL: g.quantity
      })
    })
  })

  if (plainData.length === 0) {
    return
  }
  const tilesSheet = XLSX.utils.aoa_to_sheet([])

  const formattedDate = formatDateDDMMYYYY(new Date())
  XLSX.utils.sheet_add_aoa(tilesSheet, [
    ["Tile Inventory Report"],
    [`Created By: ${user?.name} (${user?.id})`],
    [`Date: ${formattedDate}`],
    []
  ], { origin: "B2" })

  const book = XLSX.utils.book_new()
  XLSX.utils.sheet_add_json(tilesSheet, plainData, { origin: "B7" })
  XLSX.utils.book_append_sheet(book, tilesSheet, "Tiles List")
  const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })
  triggerExcelDownload(buffer, `${user?.name} (${user?.id}).xlsx`)
}

export async function mergeAll(ids: string[]): Promise<Tile[]> {
  const tiles = await getFlattenedSubmittedTiles(ids)
  const tileMap = new Map<string, Tile>()
  const gridMapByCode = new Map<string, Map<string, Item>>()

  for (const tile of tiles) {
    const existingTile = tileMap.get(tile.code)
    if (!existingTile) {
      const clonedItems = tile.items.map((item) => ({
        ...item,
        quantity: String(toNumber(item.quantity)),
      }))
      const nextTile: Tile = {
        ...tile,
        items: clonedItems,
        quantity: clonedItems.reduce((sum, item) => sum + toNumber(item.quantity), 0),
      }
      tileMap.set(tile.code, nextTile)
      gridMapByCode.set(
        tile.code,
        new Map(clonedItems.map((item) => [item.grid, item])),
      )
      continue
    }

    const gridMap = gridMapByCode.get(tile.code) || new Map<string, Item>()
    for (const incoming of tile.items) {
      const existingGrid = gridMap.get(incoming.grid)
      if (!existingGrid) {
        const nextItem: Item = {
          ...incoming,
          quantity: String(toNumber(incoming.quantity)),
        }
        existingTile.items.push(nextItem)
        gridMap.set(incoming.grid, nextItem)
        continue
      }

      existingGrid.quantity = String(toNumber(existingGrid.quantity) + toNumber(incoming.quantity))
      const normalizedHistory = (incoming.history || "").replace(/^=/, "")
      existingGrid.history = normalizedHistory
        ? `${existingGrid.history || ""}+${normalizedHistory}`
        : existingGrid.history
    }

    existingTile.quantity = existingTile.items.reduce(
      (sum, item) => sum + toNumber(item.quantity),
      0,
    )
    gridMapByCode.set(tile.code, gridMap)
  }

  return Array.from(tileMap.values())
}

export async function downloadTotal(ids: string[]) {

  const tiles = await getFlattenedSubmittedTiles(ids)
  let index = 0
  const map = new Map<string, number>()

  for (const tile of tiles) {
    const tileTotal = tile.items.reduce((sum, item) => sum + toNumber(item.quantity), 0)
    map.set(tile.code, (map.get(tile.code) || 0) + tileTotal)
  }

  const flatData: Total[] = []

  map.forEach((totalQuantity, code) => {
    index += 1
    flatData.push({
      INDEX: index,
      CODE: code,
      QUANTITY: totalQuantity
    })
  })

  exportToExcel(flatData, ids)
}

export async function donwloadDetailed(ids: string[]) {
  const mergedTile = await mergeAll(ids)
  let rowIndex = 0
  const flatData: ExcelData[] = [];

  mergedTile.forEach((tile: Tile) => {
    tile.items.forEach((i: Item) => {
      rowIndex += 1
      flatData.push({
        INDEX: rowIndex,
        CODE: tile.code,
        SIZE: tile.size,
        GRID: i.grid,
        HISTORY: i.history,
        TOTAL: i.quantity,
        SUBMITTED: i.createdBy
      })

    })
  })

  exportToExcel(flatData, ids)

}

export function exportToExcel(items: Array<ExcelData | Total>, ids: string[]) {

  const sheet = XLSX.utils.aoa_to_sheet([])
  const formattedDate = formatDateDDMMYYYY(new Date())
  XLSX.utils.sheet_add_aoa(sheet, [
    ["Tile Inventory Report"],
    [`Created By: ${ids}`],
    ["Developed by Coders Cottage"],
    [`Date: ${formattedDate}`],
    []
  ], { origin: "B2" })

  XLSX.utils.sheet_add_json(sheet, items, { origin: "B6" })
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, "Merged sheet")
  const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })
  triggerExcelDownload(buffer, "Download.xlsx")
}
