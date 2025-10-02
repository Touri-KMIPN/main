"use client";
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import React from 'react'

export default function Page() {
    const { user } = useKindeAuth()

    return (
        <div>
            Halo {user?.given_name}
        </div>
    )
}
