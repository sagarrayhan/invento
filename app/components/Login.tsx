
import React, { useState } from 'react'
import { useLogin } from '../hooks/login'
import { Logo } from './Logo'

export default function Login() {
    const {state, setState, submit} = useLogin()
    return (
        <div className=' max-w-80 flex items-center justify-center min-w-screen min-h-screen'>
            <div className=' card flex flex-col gap-1'>
                <div className='flex gap-2 items-center justify-center mb-5'>
                    <Logo className=' size-12' />
                    <div className='heading-lg'>INVENTO</div>
                </div>
                <input value={state.id} onChange={(e) => { setState(prev => ({ ...prev, id: e.target.value })) }} className='input' placeholder='Id' />
                <input value={state.pass} onChange={(e) => { setState(prev => ({ ...prev, pass: e.target.value })) }} className='input' placeholder='Password' />
                <button onClick={() => { submit() }} className='btn btn-primary mt-4 w-full'>Submit</button>
                <h1 className=' font-bold text-red-50'>{state.massege}</h1>
            </div>

        </div>)
}
