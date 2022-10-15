import type { listnerType } from '@/extension/types'

export const triggerListner = ( type: listnerType, listnerData: any ) => {
    const data = { type: "CLWALLET_EXT_LISTNER", data: { listner: type, data: listnerData } }
    chrome.tabs.query({}, (tabs) => tabs.forEach( tab => 
        {
            if (tab?.id) {
                chrome.tabs.sendMessage(tab.id, data) 
            }
        }
    ));
}
