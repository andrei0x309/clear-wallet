import type { listenerType } from '@/extension/types'

export const triggerListener = ( type: listenerType, listenerData: any ) => {
    const data = { type: "CLWALLET_EXT_LISTENER", data: { listener: type, data: listenerData } }
    chrome.tabs.query({}, (tabs) => tabs.forEach( async tab => 
        {   
            if (tab?.id) {
                try {
                    await chrome.tabs.sendMessage(tab.id, data)
                } catch
                {
                    // ignore
                }
            }
        }
    ));
}
