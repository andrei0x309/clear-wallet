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
    enableRightClickPasteAddr,
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
import { allTemplateNets } from '@/utils/networks'
import { cyrb64Hash, stringify } from '@/utils/misc'

// const METAMAKS_EXTENSION_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn'

let notificationUrl: string

const chainIdThrottle: { [key: string]: number } = {}
const cache = new Map<string, { [key: string]: any }>()

const reInjectContentScripts = async () => {
    const cts = chrome.runtime.getManifest().content_scripts ?? []
    for (const cs of cts) {
        const tabs = await chrome.tabs.query({ url: cs.matches })
        for (const tab of tabs) {
            if (!tab?.id || !cs.js || !tab.url) {
                continue;
            }
            if (tab.url.match(/(chrome|chrome-extension):\/\//gi)) {
                continue;
            }

            const isWorldMain = (cs as any)?.world === 'MAIN'

            chrome.scripting.executeScript({
                files: cs.js,
                target: { tabId: tab.id, allFrames: cs.all_frames },
                injectImmediately: cs.run_at === 'document_start',
                world: isWorldMain ? 'MAIN' : 'ISOLATED'
            }).catch((err) => {
                console.warn('Error injecting content script', err)
            })
        }
    }
}

chrome.runtime.onInstalled.addListener(() => {
    enableRightClickPasteAddr()
    reInjectContentScripts();
    console.info('Service worker installed version', chrome.runtime.getManifest().version);
    if (chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

chrome.runtime.onStartup.addListener(() => {
    console.info('Service worker startup');
    enableRightClickPasteAddr();
    if (chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

chrome.runtime.onSuspend.addListener(() => {
    console.info('Service worker suspend');
    if (chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

async function pasteAddress () {
    const currentAddress = (await (window as any).ethereum?.request({
        method: 'eth_accounts',
        params: []
    }))
    if (currentAddress.length > 0) {
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
    } else if (isOwnExtension) {
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
    if (alarm.name === 'updatePrices') {
        updatePrices().then(() => {
            console.info('Prices updated')
        }).catch((err) => {
            console.warn('Prices update failed', err)
        })
    }
    getSettings().then((settings) => {
        if (((settings.lastLock + settings.lockOutPeriod * 6e4) < Date.now()) && settings.lockOutEnabled && !settings.lockOutBlocked) {
            settings.lastLock = Date.now()
            clearPk()
        }
    })
})

chrome.windows.onRemoved.addListener(async (winId) => {
    if (winId in (userReject ?? {})) {
        userReject[winId]?.()
    }
    userReject[winId] = undefined
    userApprove[winId] = undefined
    rIdWin[winId] = undefined
    rIdData[winId] = undefined
    const wins = await chrome.windows.getAll()
    if (wins.length === 0) {
        const s = await getSettings()
        if (s.enableStorageEnctyption) {
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

if (!chrome.notifications.onButtonClicked.hasListener(viewTxListner)) {
    chrome.notifications.onButtonClicked.addListener(viewTxListner)
}

const chainIdThrottleFn = async (website: string) => {
    let urlKey
    try {
        const url = new URL(website)
        urlKey = url.hostname
    } catch {
        urlKey = 'invalid'
    }
    if (chainIdThrottle[urlKey] === undefined) {
        chainIdThrottle[urlKey] = 0
    }
    chainIdThrottle[urlKey] += 1

    if (chainIdThrottle[urlKey] > 6) {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(null)
            }, 250)
        })
    }
    return urlKey
}

const mainListner = (message: RequestArguments, sender: any, sendResponse: (a: any) => any) => {
    if (chrome.runtime.lastError) {
        console.info("Error receiving message:", chrome.runtime.lastError);
    }
    if (message?.type !== "CLWALLET_CONTENT_MSG") {
        return true
    }

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
                    try {
                        const hash = cyrb64Hash('eth_call' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = await evmCall(message?.params ?? [])
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_call', e)
                    }
                    break
                }
                case 'eth_getBlockByNumber': {
                    try {

                        const hash = cyrb64Hash('eth_call' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }

                        const params = message?.params?.[0] as any
                        const block = await getBlockByNumber(params) as any
 
                        const newBlock = {} as any
 
                        newBlock.baseFeePerGas = typeof block.baseFeePerGas === 'string' ? block.baseFeePerGas : numToHexStr(block.baseFeePerGas)
                        newBlock.blobGasUsed = typeof block.blobGasUsed === 'string' ? block.blobGasUsed : numToHexStr(block.blobGasUsed)
                        newBlock.difficulty = typeof block.difficulty === 'string' ? block.difficulty : numToHexStr(block.difficulty)
                        newBlock._difficulty = newBlock.difficulty
                        newBlock.excessBlobGas = typeof block.excessBlobGas === 'string' ? block.excessBlobGas : numToHexStr(block.excessBlobGas)
                        newBlock.extraData = typeof block.extraData === 'string' ? block.extraData : numToHexStr(block.extraData)
                        newBlock.hash = typeof block.hash === 'string' ? block.hash : numToHexStr(block.hash)
                        newBlock.miner = typeof block.miner === 'string' ? block.miner : numToHexStr(block.miner)
                        newBlock.nonce = typeof block.nonce === 'string' ? block.nonce : numToHexStr(block.nonce)
                        newBlock.number = typeof block.number === 'string' ? block.number : numToHexStr(block.number)
                        newBlock.parentBeaconBlockRoot = typeof block.parentBeaconBlockRoot === 'string' ? block.parentBeaconBlockRoot : numToHexStr(block.parentBeaconBlockRoot)
                        newBlock.parentHash = typeof block.parentHash === 'string' ? block.parentHash : numToHexStr(block.parentHash)
                        newBlock.prevRandao = typeof block.prevRandao === 'string' ? block.prevRandao : numToHexStr(block.prevRandao)
                        newBlock.gasLimit = typeof block.gasLimit === 'string' ? block.gasLimit : numToHexStr(block.gasLimit)
                        newBlock.gasUsed = numToHexStr(block.gasUsed)
                        newBlock.receiptsRoot = typeof block.receiptsRoot === 'string' ? block.receiptsRoot : numToHexStr(block.receiptsRoot)
                        newBlock.stateRoot = typeof block.stateRoot === 'string' ? block.stateRoot : numToHexStr(block.stateRoot)
                        newBlock.timestamp =  block.timestamp
                        sendResponse(newBlock)

                        cache.set(hash, { time: Date.now(), data: newBlock })

                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_getBlockByNumber', e)
                    }
                    break;
                }
                case 'eth_getTransactionCount': {
                    try {
                        if (message?.params?.[1]) {
                            const hash = cyrb64Hash('eth_getTransactionCount' + stringify(message?.params))
                            const cacheItem = cache.get(hash)
                            if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                                sendResponse(cacheItem?.data);
                                break
                            }
                            const resp = numToHexStr(Number(await getTxCount(message?.params?.[0] as string, message?.params?.[1] as string)))
                            sendResponse(resp)
                            cache.set(hash, { time: Date.now(), data: resp })
                        } else {
                            const hash = cyrb64Hash('eth_getTransactionCount' + stringify(message?.params))
                            const cacheItem = cache.get(hash)
                            if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                                sendResponse(cacheItem?.data);
                                break
                            }
                            const resp = numToHexStr(Number(await getTxCount(message?.params?.[0] as string)))
                            sendResponse(resp)
                            cache.set(hash, { time: Date.now(), data: resp })
                        }
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_getTransactionCount', e)
                    }
                    break
                }
                case 'eth_getTransactionByHash': {
                    try {
                        const hash = cyrb64Hash('eth_getTransactionByHash' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = await getTxByHash(message?.params?.[0] as string)
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_getTransactionByHash', e)
                    }
                    break
                }
                case 'eth_getTransactionReceipt': {
                    try {
                        const hash = cyrb64Hash('eth_getTransactionByHash' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = await getTxReceipt(message?.params?.[0] as string)
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_getTransactionReceipt', e)
                    }
                    break
                }
                case 'eth_gasPrice': {
                    try {
                        const hash = cyrb64Hash('eth_gasPrice' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = numToHexStr(BigInt(Math.trunc((await getGasPrice()).price * 1e9)))
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_gasPrice', e)
                    }
                    break;
                }
                case 'eth_getBalance': {
                    try {
                        const hash = cyrb64Hash('eth_getBalance' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e2) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const balance = await getBalance()
                        const balanceHex = numToHexStr(balance ?? 0n)
                        sendResponse(balanceHex)
                        cache.set(hash, { time: Date.now(), data: balanceHex })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_getBalance', e)
                    }
                    break
                }
                case 'eth_getCode': {
                    try {
                        const hash = cyrb64Hash('eth_getCode' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = await getCode(message?.params?.[0] as string)
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_getCode', e)
                    }
                    break
                }
                case 'eth_blockNumber': {
                    try {
                        const hash = cyrb64Hash('eth_blockNumber' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 3e3) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = numToHexStr(await getBlockNumber())
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_blockNumber', e)
                    }
                    break
                }
                case 'eth_estimateGas': {
                    try {
                        const params = message?.params?.[0] as any
                        if (!params) {
                            sendResponse({
                                error: true,
                                code: rpcError.INVALID_PARAM,
                                message: 'Invalid param for gas estimate'
                            })
                            break
                        }
                        const hash = cyrb64Hash('eth_estimateGas' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e2) {
                            sendResponse(cacheItem?.data);
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
                        cache.set(hash, { time: Date.now(), data: gasHex })
                    } catch (err) {
                        if (String(err).includes('UNPREDICTABLE_GAS_LIMIT')) {
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
                        } else {
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'No network or user selected'
                            })
                            console.warn('Error: eth_estimateGas', err)
                        }
                    }
                    break
                }
                case 'eth_requestAccounts':
                case 'eth_accounts': {
                    try {
                        const hash = cyrb64Hash('eth_accounts' + stringify(message?.params))
                        const cacheItem = cache.get(hash)
                        if (cacheItem &&  cacheItem?.time > Date.now() - 5e2) {
                            sendResponse(cacheItem?.data);
                            break
                        }
                        const resp = await getSelectedAddress()
                        sendResponse(resp)
                        cache.set(hash, { time: Date.now(), data: resp })
                    } catch (e) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'No network or user selected'
                        })
                        console.warn('Error: eth_accounts', e)
                    }
                    break
                }
                case 'eth_chainId':
                case 'net_version':
                    {
                        try {
                            const hash = cyrb64Hash('eth_chainId' + stringify(message?.params))
                            const cacheItem = cache.get(hash)
                            if (cacheItem &&  cacheItem?.time > Date.now() - 1e3) {
                                sendResponse(cacheItem?.data);
                                break
                            }
                            const isNetVersion = message.method === 'net_version'
                            const urlKey = await chainIdThrottleFn(message?.website ?? '')
                            const network = await getSelectedNetwork()
                            const chainId = network?.chainId ?? 1
                            const resp = isNetVersion ? chainId.toString() : `0x${chainId.toString(16)}`
                            sendResponse(resp)
                            chainIdThrottle[urlKey] -= 1
                            cache.set(hash, { time: Date.now(), data: resp })
                        } catch (e) {
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'No network or user selected'
                            })
                            console.warn('Error: eth_chainId', e)
                        }
                        break
                    }
                case 'eth_sendTransaction': {
                    try {
                        const params = message?.params?.[0] as any
                        if (!params) {
                            sendResponse({
                                error: true,
                                code: rpcError.INVALID_PARAM,
                                message: 'Invalid param for send transaction'
                            })
                            break
                        }
                        const [account, network] = await Promise.all([getSelectedAccount(), getSelectedNetwork()])
                        if (!account || !('address' in account)) {
                            await chrome.windows.create({
                                height: 450,
                                width: 400,
                                url: chrome.runtime.getURL(`index.html?route=wallet-error&param=${strToHex('No account is selected you need to have an account selected before trying to make a transaction')}&rid=${String(message?.resId ?? '')}`),
                                type: 'popup'
                            })
                            return
                        }
                        if (!network || !('chainId' in network)) {
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

                        
                        let webDomain = ''
                        try {
                            const url = new URL(message?.website ?? '')
                            webDomain = url.hostname
                        } catch {
                            webDomain = ''
                        }

                        await new Promise((resolve, reject) => {
                            chrome.windows.create({
                                height: 450,
                                width: 400,
                                url: chrome.runtime.getURL(`index.html?route=sign-tx&param=${serializeParams}&rid=${String(message?.resId ?? '')}&website=${strToHex(webDomain)}`),
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
                            const tx = await sendTransaction({ ...params, ...(rIdData?.[String(gWin?.id ?? 0)] ?? {}) })
                            sendResponse(tx.hash)
                            const buttons = {} as any
                            const network = await getSelectedNetwork()
                            addToHistory({
                                date: Date.now(),
                                txHash: tx.hash,
                                chainId: network.chainId,
                                ...(network.explorer ? { txUrl: `${network.explorer}/tx/${tx.hash}`.replace('//', '/') } : {}),
                                webiste: (message?.website)
                            })
                            const notificationId = crypto.randomUUID()
                            if (network?.explorer) {
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
                            chrome.notifications.create(notificationId, {
                                message: 'Transaction Sent',
                                title: 'Success',
                                iconUrl: getUrl('assets/extension-icon/wallet_128.png'),
                                type: 'basic',
                                ...(buttons)
                            } as any)
                        } catch (err) {
                            console.info('Error: eth_sendTransaction', err)
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
                    } catch (err) {
                        console.warn('Error: eth_sendTransaction', err)
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'User Rejected Signature'
                        })
                    }
                    try {
                        const settings = await getSettings()
                        if (settings.encryptAfterEveryTx) {
                            await clearPk()
                        }
                    } catch {
                        // ignore
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

                        if (!account || !('address' in account)) {
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
                        const signMsgData = isTypedSigned ? String(message?.params?.[1] ?? '') : String(message?.params?.[0] ?? '');

                        let webDomain = ''
                        try {
                            const url = new URL(message?.website ?? '')
                            webDomain = url.hostname
                        } catch {
                            webDomain = ''
                        }

                        await new Promise((resolve, reject) => {
                            chrome.windows.create({
                                height: 510,
                                width: 480,
                                url: chrome.runtime.getURL(`index.html?route=sign-msg&param=${strToHex(signMsgData)}&rid=${String(message?.resId ?? '')}&website=${strToHex(webDomain)}`),
                                type: 'popup'
                            }).then((win) => {
                                userReject[String(win.id)] = reject
                                userApprove[String(win.id)] = resolve
                                rIdWin[String(win.id)] = String(message.resId)
                            })

                        })
                        sendResponse(
                            isTypedSigned ?
                                await signTypedData(signMsgData) :
                                await signMsg(signMsgData)
                        )
                    } catch (e) {
                        console.warn('Error: signTypedData', e)
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'User Rejected Signature'
                        })
                    }
                    try {
                        const settings = await getSettings()
                        if (settings.encryptAfterEveryTx) {
                            await clearPk()
                        }
                    } catch {
                        // ignore
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
                    sendResponse("MetaMask/v12.3.0")
                    break
                }
                case 'wallet_getPermissions':
                case 'wallet_requestPermissions': {
                    const account = await getSelectedAccount()
                    const address = account?.address ? [account?.address] : []
                    sendResponse([{
                        id: smallRandomString(21),
                        parentCapability: 'eth_accounts',
                        invoker: message?.website?.split('/').slice(0, 3).join('/') ?? '',
                        caveats: [{
                            type: 'restrictReturnedAccounts',
                            value: address
                        }],
                        date: Date.now(),
                    }])
                    break
                }
                case 'wallet_revokePermissions': {
                    sendResponse(null)
                    break
                }
                case 'wallet_registerOnboarding': {
                    sendResponse(true)
                    break
                }
                case 'eth_syncing': {
                    sendResponse(false)
                    break
                }
                case 'wallet_switchEthereumChain': {
                    try {
                        const currentChainId = `0x${((await getSelectedNetwork())?.chainId ?? 0).toString(16)}`
                        if (currentChainId === String(message?.params?.[0]?.chainId ?? '')) {
                            sendResponse(null)
                        } else {

                            let webDomain = ''
                            try {
                                const url = new URL(message?.website ?? '')
                                webDomain = url.hostname
                            } catch {
                                webDomain = ''
                            }

                            await new Promise((resolve, reject) => {
                                chrome.windows.create({
                                    height: 450,
                                    width: 400,
                                    url: chrome.runtime.getURL(`index.html?route=switch-network&param=${String(message?.params?.[0]?.chainId ?? '')}&rid=${String(message?.resId ?? '')}&website=${strToHex(webDomain)}`),
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
                    const networks = { ...allTemplateNets, ...userNetworks }
                    const chainId = Number(message?.params?.[0]?.chainId ?? '0')
                    if (!chainId) {
                        sendResponse({
                            error: true,
                            code: rpcError.USER_REJECTED,
                            message: 'Invalid Network'
                        })
                    }
                    if (chainId in networks) {
                        mainListner({
                            ...message, method: 'wallet_switchEthereumChain', params: [{
                                chainId: `0x${(chainId).toString(16)}`
                            }]
                        }, sender, sendResponse)
                    } else {
                        if (!message?.params?.[0]?.chainId ||
                            !message?.params?.[0]?.chainName ||
                            !message?.params?.[0]?.rpcUrls ||
                            !message?.params?.[0]?.blockExplorerUrls ||
                            !message?.params?.[0]?.nativeCurrency?.symbol
                        ) {
                            sendResponse({
                                error: true,
                                code: rpcError.USER_REJECTED,
                                message: 'Invalid Network params chainId, chainName, rpcUrls, blockExplorerUrls, and nativeCurrency are required'
                            })
                        } else {
                            try {
                                await new Promise((resolve, reject) => {
                                    chrome.windows.create({
                                        height: 450,
                                        width: 400,
                                        url: chrome.runtime.getURL(`index.html?route=request-network&param=${strToHex(JSON.stringify({ ...{ website: message?.website ?? '' }, ...(message?.params?.[0] ?? {}) }) ?? '')}&rid=${String(message?.resId ?? '')}`),
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
                    const pNetwork = getSelectedNetwork()
                    const pAccount = getSelectedAccount()
                    const [network, account] = await Promise.all([pNetwork, pAccount])
                    const address = account?.address ? [account?.address] : []
                    const chainId = `0x${(network?.chainId ?? 0).toString(16)}`
                    const data = {
                        type: "CLWALLET_PAGE_LISTENER", data: {
                            listner: 'connect',
                            data: {
                                chainId
                            },
                            address
                        }
                    };
                    sendResponse(data)
                    break
                }
                case 'wallet_approve': {
                    if (String(sender.tab?.windowId) in rIdWin) {
                        userApprove[String(sender.tab?.windowId)]?.(true)
                    }
                    try {
                        chrome.windows.remove(sender.tab?.windowId ?? 0)
                    } catch (e) {
                        console.info(e)
                        // ignore
                    }
                    break
                }
                case 'wallet_send_data': {
                    if (String(sender.tab?.windowId) in rIdData) {
                        const intData = rIdData[String(sender?.tab?.windowId ?? '')] ?? {}
                        rIdData[String(sender?.tab?.windowId ?? '')] = { ...intData, ...(message?.data ?? {}) }
                        sendResponse(true)
                    }
                    break
                }
                case 'wallet_get_data': {
                    if (String(sender.tab?.windowId) in rIdData) {
                        sendResponse(rIdData[String(sender?.tab?.windowId ?? '')] ?? {})
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
                        message: 'ClearWallet: Invalid request method ' + (message?.method ?? '')
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
