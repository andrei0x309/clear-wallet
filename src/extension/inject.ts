interface RequestArguments {
    id?: string | undefined
    method: string;
    params?: unknown[] | object;
}

interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  }

const ProviderInfo: EIP6963ProviderInfo = {
    uuid: '1fa914a1-f8c9-4c74-8d84-4aa93dc90eec',
    name: 'Clear Wallet',
    icon: 'data:image/png;base64,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',
    rdns: 'clear-wallet.flashsoft.eu/',
}

function loadEIP1193Provider(provider: any) {

    function announceProvider() {
      const info: EIP6963ProviderInfo = ProviderInfo
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: Object.freeze({ info, provider }),
        })
      );
    }
  
    window.addEventListener(
      "eip6963:requestProvider",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (event: any) => {
        announceProvider();
      }
    );
  
    announceProvider();
  }

const listners = {
    accountsChanged: new Set<(p?: any) => void>(),
    connect: new Set<(p?: any) => void>(),
    disconnect: new Set<(p?: any) => void>(),
    chainChanged: new Set<(p?: any) => void>(),
    once: {
        accountsChanged: new Set<(p?: any) => void>(),
        connect: new Set<(p?: any) => void>(),
        disconnect: new Set<(p?: any) => void>(),
        chainChanged: new Set<(p?: any) => void>(),
    }
}

const promResolvers = new Map()

const getListnersCount = (): number => {
    let count = 0
    for(const key of Object.keys(listners)) {
        if(key === 'once'){
            for(const onceKey of Object.keys(listners[key])) {
                count += (<any>listners)[key][onceKey]?.length
            }
        }else {
            count += (<any>listners)[key].length
        }
    }
    return count
}

const sendMessage = (args: RequestArguments, ping = false, from = 'request'): Promise<unknown> => {
if(Object.values(promResolvers).filter(r=> r).length < 10 ) {
    return new Promise((resolve, reject) => {
        const resId = [...`${Math.random().toString(16) + Date.now().toString(16)}`].slice(2).join('')
        promResolvers.set(resId, { resolve, reject })
        const data = { 
            type: "CLWALLET_CONTENT", 
            data: { data: args, name: 'metamask-provider' },
            resId,
            from,
            target: 'metamask-contentscript'
        }
        if (ping) {
            data.type = 'CLWALLET_PING'
        }
        // console.info('data in', data)
        window.postMessage(data, "*");
 
    }) 
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error("You have reached the maximum number of concurent wallet messeges."))
        })
    }
}

class MetaMaskAPI {
    isMetaMask = true
    _state = {accounts: Array(1), isConnected: true, isUnlocked: true, initialized: true, isPermanentlyDisconnected: false}
    _sentWarnings = {enable: false, experimentalMethods: false, send: false, events: {}}
    // Deprecated - hardcoded for now, websites should not access this directly since is deprecated for a long time
    chainId = "0x89"
    // Deprecated - hardcoded for now, websites should not access this directly since is deprecated for a long time
    networkVersion = "137"
    selectedAddress = null
    autoRefreshOnNetworkChange = false
    // Internal Simulate Metamask 
    _events = {}
    _eventsCount = 2
    _jsonRpcConnection = {}
    _log = {}
    _maxListeners=  100
    _metamask = new Proxy({
        isUnlocked: () => { 
            return Promise.resolve(true)
        },
        requestBatch: () => {
            // empty
        },
    }, {})
    _rpcEngine = {
        _events: {}, _eventsCount: 0, _maxListeners: undefined, _middleware: Array(4)
    }
    isConnected() {
        return true
    }
    // for maximum compatibility since is cloning the same API
    
    enable() {
        return sendMessage({ method: 'eth_requestAccounts', params: Array(0)})
    }

