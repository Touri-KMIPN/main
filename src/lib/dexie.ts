import Dexie, {type EntityTable} from 'dexie';
import {Spot} from "@/types/spot";

interface PersistedSpot extends Spot {
    sessionId: string
}

const $dexie = new Dexie("TouriSpotDB") as Dexie & {
    spots: EntityTable<PersistedSpot, 'id'>
}

$dexie.version(1).stores({
    spots: '++id'
})

export type {PersistedSpot}
export {$dexie}