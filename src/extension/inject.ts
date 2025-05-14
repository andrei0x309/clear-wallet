export {};
import PQueue from "p-queue";

const MAX_PROMISES = 20

const queueDefault = new PQueue({concurrency: MAX_PROMISES});
const queueChainId = new PQueue({concurrency: MAX_PROMISES});

interface RequestArguments {
    id?: string
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
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGN0lEQVRoge1ZfUgbZxj/3eXLRK112gmDwWYjo9gVin8UN509aTsGG26ywUb/WrWTVtgK1lLGPurGRoe6rmtBN+r219wfhdaJUFw/ImgrMtuO0NrSIhuibU3RJqaa5HK5G8/rJWh6l1yStVLwBw9JLu897/P9PO8dVrGKVTzd4LSk37p1a/RrDYA9AF4BEFHpScCk0jCADgA98XsODAywT3MCYVqLior2NzU1obS0FLIsM3oS4Hme0djY2I6jR4/umJycbHO5XM2CIDyyu54Htq1bt+7swYMH4XQ68ePHl2HLssBs5R+7+AoAKRQBx3No7qhAMBhEQ0MDJiYmtgM4F12XzAN7Nm3ahPz8fHz1wbCqZ/ixCx+P5jfPorVvO+rr69Ha2nrW7/cXAJhdukzPpJUk/Mn2CXC8GRxvWhECx+O7jy5hy5YtqKiogJqTy6DnASvFuyQSIyUt63EcYM8xIyfPAimSZu4oCnwzYVitVhYNAIqMKiApigKrzQw+RQV4nkPdoZfx/Et2jI+PY3Z2FsSL4zTTLYn8Cmw2B7xeLx4+fEiXvEYVYOB4ftGVKQj/zclyTE1N4cCBL3Hz5k0mBFWUdEGK0/2iKBKHX1NSgOdNSEF+vNtYjDt37qCurg6hUKgJwM9qYUm4TxJEXRcAEEpJAbI+WdXQLhywuaoQLS0tJPx+l8v1vSAIrwJ4QxUi0ybCqzwGAfxpWAHOoPufKbJhYWEBbrebfv5GwjudzqHKykqYTKaMmyCFEfEg/qOjo69HlTAQQsaSeE2BlcUpNR4A8wDKcnNzUV5ejuLiYpYLmYByQZIkxmF0dLTSkAKLIWRsVzmy2P7J2ipfSyAQgMfjwdVRLq0qtBwK3nvfCYvFQldt0b8SK8BRCBljT2vjIEYiEWb5YDDzLm618swD4TDjFUvm5CFkMIl5nXJFCoQlbQUc2RbIcgSBBQlcEkvxJm1RE5c31gcMuiDBOtVqMWzYUIAq4QXcvn0bd+/eh9lsxr//AHM+my4PvYaaJISMK5DIgmoTYti48Vkm/LFjx9Df388qS0lJCaqrq8FxBbjv0fYkx2tXscTSkVCpkJ4CYTFG1dvW4/jx4zh16lTH/Px8YSAQKHS73R19fX0oKFxAMBRctj5K8V40pABVDuYFQ6SfK6IYZpSdbWG94vTp03R5n8vlmiEC8AnNTRMTE8jK4mPr40kLiXOAhDJa/hIqsFg0JGnZdktv4MgA1Dd83nBs/VKYTOmE0P+EaBhMe7xwOByora0lxkcEQSggAvBDWVkZ6BA1MzunGUKiTggl9ICikhEkWrfU/T09V9HY2Egm39Pf308PDFBVVYWamhoMDk5CFCVtQc3aHs5kSjQMsmAUF1zXWV/Yu3cvdu3axa6GQiF0/z6CGzc8uiwt2no9KQ+Iy36fP38NFy5cR36+A7KswOud13u+EIPFkoYHFCiQDaqgaKyLHkb0SuD0tKh5XQuiqJ2uiRVQFCiKsTFYY9q0kvDsOMnLMJsyqxfUH6hjpzTMLSpgzAM0hFJXpQGOKiZNEOQBmkgPffFWjF+6IF6UKykNc2R92eCefp8Eq9WOrKwsalbZAC7Pzc3h4sWLuHLlyv9yHsjLy2MPCtRTWXIFZEWBbDCEZu6H4HAUsVo+MDCw0+VytQuCUDE1NbVyR0qWwoqxTkyRc+2veezevRvDw8NtgiAo6qH+7xU71C+GkPGT1MkuD1o6X0RXVxdNm+1ut7udQkc9paWF6Iylxn9WvBJJ+4DREAJrWMDnDeOob34Ohw8fZglHZ+RMngvZ7XYmfGdnJ3p7ez8E0GlEATNpLgYlKEpqm4fDCjq+nWSznSPHhNw8EyKR9BKY8t43I+Hrn5zIycmhS2sfEVTnXpGsp/ALkBVHWpuT+/xzMvxzmZ2H16w1s07+4MED+jkd/7+eeQfv3bsH4Z0QZFliubASREXnsyPrMTIygqGhIZLrj3hB9TzQcevWrdqxsTHs3LcZPb8Adkc2zDSPZFbODSEclqHIPD5tK2E5dOLECfj9/u3x7wYSKXDO5/O19fb27qenwq+9XQqLxZ9SZ84UdG44c+YMuru7ob5iOpfKK6bo15V+yXdJfcn3SOhEXzGtYhWreJoB4D9CrzrJ8WeKXgAAAABJRU5ErkJggg==',
    rdns: 'eu.flashsoft.clear-wallet',
}

