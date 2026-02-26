import { useState } from "react";
import { getDbUser } from "../data/user";

export function useLogin() {
    const [state, setState] = useState(
        {
            id: "",
            pass: "",
            loading: false,
            loggedIn: false,
            massege : "",
            user : undefined
        }

    )

    async function submit(){
        if(state.id.trim() == "" || state.pass.trim() == ""){
            setState(prev=>({...prev, massege : "Id or Password Missing"}))
            return
        }

        const user = await getDbUser(state.id)

        if(!user){
            setState(prev=>({...prev, massege : "User Not found"}))
            return
        }

        if(user?.password == state.pass){
            setState(prev=>({...prev, loggedIn : true, massege : "Logged In"}))
            return
        }else {
            setState(prev=>({...prev, error : "Wrong Password"}))
            return
        }
    }

    return {state, setState, submit}
}