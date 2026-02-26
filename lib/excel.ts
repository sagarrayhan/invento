import { MIME_TYPES } from "@/app/data/local";
import { ExcelData, SubmittedItems, Tile } from "@/app/data/types";
import { exp } from "firebase/firestore/pipelines";
import * as XLSX from 'xlsx'



export function tilesToExcel(submits: SubmittedItems) {


    const plainData: ExcelData[] = []



    submits.items.forEach(item => {

        item.items.forEach(g => {
            plainData.push({
                CODE: item.code,
                TOTAL: item.quantity,
                GRID: g.grid,
                HISTORY: g.history,
                QUANTITY: g.quantity

            })
        })
    })

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
    interface Tile {
        Code: string,
        Quantity: number
    }
    const plainData: Tile[] = []

    if(!tiles){
        return
    }



    tiles.forEach(item => {

        item.items.forEach(g => {
            plainData.push({
                Code: item.code,
                Quantity: item.quantity
            })
        })
    })

    ExcelDownload(plainData)


}

export function ExcelDownload(data: any) {
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