const ProviderInfoMetamask = {
    "uuid": "5531e370-ec90-497b-a734-0268948ac6a4",
    "name": "MetaMask",
    "icon": 'data:image/png;base64,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',
    "rdns": "io.metamask"
}


function loadEIP1193Provider(provider: any) {

    function announceProvider() {
      const info: EIP6963ProviderInfo = ProviderInfo
      if(!provider.accounts?.length) {
        return
      }
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: Object.freeze({ info, provider }),
        })
      );

      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: Object.freeze({ info: ProviderInfoMetamask, provider }),
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
    // console.info('EIP-1193 Provider loaded')
  }

const listeners = {
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

const clearListeners = () => {
    for(const key of Object.keys(listeners)) {
        if(key === 'once'){
            for(const onceKey of Object.keys(listeners[key])) {
                (<any>listeners)[key][onceKey].clear()
            }
        }else {
            (<any>listeners)[key].clear()
        }
    }
}

const promResolvers = new Map()

const getListenersCount = (): number => {
    let count = 0
    for(const key of Object.keys(listeners)) {
        if(key === 'once'){
            for(const onceKey of Object.keys(listeners[key])) {
                count += (<any>listeners)[key][onceKey]?.length
            }
        }else {
            count += (<any>listeners)[key].length
        }
    }
    return count
}

const sendMessage = (args: RequestArguments, ping = false, from = 'request'): Promise<unknown> => {
    const resId = [...`${Math.random().toString(16) + Date.now().toString(16)}`].slice(2).join('')
    const method = args.method

    const newMessage =  async () => {
        return await new Promise((resolve, reject) => {
    // const p = [ "eth_signTypedData", "eth_signTypedData_v3", "eth_signTypedData_v4"]
    // const throttledMethods = [...p, 'eth_sign', 'personal_sign', 'eth_sendTransaction']
    
    // const isThrottled = throttledMethods.includes(args.method)
    
    // if(UIpromResolvers.size > MAX_PROMISES && isThrottled) {
    //     reject({code: -32000, message: 'ClearWallet: Too many requests', error: true })
    //     return
    // }
        
        // if(isThrottled) {
        //     UIpromResolvers.set(resId, { resolve, reject })
        // }
        //     promResolvers.set(resId, { resolve, reject })

        
        
        // if (p.includes(args.method)) {
        //     args.method = undefined as any
        // }

        if (method === 'wallet_getPermissions') {
            args.params = [{ isConnected: eth.isConnected() }]
        }

        const data = { 
            type: "CLWALLET_CONTENT", 
            target: 'metamask-contentscript',
            data: {
                method,
                name: 'metamask-provider', data: args, jsonrpc: '2.0', id: Number(resId.replace(/[A-Za-z]/g, '').slice(0, 10)) 
            },
            resId,
            from,
        }
        if (ping) {
            data.type = 'CLWALLET_PING'
        }
        if(method !== 'eth_chainId') {
            // console.info('data in', data)          
        }

        window.postMessage(data, "*");
        promResolvers.set(resId, { resolve, reject })
    })
   }

   let retPromise: Promise<unknown>
   if(method !== 'eth_chainId') {
    retPromise = queueDefault.add(newMessage)
   } else {
    retPromise = queueChainId.add(newMessage)
   }
   return retPromise
}

(function() {
      
    class MetaMaskAPI {
        isMetaMask = true
        isClWallet = true
        accounts = []
        _state = {accounts: [], isConnected: false, isUnlocked: true, initialized: true, isPermanentlyDisconnected: false}
        _sentWarnings = {
            enable: false,
            experimentalMethods: false,
            send: false,
            events: {
              close: false,
              data: false,
              networkChanged: false,
              notification: false,
            },
          }
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
        _maxListeners = 10
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
        initialConnect()  {
            sendMessage({
                method: 'wallet_ready'
            }, true)
        }
        isConnected() {
            return this._state.isConnected
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
                }
                return resultFmt(sendMessage(arg1 as RequestArguments, false, 'send'))
          } else if (typeof arg1 === 'object') {
                    if( typeof arg1 === 'string' ) {
                        return resultFmt(sendMessage({
                            method: arg1,
                            params: undefined
                        }, false, 'send')) 
                }
                return resultFmt(sendMessage(arg1 as RequestArguments, false, 'send'))
            }else if( typeof arg1 === 'string' ) {
                return resultFmt( sendMessage({
                    method: arg1,
                    params: arg2 as object
                }, false, 'send'))
            }
            return resultFmt(sendMessage(arg1 as RequestArguments, false, 'send'))
        }
        on (eventName: string, callback: () => void) {
            this.addListener(eventName, callback)
            return this
        }
    
        addListener (eventName: string, callback: () => void) {
            switch (eventName) {
                case 'accountsChanged':
                    listeners.accountsChanged.add(callback)
                    break
                case 'connect':
                    listeners.connect.add(callback)
                    sendMessage({
                        method: 'wallet_ready'
                    }, true)
                    break;
                case 'disconnect':
                case 'close':
                    listeners.disconnect.add(callback)
                    break;
                // Deprecated  - chainIdChanged -networkChanged
                case 'chainChanged':
                case 'chainIdChanged':
                case 'networkChanged':
                    listeners.chainChanged.add(callback)
                    break;
            }
            return this
        }
    
        once (eventName: string, callback: () => void) {
            switch (eventName) {
                case 'accountsChanged':
                    listeners.once.accountsChanged.add(callback)
                    break
                case 'connect':
                    listeners.once.connect.add(callback)
                    sendMessage({
                        method: 'wallet_ready'
                    }, true)
                    break;
                case 'disconnect':
                case 'close':
                    listeners.once.disconnect.add(callback)
                    break;
                // Deprecated  - chainIdChanged -networkChanged
                case 'chainChanged':
                case 'chainIdChanged':
                case 'networkChanged':
                    listeners.once.chainChanged.add(callback)
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
                    listeners.accountsChanged.delete(callback)
                    break
                case 'connect':
                    listeners.connect.delete(callback)
                    break;
                case 'disconnect':
                case 'close':
                    listeners.disconnect.delete(callback)
                    break;
                // Deprecated  - chainIdChanged -networkChanged
                case 'chainChanged':
                case 'chainIdChanged':
                case 'networkChanged':
                    listeners.chainChanged.delete(callback)
                    break;
                default:
                    return
            }
            return this
        }
        
        removeAllListeners()  {
            listeners.accountsChanged.clear()
            listeners.chainChanged.clear()
            listeners.disconnect.clear()
            listeners.connect.clear()
            return this
        }
    
        getMaxListeners()  {
            return 10
        }
        _getExperimentalApi ()  {
            return this._metamask
        }
        eventNames () {
            return []
        }
        listenerCount () {
            return getListenersCount()
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

      (window as any).MetaMaskAPI = MetaMaskAPI;

  })();



const eth = new Proxy( new (window as any).MetaMaskAPI(), {
    deleteProperty: () => { return true },
    // set(obj, prop, value) {
    //     // Reflect.set(obj, prop, value);
    //     return true;
    //   }
})

const listner =  function(event: any) {
    if (event.source != window) return;
    if(!['CLWALLET_PAGE', 'CLWALLET_PAGE_LISTENER'].includes(event?.data?.type)) return;
    const eventData = event?.data
    const eventDataData = event?.data?.data
    const eventDataDataData = event?.data?.data?.data
    const resId = eventData?.resId
    const result = eventDataDataData?.result
    if(eventData?.type === "CLWALLET_PAGE_LISTENER") {
        if((eventDataData?.listener ?? 'x') in listeners ) {
            try {
                const listnerName = eventDataData.listener as ('accountsChanged' | 'connect' | 'disconnect' | 'chainChanged')
                if( listnerName === 'connect' && eventDataData) {
                    (<any>eth).networkVersion = String(parseInt(eventDataDataData?.chainId ?? "0x89", 16));
                    (<any>eth).chainId = eventDataDataData?.chainId ?? '0x89';
                    (<any>eth).selectedAddress = eventDataData?.address?.[0] ?? null;
                    (<any>eth).accounts = eventDataData.address?.[0] ? [eventDataData.address?.[0]] : [];
                    (<any>eth)._state.accounts = (<any>eth).accounts;
                    (<any>eth)._state.isConnected = true;
                } else if( listnerName === 'chainChanged' ) {
                    (<any>eth).networkVersion = String(parseInt(eventDataDataData ?? "0x89", 16));
                    (<any>eth).chainId = eventDataData ?? '0x89';
                } else if ( listnerName === 'accountsChanged' ) {
                    (<any>eth).accounts = eventDataData?.[0] ? [eventDataData?.[0]] : [];
                    (<any>eth)._state.accounts = (<any>eth).accounts;
                    (<any>eth).selectedAddress = eventDataData?.[0] ?? '';
                } else if ( listnerName === 'disconnect' ) {
                    clearListeners();
                    (<any>eth)._state.isConnected = false;
                    (<any>eth).selectedAddress = null;
                    (<any>eth).accounts = [];
                    (<any>eth)._state.accounts = (<any>eth).accounts;
                    (<any>eth).networkVersion = null;
                    (<any>eth).chainId = null;
                    (<any>eth).initialConnect = () => {}
                }

                listeners[listnerName]. forEach(listner => {
                    console.log('listner', listner)
                    listner(eventDataData)
                });
                
                // listeners.once[listnerName].forEach(listner => {
                //     listner(eventDataData)
                //     listeners.once[listnerName].delete(listner)
                // });
            } catch (e) {
                // console.info(e)
                // ignore
            }
        }
    }
    try {
        const promise = promResolvers?.get(resId)
        if(promise) {
        if(result?.error){
            promise.reject(result);
        }else {
            promise.resolve(result), 2000
        }
        // promResolvers.delete(resId)
    }
    } catch (e) {
        console.error('Failed to connect resolve msg', e)
        promResolvers?.get(resId)?.reject({code: -32000, message: 'Failed to connect resolve msg', error: true });
    }
  }

window.addEventListener("message",listner)

Object.defineProperties(eth, {
    selectedAddress: { enumerable: false },
    chainId: { enumerable: false },
    networkVersion: { enumerable: false },
});

const web3Shim = {
    currentProvider: eth,
    __isMetaMaskShim__: true
}

const injectWallet = () => {
const ethKey = 'ethereum'
if ((window as any)[ethKey]?.isClWallet) {
    return;
}

Object.defineProperty((window as any), ethKey, {
    value: eth,
});
Object.defineProperty((window as any), 'web3', {
    value: web3Shim
});

  eth.initialConnect() 
}

injectWallet();
loadEIP1193Provider(eth);
document.addEventListener('DOMContentLoaded', () => {
loadEIP1193Provider(eth);
})

// HELPERS TO CLONE METAMASK API


// const MMReflect = async () => {

//     await new Promise((resolve) => setTimeout(resolve, 2000))

//     const originalRequest = (window as any).ethereum.request
//     const originalSend = (window as any).ethereum.send
//     const originalSendAsync = (window as any).ethereum.sendAsync

//     const methods = [originalRequest, originalSend, originalSendAsync]
//     const originalMethods = ['request', 'send', 'sendAsync']

//     for(const [index, method] of methods.entries()) {
//         const methodName = originalMethods[index];
//         (window as any).ethereum[methodName] = new Proxy(method, {
//             apply(target, thisArg, argsList) {
//                 const isEthChainId = argsList[0]?.method === 'eth_chainId'

//                 const result = Reflect.apply(target, thisArg, argsList) as Promise<unknown>
//                 const resultCLW = Reflect.apply(sendMessage, thisArg, argsList) as Promise<unknown>
                
//                 if(!isEthChainId) {
//                  result?.then((res: any) => {
//                     resultCLW?.then((resCLW: any) => {
//                         console.log(`window.ethereum.${methodName} ${JSON.stringify(argsList, null, 2)} result:`, res, resCLW);
//                     })
//                 })
//                 }

//                 return result;
//             }
//         });
//     }

//         console.log('Reflecting Metamask API')
// }


// MMReflect()

// window.addEventListener("message" , (event) => {
//     console.log('event', JSON.stringify(event?.data?.data, null, 2), JSON.stringify(event?.data, null, 2))
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

// setTimeout(async () => {
//     console.log('Metamask clone test');
//     // (<any>window).ethereum.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, 'MT: eth_requestAccounts')});
//     // (<any>window).ethereum2.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, 'CW: eth_requestAccounts')});

//     // await new Promise((resolve) => setTimeout(resolve, 1000));

//     // (<any>window).ethereum.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, 'MT: eth_accounts')});
//     // (<any>window).ethereum2.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, 'CW: eth_accounts')});

//     // await new Promise((resolve) => setTimeout(resolve, 1000));

//     (<any>window).ethereum.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, 'MT: eth_chainId')});
//     (<any>window).ethereum2.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, 'CW: eth_chainId')});

//     // await new Promise((resolve) => setTimeout(resolve, 1000));


//     // (<any>window).ethereum.request({method: 'eth_blockNumber', params:  Array(0)}).then((res: any) => { console.log(res, 'MT: eth_chainId')});
//     // (<any>window).ethereum2.request({method: 'eth_blockNumber', params:  Array(0)}).then((res: any) => { console.log(res, 'CW: eth_chainId')});
    
//     // await new Promise((resolve) => setTimeout(resolve, 1000));

    
//     // (<any>window).ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, 'MT: wallet_requestPermissions')});
//     // (<any>window).ethereum2.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, 'CW: wallet_requestPermissions')});

//     // await new Promise((resolve) => setTimeout(resolve, 1000));
    
//     // (<any>window).ethereum.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, 'MT: net_version')});
//     // (<any>window).ethereum2.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, 'CW: net_version')});

//     // await new Promise((resolve) => setTimeout(resolve, 1000));
    
//     // (<any>window).ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x89"}]}).then((res: any) => { console.log(res, 'MT: wallet_switchEthereumChain')});
//     // (<any>window).ethereum2.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x89"}]}).then((res: any) => { console.log(res, 'CW: wallet_switchEthereumChain')});

//     // await new Promise((resolve) => setTimeout(resolve, 1000));

//     // (<any>window).ethereum.on('connect', ((a: any, b: any) => console.log('connect MT', a, b)));
//     // (<any>window).ethereum.on('accountsChanged', ((a: any, b: any) => console.log('accountsChanged MT', a, b)));
//     // (<any>window).ethereum.on('chainChanged', ((a: any) => console.log('chainChanged MT', a, typeof a)));
  
//     // await new Promise((resolve) => setTimeout(resolve, 1000));

//     // (<any>window).ethereum2.on('connect', ((a: any, b: any) => console.log('connect CW', a, b)));
//     // (<any>window).ethereum2.on('accountsChanged', ((a: any, b: any) => console.log('accountsChanged CW', a, b)));
//     // (<any>window).ethereum2.on('chainChanged', ((a: any) => console.log('chainChanged CW', a, typeof a)));

// }, 3500)
