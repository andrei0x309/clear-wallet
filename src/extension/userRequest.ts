export const userReject = {} as Record<string, (() => any) | undefined>
export const userApprove = {} as Record<string, ((a: unknown) => any) | undefined>
export const rIdWin = {} as Record<string, string | undefined>
export const rIdData = {} as Record<string, any | undefined>

export const approve = (rId: string) => {
        chrome.runtime.sendMessage({ method: 'wallet_approve', resId: rId, type: 'CLWALLET_CONTENT_MSG' }, (r) => {
                if (chrome.runtime.lastError) {
                        console.warn("LOC4: Error sending message:", chrome.runtime.lastError);
                }
                return r
        })
}

export const walletSendData = (rId: string, data: any) => {
        return new Promise((resolve) => {
                chrome.runtime.sendMessage({ method: 'wallet_send_data', resId: rId, data, type: 'CLWALLET_CONTENT_MSG' }, (r) => {
                        if (chrome.runtime.lastError) {
                                console.warn("LOC5: Error sending message:", chrome.runtime.lastError);
                        }
                        resolve(r)
                })
        })
}

export const walletGetData = (rId: string) => {
        return new Promise((resolve) => {
                chrome.runtime.sendMessage({ method: 'wallet_get_data', resId: rId, type: 'CLWALLET_CONTENT_MSG' }, (r) => {
                        if (chrome.runtime.lastError) {
                                console.warn("LOC6: Error sending message:", chrome.runtime.lastError);
                        }
                        resolve(r)
                })
        })
}

export const walletPromptSendTx = (tx: any) => {
        const rId = [...`${Math.random().toString(16) + Date.now().toString(16)}`].slice(2).join('')
        return new Promise((resolve) => {
                chrome.runtime.sendMessage({ method: 'eth_sendTransaction', resId: rId, 
                params: [
                        tx
                ]
                , type: 'CLWALLET_CONTENT_MSG' }, (r) => {
                        if (chrome.runtime.lastError) {
                                console.warn("LOC7: Error sending message:", chrome.runtime.lastError);
                        }
                        resolve(r)
                })
        })
}

export const walletPing = () => {
        return new Promise((resolve) => {
                chrome.runtime.sendMessage({ method: 'wallet_ping', type: 'CLWALLET_CONTENT_MSG' }, (r) => {
                        if (chrome.runtime.lastError) {
                                console.warn("LOC8: Error sending message:", chrome.runtime.lastError);
                        }
                        resolve(r)
                })
        })
}
