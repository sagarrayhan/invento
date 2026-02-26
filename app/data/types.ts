
export interface User{
    id: string,
    name : string,
    password : string,
    designation : string,
    imageUrl : string,
    joinedAt : string
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
    quantity : string
}

export interface SubmittedItems{
    key: string,
    items : Tile[]
}


export interface ExcelData{
    CODE : string, 
    TOTAL : number,
    GRID : string,
    HISTORY : string,
    QUANTITY : string
}
