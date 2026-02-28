import { ST } from "next/dist/shared/lib/utils"

export interface User{
    id: string,
    name : string,
    password : string,
    designation : string,
    imageUrl : string,
    joinedAt : string
}

export interface AuthUser {
    id: string,
    name: string,
    designation: string,
    imageUrl: string,
    joinedAt: string
}

export interface Tile {
    id: string
    code: string
    createdAt: string
    createdBy: string
    items: Item[]
    quantity: number
}

export interface Item{
    grid : string,
    history: string,
    quantity : string,
    createdBy : string
}

export interface SubmittedItems{
    key: string,
    items : Tile[]
}


export interface ExcelData{
    CODE : string, 
    GRID : string,
    HISTORY : string,
    SUBMITTED: string
}

export interface Total{
    CODE : String,
    QUANTITY : number,
}
