"use client"
import { Spot } from '@/types/spot'
import React from 'react'

type SpotsProviderContext = {
    spots: Spot[],
    getSpotById: (id: string) => Spot | undefined
    setSpots: (spots: Spot[]) => void
    addSpot: (spot: Spot) => void
    removeSpot: (id: string) => void
}

const SpotsContext = React.createContext<SpotsProviderContext | undefined>(undefined)

 function SpotsProvider({children}: {children: React.ReactNode}) {
    const [spots, setSpots] = React.useState<Spot[]>([])

    const getSpotById = (id: string) => {
        return spots.find(spot => spot.displayName.text === id)
    }

    const addSpot = (spot: Spot) => {
        setSpots(prev => [...prev, spot])
    }

    const removeSpot = (id: string) => {
        setSpots(prev => prev.filter(spot => spot.displayName.text !== id))
    }

    return (
        <SpotsContext.Provider value={{
            spots,
            getSpotById,
            setSpots,
            addSpot,
            removeSpot
        }}>
            {children}
        </SpotsContext.Provider>
    )
}


const useSpots = () => {
    const context = React.useContext(SpotsContext)

    if (!context) {
        throw new Error("useSpots must be used within a SpotsProvider")
    }

    return context
}

export {SpotsContext, SpotsProvider, useSpots}
export type { SpotsProviderContext }