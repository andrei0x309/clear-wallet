interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

const listners = {
    accountsChanged: new Set<() => void>(),
    connect: new Set<() => void>(),
    disconnect: new Set<() => void>,
    chainChanged: new Set<() => void>(),
}

const promResolvers = {} as any

const listner =  function(event: any) {
    if (event.source != window)
        return;
  
    if (event.data.type && (event.data.type == "CLWALLET_PAGE")) {
        if(event?.data?.data?.error){
            promResolvers[event.data.resId].reject(event.data.data)
        }else {
            promResolvers[event.data.resId].resolve(event.data.data);
        }
        promResolvers[event.data.resId] = undefined;
    }
  }

window.addEventListener("message",listner)

const sendMessage = (args: RequestArguments) => {
return new Promise((resolve, reject) => {
    const resId = crypto.randomUUID()
    promResolvers[resId] = { resolve, reject }
    const data = { type: "CLWALLET_CONTENT", data: args, resId};
    window.postMessage(data, "*");
})
}

// chainId
// : 
// "0x89"
// enable
// : 
// ƒ ()
// isMetaMask
// : 
// true
// networkVersion
// : 
// "137"
// request
// : 
// ƒ ()
// selectedAddress
// : 
// null
// send
// : 
// ƒ ()
// sendAsync
// : 
// ƒ ()
// _events
// : 
// {connect: ƒ}
// _eventsCount
// : 
// 1
// _handleAccountsChanged
// : 
// ƒ ()
// _handleChainChanged
// : 
// ƒ ()
// _handleConnect
// : 
// ƒ ()
// _handleDisconnect
// : 
// ƒ ()
// _handleStreamDisconnect
// : 
// ƒ ()
// _handleUnlockStateChanged
// : 
// ƒ ()
// _jsonRpcConnection
// : 
// {events: s, stream: d, middleware: ƒ}
// _log
// : 
// u {name: undefined, levels: {…}, methodFactory: ƒ, getLevel: ƒ, setLevel: ƒ, …}
// _maxListeners
// : 
// 100
// _metamask
// : 
// Proxy {isUnlocked: ƒ, requestBatch: ƒ}
// _rpcEngine
// : 
// o {_events: {…}, _eventsCount: 0, _maxListeners: undefined, _middleware: Array(3)}
// _rpcRequest
// : 
// ƒ ()
// _sendSync
// : 
// ƒ ()
// _sentWarnings
// : 
// {enable: false, experimentalMethods: false, send: false, events: {…}}
// _state
// : 
// {accounts: Array(0), isConnected: true, isUnlocked: true, initialized: true, isPermanentlyDisconnected: false}
// _warnOfDeprecation
// : 
// ƒ (

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
    on: (eventName: string, callback: () => void) => {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged.add(callback)
                break
            case 'connect':
                listners.connect.add(callback)
                break;
            case 'disconnect':
                listners.disconnect.add(callback)
                break;
            case 'chainChanged':
                listners.chainChanged.add(callback)
                break;

            default:
                return
        }
    },
    // Simulate Metamask
    _warnOfDeprecation: () => null,
    _state: {},
    _sentWarnings: () => null,
    _rpcRequest: () => null,
    _handleAccountsChanged: () => null,
    chainId: "0x89",
    networkVersion: "137",
    selectedAddress: null,
    send: () => null,
    sendAsync: async () => null,
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
    set: () => { return false },
    deleteProperty: () => { return false },
})

const injectWallet = (win: any) => {
    Object.defineProperty(win, 'ethereum', {
    get: function () {
        return eth
    },
    set: function () {
        return
    }
});
(window as any).tttest = 'test'
    // Object.defineProperty(window, 'ethereum', 444)
    console.log('Clear wallet injected', (window as any).ethereum, win)
}
injectWallet(this)



// setTimeout(() => {
//     console.log('Metamask clone test');
//     // (<any>window).ethereum.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, '111111111')});
    
// }, 3500)

// console.log( (window as any).ethereum.request({method: 'eth_chainId'}))