interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

const listners = {
    accountsChanged: new Set<(p?: any) => void>(),
    connect: new Set<(p?: any) => void>(),
    disconnect: new Set<(p?: any) => void>,
    chainChanged: new Set<(p?: any) => void>(),
}

const promResolvers = {} as any

const listner =  function(event: any) {
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type === "CLWALLET_PAGE")) {
        if(event?.data?.data?.error){
            promResolvers[event.data.resId].reject(event.data.data);
            // console.log('rejected')
        }else {
            promResolvers[event.data.resId].resolve(event.data.data);
        }
        promResolvers[event.data.resId] = undefined;
    } else if( event.data.type && (event.data.type === "CLWALLET_PAGE_LISTENER")) {
        if((event?.data?.data?.listner ?? 'x') in listners ) {
            try {
                const listnerName = event?.data?.data?.listner as ('accountsChanged' | 'connect' | 'disconnect' | 'chainChanged')
                listners[listnerName].forEach(listner => listner(event?.data?.data?.data));
            } catch {
                // ignore
            }
        }   
    }
  }

window.addEventListener("message",listner)

const sendMessage = (args: RequestArguments, ping = false) => {
return new Promise((resolve, reject) => {
    const resId = crypto.randomUUID()
    promResolvers[resId] = { resolve, reject }
    const data = { type: "CLWALLET_CONTENT", data: args, resId};
    if (ping) {
        data.type = 'CLWALLET_PING'
    }
    console.log('data in', data)
    window.postMessage(data, "*");
})
}

const eth = new Proxy({
    isConnected: () => {
        return true
    },
    // for maximum compatibility since is cloning the same API
    isMetaMask: true,
    enable: () => {
        return sendMessage({ method: 'eth_requestAccounts', params: Array(0)})
    },
    request: (args: RequestArguments): Promise<unknown> => {
        return sendMessage(args)
         
    },
    // Deprecated
    sendAsync: (arg1: RequestArguments, arg2: any): void => {
        sendMessage(arg1 as RequestArguments).then(result => {
            if (typeof arg2 === 'function'){
                (arg2 as (r?: any) => any )(result)
            }
        })
    },
    // Deprecated
    send: (arg1: unknown, arg2: unknown): unknown => {
        if( typeof arg1 === 'string' ) {
            return sendMessage({
                method: arg1,
                params: arg2 as object
            })
        } else if (arg2 === undefined) {
            console.error('Clear Wallet: Sync calling is deprecated and not supported')
        }else {
            sendMessage(arg1 as RequestArguments).then(result => {
                if (typeof arg2 === 'function'){
                    (arg2 as (r?: any) => any )(result)
                }
            })
        }
    },
    on: (eventName: string, callback: () => void) => {
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
                listners.disconnect.add(callback)
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.chainChanged.add(callback)
                break;
        }
    },
    removeListener: (eventName: string, callback: () => void) => {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged.delete(callback)
                break
            case 'connect':
                listners.connect.delete(callback)
                break;
            case 'disconnect':
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
    },
    // Internal Simulate Metamask 
    _warnOfDeprecation: () => null,
    _state: {},
    _sentWarnings: () => null,
    _rpcRequest: () => null,
    _handleAccountsChanged: () => null,
    // Deprecated - hardcoded for now, websites should not access this directly since is deprecated for a long time
    chainId: "0x89",
    // Deprecated - hardcoded for now, websites should not access this directly since is deprecated for a long time
    networkVersion: "137",
    selectedAddress: null,
    autoRefreshOnNetworkChange: false,
    // Internal Simulate Metamask 
    _events: {},
    _eventsCount: 0,
    _handleChainChanged: () => null,
    _handleConnect: () => null,
    _handleDisconnect: () =>  null,
    _handleStreamDisconnect: () => null,
    _handleUnlockStateChanged: () => null,
    _jsonRpcConnection: {},
    _log: {},
    _maxListeners: 100,
    _metamask: new Proxy({}, {}),
    _rpcEngine: {}
}, {
    set: () => { return true },
    // get: function(target, name, receiver) {
    //         if (!(name in target)) {
    //             console.log(`Getting non-existant property '" + ${name.toString()} + "'`);
    //             return undefined;
    //         }
    //         console.log(target, name, receiver)
    // },
    deleteProperty: () => { return false },
})

const injectWallet = (win: any) => {
    Object.defineProperty(win, 'ethereum', {
    get: function () {
        return eth
    },
    set: function () {
        return true
    }
});
// console.log('Clear wallet injected', (window as any).ethereum, win)
}
injectWallet(this)

// setTimeout(() => {
//     console.log('Metamask clone test');
//     // (<any>window).ethereum.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x99"}]}).then((res: any) => { console.log(res, '111111111')});
//     (<any>window).ethereum.on('connect', ((a: any, b: any) => console.log('connect', a, b)));
//     (<any>window).ethereum.on('accountsChanged', ((a: any, b: any) => console.log('accountsChanged', a, b)));
//     (<any>window).ethereum.on('chainChanged', ((a: any) => console.log('chainChanged', a, typeof a)));
// }, 3500)

// console.log( (window as any).ethereum.request({method: 'eth_chainId'}))