    request(args: RequestArguments): Promise<unknown> {
        return sendMessage(args) as Promise<unknown>
    }
    // Deprecated
    sendAsync (arg1: any, arg2: any): void | Promise<unknown>  {
        // return this.send(arg1, arg2) as any
        if( typeof arg1 === 'string' ) {
            return sendMessage({
                method: arg1,
                params: arg2 as object
            }, false , 'sendAsync') as Promise<unknown>
        }else if (typeof arg2 === 'function'){
                ((sendMessage(arg1 as RequestArguments, false, 'sendAsync') as Promise<unknown>).then(result => {
                    (arg2 as (e?: any, r?: any) => any )(undefined, {
                            id: (arg1 as RequestArguments)?.id,
                            jsonrpc: '2.0',
                            method: (arg1 as RequestArguments).method,
                            result
                          }
                    ) 
                }) as Promise<unknown>).catch( e => {
                    (arg2 as (er?: any, r?: any) => any )(new Error(e), {
                        id: (arg1 as RequestArguments)?.id,
                        jsonrpc: '2.0',
                        method: (arg1 as RequestArguments).method,
                        error: new Error(e)
                      }
                )
                })
            } else {
                return sendMessage(arg1 as RequestArguments, false, 'sendAsync') as Promise<unknown>
            }
    }
    // Deprecated
    // send (arg1: unknown, arg2: unknown): unknown {
    //     if (arg2 === undefined) {
    //         if( typeof arg1 === 'string' ) {
    //             return sendMessage({
    //                 method: arg1,
    //                 params: undefined
    //             })
    //         } else if (typeof arg1 === 'object') {
    //             return sendMessage(arg1 as RequestArguments)
    //         } else {
    //             console.error('ERROR: Clear Wallet: faulty request')
    //         }
    //     }else if( typeof arg1 === 'string' ) {
    //         return sendMessage({
    //             method: arg1,
    //             params: arg2 as object
    //         })
    //     }else if (typeof arg2 === 'function'){
    //             sendMessage(arg1 as RequestArguments).then(result => {
    //                 (arg2 as (e?: any, r?: any) => any )(undefined, {
    //                         id: (arg1 as RequestArguments)?.id,
    //                         jsonrpc: '2.0',
    //                         method: (arg1 as RequestArguments).method,
    //                         result
    //                       }
    //                 )
    //             }).catch( e => {
    //                 (arg2 as (er?: any, r?: any) => any )(new Error(e), {
    //                     id: (arg1 as RequestArguments)?.id,
    //                     jsonrpc: '2.0',
    //                     method: (arg1 as RequestArguments).method,
    //                     error: new Error(e)
    //                   }
    //             )
    //             })
    //         } 
    // }

    send (arg1: unknown, arg2: unknown): unknown {
        const resultFmt = async (result: Promise<any>) => {
            return {
                "id": 0,
                "jsonrpc": "2.0",
                result: await result
            }
        }
        if (arg2 === undefined) {
            if( typeof arg1 === 'string' ) {
 
                return resultFmt(sendMessage({
                    method: arg1,
                    params: undefined
                }, false, 'send')) 
            } else {
                return resultFmt(sendMessage(arg1 as RequestArguments, false, 'send'))
            }
      } else if (typeof arg1 === 'object') {
                if( typeof arg1 === 'string' ) {
                return resultFmt(sendMessage(arg1 as RequestArguments, false, 'send'))
            } else {
                return resultFmt(sendMessage(arg1 as RequestArguments, false, 'send'))
            }
        }else if( typeof arg1 === 'string' ) {
            return resultFmt( sendMessage({
                method: arg1,
                params: arg2 as object
            }, false, 'send'))
        }else if (typeof arg2 === 'function'){
            return resultFmt( sendMessage(arg1 as RequestArguments, false, 'send'))
        } else {
            return resultFmt(sendMessage(arg1 as RequestArguments , false, 'send'))
        } 
    }
    on (eventName: string, callback: () => void) {
        this.addListener(eventName, callback)
        return this
    }

    addListener (eventName: string, callback: () => void) {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged.add(callback)
                break
            case 'connect':
                listners.connect.add(callback)
                sendMessage({
                    method: 'wallet_ready'
                }, true)
                break;
            case 'disconnect':
            case 'close':
                listners.disconnect.add(callback)
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.chainChanged.add(callback)
                break;
        }
        return this
    }

    once (eventName: string, callback: () => void) {
        switch (eventName) {
            case 'accountsChanged':
                listners.once.accountsChanged.add(callback)
                break
            case 'connect':
                listners.once.connect.add(callback)
                sendMessage({
                    method: 'wallet_ready'
                }, true)
                break;
            case 'disconnect':
            case 'close':
                listners.once.disconnect.add(callback)
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.once.chainChanged.add(callback)
                break;
        }
        return this
    }
    off (eventName: string, callback: () => void) {
        (this).removeListener(eventName, callback)
        return this
    }
    removeListener (eventName: string, callback: () => void) {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged.delete(callback)
                break
            case 'connect':
                listners.connect.delete(callback)
                break;
            case 'disconnect':
            case 'close':
                listners.disconnect.delete(callback)
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.chainChanged.delete(callback)
                break;
            default:
                return
        }
        return this
    }
    
    removeAllListeners()  {
        listners.accountsChanged.clear()
        listners.chainChanged.clear()
        listners.disconnect.clear()
        listners.connect.clear()
        return this
    }

    getMaxListeners()  {
        return 100
    }
    _getExperimentalApi ()  {
        return this._metamask
    }
    eventNames () {
        return []
    }
    listenerCount () {
        return getListnersCount()
    }
    listners() { return [] }
    rawListners() { return [] }
    // Internal Simulate Metamask 
    _warnOfDeprecation() { return true }

    _rpcRequest() { return true }
    _handleAccountsChanged() { return true }

    _handleChainChanged() { return true }
    _handleConnect() { return true }
    _handleDisconnect() { return true }
    _handleStreamDisconnect() { return true }
    _handleUnlockStateChanged() { return true }
    _sendSync () {
        console.warn('ERROR: Clear Wallet: Sync calling is deprecated and not supported')
    }
}

