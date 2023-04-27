interface RequestArguments {
    id?: string | undefined
    method: string;
    params?: unknown[] | object;
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

const sendMessage = (args: RequestArguments, ping = false) => {
if(Object.values(promResolvers).filter(r=> r).length < 10 ) {
    return new Promise((resolve, reject) => {
        const resId = crypto.randomUUID()
        promResolvers.set(resId, { resolve, reject })
        const data = { type: "CLWALLET_CONTENT", data: args, resId};
        if (ping) {
            data.type = 'CLWALLET_PING'
        }
        // console.log('data in', data)
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
        return false
    }
    // for maximum compatibility since is cloning the same API
    
    enable() {
        return sendMessage({ method: 'eth_requestAccounts', params: Array(0)})
    }

    request(args: RequestArguments): Promise<unknown> {
        return sendMessage(args)
    }
    // Deprecated
    sendAsync (arg1: any, arg2: any): void | Promise<unknown>  {
        if( typeof arg1 === 'string' ) {
            return sendMessage({
                method: arg1,
                params: arg2 as object
            })
        }else if (typeof arg2 === 'function'){
                sendMessage(arg1 as RequestArguments).then(result => {
                    (arg2 as (e?: any, r?: any) => any )(undefined, {
                            id: (arg1 as RequestArguments)?.id,
                            jsonrpc: '2.0',
                            method: (arg1 as RequestArguments).method,
                            result
                          }
                    )
                }).catch( e => {
                    (arg2 as (er?: any, r?: any) => any )(new Error(e), {
                        id: (arg1 as RequestArguments)?.id,
                        jsonrpc: '2.0',
                        method: (arg1 as RequestArguments).method,
                        error: new Error(e)
                      }
                )
                })
            } 
    }
    // Deprecated
    send (arg1: unknown, arg2: unknown): unknown {
        if (arg2 === undefined) {
            if( typeof arg1 === 'string' ) {
                return sendMessage({
                    method: arg1,
                    params: undefined
                })
            } else if (typeof arg1 === 'object') {
                return sendMessage(arg1 as RequestArguments)
            } else {
                console.error('Clear Wallet: faulty request')
            }
        }else if( typeof arg1 === 'string' ) {
            return sendMessage({
                method: arg1,
                params: arg2 as object
            })
        }else if (typeof arg2 === 'function'){
                sendMessage(arg1 as RequestArguments).then(result => {
                    (arg2 as (e?: any, r?: any) => any )(undefined, {
                            id: (arg1 as RequestArguments)?.id,
                            jsonrpc: '2.0',
                            method: (arg1 as RequestArguments).method,
                            result
                          }
                    )
                }).catch( e => {
                    (arg2 as (er?: any, r?: any) => any )(new Error(e), {
                        id: (arg1 as RequestArguments)?.id,
                        jsonrpc: '2.0',
                        method: (arg1 as RequestArguments).method,
                        error: new Error(e)
                      }
                )
                })
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
        console.error('Clear Wallet: Sync calling is deprecated and not supported')
    }
}

const eth = new Proxy( new MetaMaskAPI(), {
    // set: () => { return true },
    // get: function(target, name, receiver) {
    //     if (typeof (<any>target)[name] == 'function') {
    //         return function (...args: any) {
    //           console.dir({ call: [name, ...args] });
    //           return undefined;
    //         }
    //         }

    //         let check = true
    //         setTimeout(() => check = false, 400)
    //         while(check){
    //             // igmore
    //         }
    // },
    deleteProperty: () => { return true },
})

const listner =  function(event: any) {
    if (event.source != window) return;

    if (event.data.type && (event.data.type === "CLWALLET_PAGE")) {
    try {
        if(event?.data?.data?.error){
            promResolvers.get(event.data.resId)?.reject(event.data.data);
            console.error(event?.data?.data)
        }else {
            promResolvers.get(event.data.resId)?.resolve(event.data.data);
        }
        promResolvers.delete(event.data.resId)
    } catch (e) {
        // console.log('Failed to connect resolve msg', e)
    }
    } else if( event.data.type && (event.data.type === "CLWALLET_PAGE_LISTENER")) {
        if((event?.data?.data?.listner ?? 'x') in listners ) {
            try {
                const listnerName = event?.data?.data?.listner as ('accountsChanged' | 'connect' | 'disconnect' | 'chainChanged')
                if( listnerName === 'connect' && event?.data?.data?.data) {
                    (<any>eth).networkVersion = event?.data?.data?.data?.chainId?.toString(10) ?? '137';
                    (<any>eth).chainId = event?.data?.data?.data?.chainId ?? '0x89';
                    (<any>eth).selectedAddress = event?.data?.data?.address ?? null;
                    (<any>eth).isConnected = () => true;
                } else if( listnerName === 'chainChanged' ) {
                    // console.log(event?.data?.data?.data);
                    (<any>eth).networkVersion = event?.data?.data?.data.toString(10) ?? '137';
                    (<any>eth).chainId = event?.data?.data?.data ?? '0x89';
                } else if ( listnerName === 'accountsChanged' ) {
                    (<any>eth).selectedAddress = event?.data?.data?.data?.address ?? 'dummy-string';
                }
                listners[listnerName].forEach(listner => listner(event?.data?.data?.data));
                listners.once[listnerName].forEach(listner => {
                    listner(event?.data?.data?.data)
                    listners.once[listnerName].delete(listner)
                });
            } catch (e) {
                // console.error(e)
                // ignore
            }
        }   
    }
  }

window.addEventListener("message",listner)

// const proxy1 = new Proxy({
//     // on: (event: any, callback:any) => { if (event === 'message') {
//     //     debugger;
//     //     callback(true, true)
//     // } }
// }, {
//     get: function(target, name, receiver) {
//         if (typeof (<any>target)[name] == 'function') {
//             return function (...args: any) {
//               console.dir({ call: [name, ...args] });
//             }
//             }

//         console.log('ETH', name.toString() , target, receiver);
//         return undefined
//     }
// })

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