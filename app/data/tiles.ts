import { db } from "@/firebase/config";
import { get, onValue, ref, remove } from "firebase/database";
import { Item, SubmittedItems, Tile } from "./types";

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
    const submittedByRef = ref(db, `/inventory/submits/submittedBy/${id}`)

    const unsubs = onValue(submitRef, async (snap) => {
        if (!snap.exists()) {
            callback([])
            await remove(submittedByRef)
            return
        }

        const data = snap.val()
        if (!data || typeof data !== "object") {
            callback([])
            await remove(submittedByRef)
            return
        }

        if (Object.keys(data).length === 0) {
            callback([])
            await remove(submittedByRef)
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
    return remove(submitRef)
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

export async function getAllSubmittedData(users: string[]) {
    const tileMap = new Map<string, Tile>()

    const promises = users.map(user => {
        const submitRef = ref(db, `/inventory/submits/${user}`)

        return get(submitRef).then(snap => {
            if (!snap.exists()) {
                return
            }

            const data = snap.val()
            if (!data || typeof data !== "object") {
                return
            }

            const lists = Object.values(data)

            lists.forEach((list) => {
                (list as Tile[]).forEach((tile) => {
                    const normalizedTile: Tile = {
                        ...tile,
                        quantity: toNumber(tile.quantity),
                        items: normalizeItems(tile.items),
                    }

                    const existing = tileMap.get(normalizedTile.code)
                    if (!existing) {
                        tileMap.set(normalizedTile.code, normalizedTile)
                        return
                    }

                    tileMap.set(normalizedTile.code, {
                        ...existing,
                        quantity: toNumber(existing.quantity) + toNumber(normalizedTile.quantity),
                        items: mergeItems(existing.items || [], normalizedTile.items || []),
                    })
                })
            })
        })
    })

    await Promise.all(promises)
    return Array.from(tileMap.values())
}
