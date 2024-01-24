import { 
    CLW_CONTEXT_MENU_ID,
    getSelectedAccount, 
    getSelectedNetwork, 
    smallRandomString, 
    getSettings, 
    clearPk, 
    openTab, 
    getUrl, 
    addToHistory, 
    getNetworks, 
    strToHex, 
    numToHexStr,
    enableRightClickVote,
} from '@/utils/platform';
import { 
    userApprove, 
    userReject, 
    rIdWin, 
    rIdData,
} from '@/extension/userRequest'
import { 
    signMsg, 
    getBalance, 
    getBlockNumber, 
    estimateGas, 
    sendTransaction, 
    getGasPrice, 
    getBlockByNumber, 
    evmCall, 
    getTxByHash, 
    getTxReceipt, 
    signTypedData, 
    getCode, 
    getTxCount,
    getSelectedAddress
} from '@/utils/wallet'
import type { RequestArguments } from '@/extension/types'
import { rpcError } from '@/extension/rpcConstants'
import { updatePrices } from '@/utils/gecko'
import { mainNets, testNets } from '@/utils/networks'

let notificationUrl: string

chrome.runtime.onInstalled.addListener(() => {
    enableRightClickVote()
    console.info('Service worker installed');
})

chrome.runtime.onStartup.addListener(() => {
    console.info('Service worker startup');
    enableRightClickVote();
    if(chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

chrome.runtime.onSuspend.addListener(() => {
    console.info('Service worker suspend');
    if(chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

async function pasteAddress() {
        const currentAddress = (await (window as any).ethereum?.request({
            method: 'eth_accounts',
            params: []
        }))
        if(currentAddress.length > 0) {
            document.execCommand("insertText", false, currentAddress[0]);
    }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const extensionId = chrome.runtime.id
    const isOwnExtension = info?.pageUrl?.startsWith(`chrome-extension://${extensionId}`)

    if (info.menuItemId === CLW_CONTEXT_MENU_ID && tab?.id && !isOwnExtension) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                world: 'MAIN',
                func: pasteAddress
            });
        } catch {
          // igonre
        }
    } else if(isOwnExtension) {
        chrome.runtime.sendMessage({ method: 'paste', type: 'CLWALLET_PAGE_MSG' }, (r) => {
            if (chrome.runtime.lastError) {
                console.warn("LOC3: Error sending message:", chrome.runtime.lastError);
            }
            return r
        })
    }
})

chrome.alarms.create('updatePrices', {
    periodInMinutes: 1
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if(alarm.name === 'updatePrices') {
    updatePrices().then(() => {
        console.info('Prices updated')
    }).catch((err) => {
        console.warn('Prices update failed', err)
    })
  }
  getSettings().then((settings) => {
    if( ((settings.lastLock + settings.lockOutPeriod * 6e4) < Date.now()) && settings.lockOutEnabled && !settings.lockOutBlocked ) {
        settings.lastLock = Date.now()
        clearPk()
    }
  })
})

chrome.windows.onRemoved.addListener(async (winId) => {
    if (winId in (userReject ?? {})){
        userReject[winId]?.()
    }
    userReject[winId] = undefined
    userApprove[winId] = undefined
    rIdWin[winId] = undefined
    rIdData[winId] = undefined
    const wins = await chrome.windows.getAll()
    if(wins.length === 0) {
        const s = await getSettings()
        if(s.enableStorageEnctyption) {
            await clearPk()
        }
    }
})

const viewTxListner = async (id: string) => {
    try {
        const url = new URL(notificationUrl)
        openTab(url.href)
        chrome.notifications.clear(id)
    } catch {
        // ignore
    }
}

if (!chrome.notifications.onButtonClicked.hasListener(viewTxListner)){
    chrome.notifications.onButtonClicked.addListener(viewTxListner)
}

const mainListner = (message: RequestArguments, sender:any, sendResponse: (a: any) => any) => {
    if (chrome.runtime.lastError) {
        console.info("Error receiving message:", chrome.runtime.lastError);
    }
    if(message?.type !== "CLWALLET_CONTENT_MSG") {
        return true
    }

    console.info('main listener', message);

    (async () => {
        if (!(message?.method)) {
            sendResponse({
                code: 500,
                message: 'Invalid request method'
            })
        } else {
            // ETH API
            switch (message.method) {
                case 'eth_call': {
                    sendResponse(await evmCall(message?.params?.[0]))
                    break
                }
                case 'eth_getBlockByNumber': {
                    try {
                    const params = message?.params?.[0] as any
                    const block = await getBlockByNumber(params) as any
                    block.gasLimit = block.gasLimit.toHexString()
                    block.gasUsed = block.gasUsed.toHexString()
                    block.baseFeePerGas  = block.baseFeePerGas.toHexString()
                    block._difficulty = block._difficulty.toHexString()
                    sendResponse(block)
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break;
                }
                case 'eth_getTransactionCount': {
                    try {
                     if(message?.params?.[1]) {
                        sendResponse(numToHexStr(Number(await getTxCount(message?.params?.[0] as string, message?.params?.[1] as string))))
                     }else {
                        sendResponse(numToHexStr(Number(await getTxCount(message?.params?.[0] as string))))
                     }
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        
                    }
                    break
                }
                case 'eth_getTransactionByHash': {
                    try {
                    sendResponse(await getTxByHash(message?.params?.[0] as string))
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break
                }
                case 'eth_getTransactionReceipt':{
                    try {
                    sendResponse(await getTxReceipt(message?.params?.[0] as string))
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break
                }
                case 'eth_gasPrice': {
                    try {
                    sendResponse(numToHexStr(BigInt(Math.trunc(await getGasPrice() * 1e9))))
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break;
                }
                case 'eth_getBalance': {
                    try {
                    const balance = await getBalance()
                    const balanceHex = numToHexStr(balance ?? 0n)
                    sendResponse(balanceHex)
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break
                }
                case 'eth_getCode': {
                    try {
                    sendResponse(await getCode(message?.params?.[0] as string))
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break
                }
                case 'eth_blockNumber': {
                    try {
                    sendResponse(await getBlockNumber())
                    } catch {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                    }
                    break               
                }
                case 'eth_estimateGas': {
                    try { 
                    const params = message?.params?.[0] as any
                    if(!params) {
                        sendResponse({
                            error: true,
                            code: rpcError.INVALID_PARAM,
                            message: 'Invalid param for gas estimate'
                        })
                        break
                    }
                    const gas = await estimateGas({
                        to: params?.to ?? '',
                        from: params?.from ?? '',
                        data: params?.data ?? '',
                        value: params?.value ?? '0x0'
                    })
                    const gasHex = numToHexStr(gas ?? 0n)
                    sendResponse(gasHex)
                    } catch(err) {
                    if(String(err).includes('UNPREDICTABLE_GAS_LIMIT')) {
                        chrome.notifications.create({
                            message: 'Gas estimate failed likely due to to many decimals substract 0.00001 form the value you have inpputed and try again.',
                            title: 'Error',
                            iconUrl: getUrl('assets/extension-icon/wallet_128.png'),
                            type: 'basic'
                        } as any)
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'Gas estimate failed'
                        })
                    }
                    sendResponse({
                        error: true,
                        code: rpcError.USER_REJECTED,
                        message: 'No network or user selected'
                    })
                }
                    break          
                }
                case 'eth_requestAccounts':
                case 'eth_accounts': {
                try {
                    sendResponse(await getSelectedAddress())
                 } catch {
                    sendResponse({
                        error: true,
                        code: rpcError.USER_REJECTED,
                        message: 'No network or user selected'
                    })
                }
                break
                }
                case 'eth_chainId': {
                try {
                    const network = await getSelectedNetwork()
                    const chainId = network?.chainId ?? 0
                    sendResponse(`0x${chainId.toString(16)}`)
                } catch {
                    sendResponse({
                        error: true,
                        code: rpcError.USER_REJECTED,
                        message: 'No network or user selected'
                    })
                }
                break
                }
                case 'eth_sendTransaction': {
                    try {
                        const params = message?.params?.[0] as any
                        if(!params) {
                            sendResponse({
                                error: true,
                                code: rpcError.INVALID_PARAM,
                                message: 'Invalid param for send transaction'
                            })
                            break
                        }
                        const [account, network] = await Promise.all([getSelectedAccount(), getSelectedNetwork()])
                        if(!account || !('address' in account)) {
                            await chrome.windows.create({
                                height: 450,
                                width: 400,
                                url: chrome.runtime.getURL(`index.html?route=wallet-error&param=${strToHex('No account is selected you need to have an account selected before trying to make a transaction')}&rid=${String(message?.resId ?? '')}`),
                                type: 'popup'
                            })
                            return
                        }
                        if(!network || !('chainId' in network)) {
                            await chrome.windows.create({
                                height: 450,
                                width: 400,
                                url: chrome.runtime.getURL(`index.html?route=wallet-error&param=${strToHex('No network is selected you need to have a network selected before trying to make a transaction')}&rid=${String(message?.resId ?? '')}`),
                                type: 'popup'
                            })
                            return
                        }
                        params.from = account.address
                        const serializeParams = strToHex(JSON.stringify(params)) ?? ''
                        let gWin: any
                        await new Promise((resolve, reject) => {
                        chrome.windows.create({
                            height: 450,
                            width: 400,
                            url: chrome.runtime.getURL(`index.html?route=sign-tx&param=${serializeParams}&rid=${String(message?.resId ?? '')}`),
                            type: 'popup'
                        }).then((win) => {
                            gWin = win
                            userReject[String(win.id)] = reject
                            userApprove[String(win.id)] = resolve
                            rIdWin[String(win.id)] = String(message.resId)
                            rIdData[String(win.id)] = {}
                        })

                        })
                        try {
                        // console.log('waiting for user to approve or reject')
                        // console.log(rIdData?.[String(gWin?.id ?? 0)])
                        const tx = await sendTransaction({...params, ...(rIdData?.[String(gWin?.id ?? 0)] ?? {}) } )
                        sendResponse(tx.hash)
                        const buttons = {} as any
                        const network = await getSelectedNetwork()
                        addToHistory({
                            date: Date.now(),
                            txHash: tx.hash,
                            chainId: network.chainId,
                            ...(network.explorer ? {txUrl: `${network.explorer}/tx/${tx.hash}`.replace('//', '/') } : {}),
                            webiste: (message?.website)
                        })
                        const notificationId = crypto.randomUUID()
                        if(network?.explorer) {
                            notificationUrl = `${network.explorer}/tx/${tx.hash}`.replace('//', '/')
                            buttons.buttons = [{
                                title: 'View Transaction',
                            }]
                            setTimeout(() => {
                                try {
                                    chrome.notifications.clear(notificationId)
                                } catch {
                                    // ignore
                                }
                            }, 6e4)
                        }
                        chrome.notifications.create(notificationId,{
                            message: 'Transaction Confirmed',
                            title: 'Success',
                            iconUrl: getUrl('assets/extension-icon/wallet_128.png'),
                            type: 'basic',
                            ...(buttons)
                        } as any)

                        const settings = await getSettings()
                        if(settings.encryptAfterEveryTx) {
                          clearPk()
                        }

                        } catch (err) {
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'TX Failed'
                            })
                            chrome.windows.create({
                                height: 450,
                                width: 400,
                                url: chrome.runtime.getURL(`index.html?route=wallet-error&param=${strToHex(String(err))}&rid=${String(message?.resId ?? '')}`),
                                type: 'popup'
                            })
                            chrome.notifications.create({
                                message: 'Transaction Failed',
                                title: 'Error',
                                iconUrl: getUrl('assets/extension-icon/wallet_128.png'),
                                type: 'basic'
                            } as any)
                        }
                        } catch(err) {
                            // console.log(err)
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'User Rejected Signature'
                            })
                        }
                    break
                }
                case 'signTypedData':
                case 'eth_signTypedData':
                case 'signTypedData_v1':
                case 'eth_signTypedData_v1':
                case 'signTypedData_v3': 
                case 'eth_signTypedData_v3':
                case 'signTypedData_v4':
                case 'eth_signTypedData_v4':
                case 'personal_sign':
                case 'eth_sign': {
                    try {
                    
                    const account = await getSelectedAccount()
                    
                    if(!account || !('address' in account)) {
                        await chrome.windows.create({
                            height: 450,
                            width: 400,
                            url: chrome.runtime.getURL(`index.html?route=wallet-error&param=${strToHex('No account is selected you need to have an account selected before trying sign a message')}&rid=${String(message?.resId ?? '')}`),
                            type: 'popup'
                        })
                        return
                    }

                    const isTypedSigned = [
                    'signTypedData', 
                    'eth_signTypedData', 
                    'signTypedData_v1', 
                    'eth_signTypedData_v1',
                    'signTypedData_v3',
                    'eth_signTypedData_v3',
                    'signTypedData_v4',
                    'eth_signTypedData_v4'].includes(message?.method);
                    const signMsgData = isTypedSigned ? String(message?.params?.[1] ?? '' ) : String(message?.params?.[0] ?? '' );

                    await new Promise((resolve, reject) => {
                    chrome.windows.create({
                        height: 450,
                        width: 400,
                        url: chrome.runtime.getURL(`index.html?route=sign-msg&param=${strToHex(signMsgData)}&rid=${String(message?.resId ?? '')}`),
                        type: 'popup'
                    }).then((win) => {
                        userReject[String(win.id)] = reject
                        userApprove[String(win.id)] = resolve
                        rIdWin[String(win.id)] = String(message.resId)
                    })
                    
                    })
                    sendResponse(
                        isTypedSigned ?
                        await signTypedData(signMsgData):
                        await signMsg(signMsgData)
                    )
                    const settings = await getSettings()
                    if(settings.encryptAfterEveryTx) {
                      clearPk()
                    }
                    } catch (e) {
                        // console.info(e)
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'User Rejected Signature'
                        })
                    }
                    break
                }
                // NON Standard / metamask API
                case 'eth_coinbase': {
                    const account = await getSelectedAccount()
                    const address = account?.address ?? null
                    sendResponse(address)
                    break
                }
                case 'net_listening': {
                    sendResponse(true)
                    break
                }
                case 'web3_clientVersion': {
                    sendResponse("MetaMask/v10.20.0")
                    break
                }
                case 'wallet_getPermissions':
                case 'wallet_requestPermissions': {
                    const account = await getSelectedAccount()
                    const address = account?.address ? [account?.address] : []
                    sendResponse([{
                        id: smallRandomString(21),
                        parentCapability: 'eth_accounts',
                        invoker: message?.website?.split('/').slice(0,3).join('/') ?? '',
                        caveats: [{
                            type:'restrictReturnedAccounts',
                            value: address
                        }],
                        date: Date.now(),
                    }])
                    break
                }
                case 'net_version': {
                    const network = await getSelectedNetwork()
                    const chainId = network?.chainId ?? 0
                    sendResponse(chainId)
                    break
                }
                case 'wallet_switchEthereumChain': {
                    try {
                        const currentChainId = `0x${((await getSelectedNetwork())?.chainId ?? 0).toString(16)}`
                        if(currentChainId === String(message?.params?.[0]?.chainId ?? '' )) {
                            sendResponse(null)
                        }else {
                        await new Promise((resolve, reject) => {
                        chrome.windows.create({
                            height: 450,
                            width: 400,
                            url: chrome.runtime.getURL(`index.html?route=switch-network&param=${String(message?.params?.[0]?.chainId ?? '' )}&rid=${String(message?.resId ?? '')}`),
                            type: 'popup'
                        }).then((win) => {
                            userReject[String(win.id)] = reject
                            userApprove[String(win.id)] = resolve
                            rIdWin[String(win.id)] = String(message.resId)
                        })
                        })
                        sendResponse(null)
                        }
                        } catch {
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'User Rejected chain switch'
                            })
                        }
                    break
                }
                case 'wallet_addEthereumChain': {
                    const userNetworks = await getNetworks()
                    const networks = {...mainNets, ...testNets, ...userNetworks}
                    const chainId = Number(message?.params?.[0]?.chainId ?? '0')
                    if(!chainId) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'Invalid Network'
                        })
                    }
                    if( chainId in networks ) {
                        mainListner({...message, method:'wallet_switchEthereumChain', params: [{
                            chainId: `0x${(chainId).toString(16)}`
                        }] }, sender, sendResponse)
                    } else {
                        if ( !message?.params?.[0]?.chainId || 
                             !message?.params?.[0]?.chainName || 
                             !message?.params?.[0]?.rpcUrls ||
                             !message?.params?.[0]?.blockExplorerUrls ||
                             !message?.params?.[0]?.nativeCurrency?.symbol 
                            ){
                                sendResponse({
                                    error: true,
                                    code: rpcError.USER_REJECTED,
                                    message: 'Invalid Network params chainId, chainName, rpcUrls, blockExplorerUrls, and nativeCurrency are required'
                                })
                            }else {
                                try {
                                    await new Promise((resolve, reject) => {
                                    chrome.windows.create({
                                        height: 450,
                                        width: 400,
                                        url: chrome.runtime.getURL(`index.html?route=request-network&param=${strToHex(JSON.stringify({...{website: message?.website ?? ''}, ...(message?.params?.[0] ?? {})}) ?? '')}&rid=${String(message?.resId ?? '')}`),
                                        type: 'popup'
                                    }).then((win) => {
                                        userReject[String(win.id)] = reject
                                        userApprove[String(win.id)] = resolve
                                        rIdWin[String(win.id)] = String(message.resId)
                                    })
                                    })
                                    sendResponse(null)
                                    } catch (err) {
                                        console.error('err')
                                        sendResponse({
                                            error: true,
                                            code: rpcError.USER_REJECTED,
                                            message: 'User Rejected adding network'
                                        })
                                    }
                            }
                    }
                    break
                }
                // internal messeges
                case 'wallet_connect': {
                    const pNetwork =  getSelectedNetwork()
                    const pAccount =  getSelectedAccount()
                    const [network, account] = await Promise.all([pNetwork, pAccount])
                    const address = account?.address ? [account?.address] : []
                    const chainId = `0x${(network?.chainId ?? 0).toString(16)}`
                    const data = { type: "CLWALLET_PAGE_LISTENER", data: {
                        listner: 'connect',
                        data: {
                            chainId
                        },
                        address
                      }};
                    sendResponse(data)
                    break
                }
                case 'wallet_approve': {
                    if(String(sender.tab?.windowId) in rIdWin){
                        userApprove[String(sender.tab?.windowId)]?.(true)
                    }
                    try {
                        chrome.windows.remove(sender.tab?.windowId ?? 0)
                    }catch (e) {
                        console.log(e)
                        // ignore
                    }
                    break
                }
                case 'wallet_send_data': {
                    if(String(sender.tab?.windowId) in rIdData){
                        const intData = rIdData[String(sender?.tab?.windowId ?? '')] ?? {}
                        rIdData[String(sender?.tab?.windowId ?? '')] = {...intData, ...(message?.data ?? {})}
                        sendResponse(true)
                    }
                    break
                }
                case 'wallet_get_data': {
                    if(String(sender.tab?.windowId) in rIdData){
                        sendResponse( rIdData[String(sender?.tab?.windowId ?? '')] ?? {})
                    }
                    break
                }
                case 'wallet_ping': {
                    sendResponse(true)
                    break
                }
                default: {
                    sendResponse({
                        error: true,
                        code: rpcError.INVALID_PARAM,
                        message: 'ClearWallet: Invalid request method ' + message?.method ?? '' 
                    })
                    break
                }
            }
        }
    }
    )();
    return true;
}

chrome.runtime.onMessage.addListener(mainListner);
