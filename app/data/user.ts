import { get, onValue, ref, remove, set, update } from "firebase/database";
import { User } from "./types";
import { db } from "@/firebase/config";

export async function setDbUser(user: User) {
  const userRef = ref(db, `/inventory/users/${user.id}`)
  await set(userRef, user)
}

export function getDbUser(id: string): Promise<User | null> {
    const userRef = ref(db, `/inventory/users/${id}`)
    return get(userRef).then(snap => {
        if (!snap.exists()) {
            return null
        }
        return snap.val() as User
    })
}


export function getLiveUsers(callback: (users: User[]) => void) {
    const userRef = ref(db, "inventory/liveUpdates")

    const unsubscribe = onValue(userRef, async (snap) => {

        // Step 1: If no data → return empty array
        if (!snap.exists()) {
            callback([])
            return
        }

        // Step 2: Get actual data object
        const data = snap.val()
        if (!data || typeof data !== "object") {
            callback([])
            return
        }

        // Step 3: Extract user IDs
        const keys = Object.keys(data)
        
        // Step 4: Fetch all users in parallel
        const users = await Promise.all(
            keys.map((key) => getDbUser(key))
        )

        const validUsers = users.filter(
            (user): user is User => user !== null
        )

        // Step 5: Send users back
        callback(validUsers)
    })

    return unsubscribe
}


export function getSubmittedUsers(callback : (users : string[])=>void){
    const submitsRef = ref(db, '/inventory/submits')

    const unSubs = onValue(submitsRef, (snap) => {
        if (!snap.exists()) {
            callback([])
            return
        }

        const data = snap.val()
        if (!data || typeof data !== "object") {
            callback([])
            return
        }

        const submittedUsers = Object.entries(data).filter(([uid, submitData]) => {
            if (uid === 'submittedBy') {
                return false
            }

            if (!submitData || typeof submitData !== "object") {
                return false
            }

            return Object.values(submitData as Record<string, unknown>).some((value) => {
                if (Array.isArray(value)) {
                    return value.length > 0
                }
                if (value && typeof value === "object") {
                    return Object.keys(value as Record<string, unknown>).length > 0
                }
                return value !== null && value !== undefined
            })
        }).map(([uid]) => uid)

        callback(submittedUsers)
    })

    return unSubs

}

export function getAllUsers(callback : (users:User[])=>void){
    const usersRef = ref(db, '/inventory/users')

    const unsubs= onValue(usersRef, snap=>{
        if(!snap.exists()){
            return
        }

        const users = Object.values(snap.val())
        callback(users as User[])

    })

    return unsubs
}


export async function setImageUrl(imageUrl:string, uid: string){
    const urlRef = ref(db, `/inventory/users/${uid}`)

    update(urlRef, {
        imageUrl : imageUrl
    })
}

export async function deleteDbUser(uid: string) {
    const userRef = ref(db, `/inventory/users/${uid}`)
    await remove(userRef)
}


