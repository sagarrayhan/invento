import { db } from "@/firebase/config";
import { get, onValue, ref, remove } from "firebase/database";
import { SubmittedItems, Tile } from "./types";
import { Key } from "lucide-react";
import { log } from "console";



export function getLiveData(id: string, onData: (tiles: Tile[]) => void) {
    const liveRef = ref(db, `/inventory/liveUpdates/${id}`)

    const unsubscribe = onValue(liveRef, snap => {
        if (!snap.exists()) {
            onData([])
        }
        const tiles = snap.val() as Tile[]
        onData(tiles)
    })

    return unsubscribe
}


export function getSubmittedData(id: string, callback: (i: SubmittedItems[]) => void) {
    const submitRef = ref(db, `/inventory/submits/${id}`)
    const unsubs = onValue(submitRef, (snap) => {

        const data = snap.val()

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


export async function getAllSubmittedData(users: string[]) {

    // 🔥 Map to store merged tiles
    const tileMap = new Map<string, Tile>()

    // Create all promises first
    const promises = users.map(user => {

        const submitRef = ref(db, `/inventory/submits/${user}`)

        return get(submitRef).then(snap => {

            if (!snap.exists()) {
                console.log("No data for user:", user)
                return
            }

            const items = snap.val()
            const values = Object.values(items)

            values.forEach(i => {

                (i as Tile[]).forEach(tile => {

                    if (tileMap.has(tile.code)) {
                        const existing = tileMap.get(tile.code)!

                        tileMap.set(tile.code, {
                            ...existing,
                            quantity: existing.quantity + tile.quantity
                        })

                    } else {
                        tileMap.set(tile.code, { ...tile })
                    }

                })

            })

        })

    })

    // ✅ Wait for all users to finish
    await Promise.all(promises)

    // Convert Map → Array
    const finalMergedTiles = Array.from(tileMap.values())

    console.log("Final Combined Data:", finalMergedTiles)

    return finalMergedTiles
}





