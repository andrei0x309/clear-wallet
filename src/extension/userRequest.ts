export const userReject = {} as Record<string, (() => any) | undefined> 
export const userApprove = {} as  Record<string,  ((a: unknown) => any) | undefined> 
export const rIdWin = {} as Record<string, string | undefined>
export const rIdData = {} as Record<string, any | undefined>

export const approve = (rId: string) => {
        chrome.runtime.sendMessage({ method: 'wallet_approve', resId: rId })
}

export const walletSendData = (rId: string, data: any) => {
        return new Promise((resolve) => {
        chrome.runtime.sendMessage({ method: 'wallet_send_data', resId: rId, data}, (r) => {
                resolve(r)
        })
        })
}

export const walletGetData = (rId: string) => {
        return new Promise((resolve) => {
        chrome.runtime.sendMessage({ method: 'wallet_get_data', resId: rId }, (r) => {
                resolve(r)
        })
        })
}

export const walletPing = () => {
        return new Promise((resolve) => {
                chrome.runtime.sendMessage({ method: 'wallet_ping' }, (r) => {
                        resolve(r)
                })
                })
}