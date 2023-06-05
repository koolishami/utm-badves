import React, { useEffect, useState } from 'react'
import { auth } from "../utils/firebase"
import { onAuthStateChanged } from 'firebase/auth';

export const AuthDetails = () => {
    const [authUser, setAuthUser] = useState<any>(null);

    useEffect(() => {
        const listener = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user)
            } else {
                setAuthUser(null);
            }
        })
    }, [])
    return (
        <div>AuthDetails</div>
    )
}