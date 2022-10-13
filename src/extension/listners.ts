import type { listnerType } from '@/extension/types'

export const triggerListner = ( type: listnerType, listnerData: any ) => {
    const data = { type: "CLWALLET_EXT_LISTNER", data: { listner: type, data: listnerData } }
    window.postMessage(data, "*")
    console.log('trigger', data)
}