const eth = new Proxy( new MetaMaskAPI(), {
    deleteProperty: () => { return true },
})

const listner =  function(event: any) {
    if (event.source != window) return;
    const eventData = event?.data
    const eventDataData = event?.data?.data
    const eventDataDataData = event?.data?.data?.data
    if (eventData?.type === "CLWALLET_PAGE") {
    try {
        if(eventData?.error){
            promResolvers.get(eventData.resId)?.reject(eventData);
            // console.info('Error: ', event?.data?.data)
        }else {
            promResolvers.get(eventData.resId)?.resolve(eventDataData);
        }
        promResolvers.delete(event.data.resId)
    } catch (e) {
        // console.error('Failed to connect resolve msg', e)
    }
    } else if(eventData?.type === "CLWALLET_PAGE_LISTENER") {
        if((eventDataData?.listner ?? 'x') in listners ) {
            try {
                const listnerName = eventDataData.listner as ('accountsChanged' | 'connect' | 'disconnect' | 'chainChanged')
                if( listnerName === 'connect' && eventDataData) {
                    (<any>eth).networkVersion = eventDataDataData?.chainId?.toString(10) ?? '137';
                    (<any>eth).chainId = eventDataDataData?.chainId ?? '0x89';
                    (<any>eth).selectedAddress = eventDataData?.address?.[0] ?? null;
                    (<any>eth).accounts = [eventDataData.address?.[0]] ?? [];
                    (<any>eth).isConnected = () => true;
                } else if( listnerName === 'chainChanged' ) {
                    (<any>eth).networkVersion = eventDataData?.toString(10) ?? '137';
                    (<any>eth).chainId = eventDataData ?? '0x89';
                } else if ( listnerName === 'accountsChanged' ) {
                    (<any>eth).accounts = [eventDataData?.[0]] ?? [];
                    (<any>eth).selectedAddress = eventDataData?.[0] ?? '';
                }
                listners[listnerName].forEach(listner => listner(eventDataDataData));
                listners.once[listnerName].forEach(listner => {
                    listner(eventDataData)
                    listners.once[listnerName].delete(listner)
                });
            } catch (e) {
                // console.info(e)
                // ignore
            }
        }   
    }
  }

window.addEventListener("message",listner)



const web3Shim = {
    currentProvider: eth,
    __isMetaMaskShim__: true
}

const injectWallet = (win: any) => {
Object.defineProperty(win, 'ethereum', {
    value: eth,
});
Object.defineProperty(win, 'web3', {
    value: web3Shim
});
sendMessage({
    method: 'wallet_ready'
}, true)
// console.log('Clear wallet injected', (window as any).ethereum, win)
}

injectWallet(this);
loadEIP1193Provider(eth)


// HELPERS TO CLONE METAMASK API

// window.addEventListener("message" , (event) => {
//     console.log('event', event)
// })

// setTimeout(() => {
//     console.log('Metamask clone test');
//     console.log((<any>window).ethereum.send({
//         "jsonrpc": "2.0",
//         "method": "eth_accounts",
//         "params": [],
//         "id": 0
//     }))
//     console.log((<any>window).ethereum.request({
//         "jsonrpc": "2.0",
//         "method": "eth_accounts",
//         "params": [],
//         "id": 0
//     }))
// }, 5000)

// setTimeout(() => {
//     // console.log('Metamask clone test');
//     // (<any>window).ethereum.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x89"}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum2.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x89"}]}).then((res: any) => { console.log(res, '111111111')});
//     //    (<any>window).ethereum.on('connect', ((a: any, b: any) => console.log('connect', a, b)));
//     // (<any>window).ethereum.on('accountsChanged', ((a: any, b: any) => console.log('accountsChanged', a, b)));
//     // (<any>window).ethereum.on('chainChanged', ((a: any) => console.log('chainChanged', a, typeof a)));
//     // console.log((<any>window).ethereum.on('message', (a: any, b:any) => console.log(a,b)))
//     console.log((<any>window).ethereum.toString())
//     console.log((<any>window).ethereum2.toString())
//     console.log((<any>window).ethereum.Symbold)

// }, 3500)

// console.log( (window as any).ethereum.request({method: 'eth_chainId'}))