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
    code: string,
    size:string,
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
    INDEX : number,
    CODE : string, 
    SIZE: string,
    GRID : string,
    HISTORY : string,
    TOTAL : string,
    SUBMITTED: string
}

export interface Total{
    INDEX : number,
    CODE : string,
    QUANTITY : number,
}

export interface InventoryCode {
    code: string
    size: string
}
