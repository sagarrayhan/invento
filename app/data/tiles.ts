import { db } from "@/firebase/config";
import { get, onValue, ref, remove } from "firebase/database";
import { Item, SubmittedItems, Tile } from "./types";
import { log } from "console";

export function getLiveData(id: string, onData: (tiles: Tile[]) => void) {
    const liveRef = ref(db, `/inventory/liveUpdates/${id}`)

    const unsubscribe = onValue(liveRef, snap => {
        if (!snap.exists()) {
            onData([])
            return
        }
        const tiles = snap.val() as Tile[]
        onData(tiles)
    })

    return unsubscribe
}

export function getSubmittedData(id: string, callback: (i: SubmittedItems[]) => void) {
    const submitRef = ref(db, `/inventory/submits/${id}`)

    const unsubs = onValue(submitRef, (snap) => {
        if (!snap.exists()) {
            callback([])
            return
        }

        const data = snap.val()
        if (!data || typeof data !== "object") {
            callback([])
            return
        }

        if (Object.keys(data).length === 0) {
            callback([])
            return
        }

        const submittedItems: SubmittedItems[] = Object.entries(data).map(
            ([key, tiles]) => ({
                key,
                items: tiles as Tile[]
            })
        )

        callback(submittedItems)
    })

    return unsubs
}

export function removeFromSubmit(uid: string, id: string) {
    const submitRef = ref(db, `/inventory/submits/${uid}/${id}`)
    const userSubmitRef = ref(db, `/inventory/submits/${uid}`)
    const submittedByRef = ref(db, `/inventory/submits/submittedBy/${uid}`)

    return remove(submitRef).then(async () => {
        const remaining = await get(userSubmitRef)

        if (!remaining.exists()) {
            await remove(submittedByRef)
            return
        }

        const data = remaining.val()
        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
            await remove(submittedByRef)
        }
    })
}

const toNumber = (value: number | string | undefined | null) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

function normalizeItems(items: Item[] | undefined): Item[] {
    return (items || []).map((item) => ({
        ...item,
        quantity: String(toNumber(item.quantity)),
    }))
}

function mergeItems(baseItems: Item[], incomingItems: Item[]): Item[] {
    const itemMap = new Map<string, Item>()

    baseItems.forEach((item) => {
        const key = `${item.grid}__${item.history}`
        itemMap.set(key, { ...item, quantity: String(toNumber(item.quantity)) })
    })

    incomingItems.forEach((item) => {
        const key = `${item.grid}__${item.history}`
        const existing = itemMap.get(key)

        if (!existing) {
            itemMap.set(key, { ...item, quantity: String(toNumber(item.quantity)) })
            return
        }

        itemMap.set(key, {
            ...existing,
            quantity: String(toNumber(existing.quantity) + toNumber(item.quantity)),
        })
    })

    return Array.from(itemMap.values())
}

export async function getAllSubmittedData(users: string[]):Promise<Tile[][]> {

    const allTiles : Tile[][] = []
    
    await Promise.all(users.map(user=>{
        const submitRef = ref(db, `/inventory/submits/${user}`)

        return get(submitRef).then(snap=>{
            if(!snap.exists()){
                return []
            }

            Object.entries(snap.val()).forEach(([k,v])=>{
                const tiles = v as Tile[]    
                allTiles.push(tiles)
            })
        })
    }))

    return allTiles
    
}
