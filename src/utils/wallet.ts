import { getSelectedAccount, getSelectedNetwork, numToHexStr } from '@/utils/platform';
import { ethers } from "ethers"
import { mainNets } from '@/utils/networks';

const FAIL_PERFORMANCE_ERROR = 600000
const FAIL_PERFORMANCE_NO_NETOWRK = -1

let provider: ethers.JsonRpcProvider | null = null

const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => e > m ? e : m, BigInt(0))

export const getCurrentProvider = async () => {
    const network = await getSelectedNetwork()
    if (provider) {
        // check if the network has changed
        if (provider._getConnection().url !== network.rpc) {
            provider = new ethers.JsonRpcProvider(network.rpc, ethers.Network.from(network.chainId), { staticNetwork: true, batchMaxCount: 6, polling: false })
        }
        return {provider, network}
    }
    provider = new ethers.JsonRpcProvider(network.rpc, ethers.Network.from(network.chainId), { staticNetwork: true, batchMaxCount: 6, polling: false })
    return {provider, network}
}

export const getOptimismProvider = async () => {
    const network = mainNets[10]
    return new ethers.JsonRpcProvider(network.rpc, ethers.Network.from(network.chainId), { staticNetwork: true, batchMaxCount: 6, polling: false })
}

const convertReceipt = (receipt: ethers.TransactionReceipt | null) => {
    if(!receipt) return null
    const newReceipt = {...receipt} as any
    newReceipt.transactionHash = newReceipt.hash
    newReceipt.blockNumber = numToHexStr(newReceipt.blockNumber)
    newReceipt.index = numToHexStr(newReceipt.index)
    newReceipt.transactionIndex = newReceipt.index
    newReceipt.cumulativeGasUsed = numToHexStr(newReceipt.cumulativeGasUsed)
    newReceipt.gasUsed = numToHexStr(newReceipt.gasUsed)
    newReceipt.gasPrice = numToHexStr(newReceipt.gasPrice)
    newReceipt.type = "0x2"
    newReceipt.status = numToHexStr(newReceipt.status)
    newReceipt.logs = receipt?.logs?.map((log: any) => {
        return {
            ...log,
            blockNumber: numToHexStr(log.blockNumber),
            logIndex: numToHexStr(log.index),
            transactionIndex: numToHexStr(log.transactionIndex),
            removed: false
        }
    })
    return newReceipt
}


export const signMsg = async (msg: string) => {
    const account = await getSelectedAccount()
    const wallet = new ethers.Wallet(account.pk)
    return await wallet.signMessage( msg.startsWith('0x') ? ethers.getBytes(msg): msg)
}

export const signTypedData = async (msg: string) => {
    const account = await getSelectedAccount()
    const wallet = new ethers.Wallet(account.pk)
    const parsedMsg = JSON.parse(msg)
    const types = {} as Record<string, any>
    for (const key in parsedMsg.types) {
        if (key !== 'EIP712Domain') {
            types[key] = parsedMsg.types[key]
        }
    }
    parsedMsg.types = types
    const args = [parsedMsg.domain, parsedMsg.types, parsedMsg.message]
    return await wallet.signTypedData(args[0], args[1], args[2])
}

export const getBalance = async () =>{
    const account = await getSelectedAccount()
    const { provider } = await getCurrentProvider()
    return await provider.getBalance(account.address)    
}

export const getGasPrice = async () => {
    const { provider } = await getCurrentProvider()
    const feed = await provider.getFeeData()
    const gasPrices = [ feed.gasPrice, feed.maxFeePerGas, feed.maxPriorityFeePerGas ].filter(Boolean).map((p: any) => BigInt(p))
    const gasPriceFeed = bigIntMax(...gasPrices)
    const gasPrice = gasPriceFeed + (gasPriceFeed / BigInt(25))
    return {
        price: Number(gasPrice) / 1e9,
        feed
    }
}

export const getBlockNumber = async () => {
    const { provider } = await getCurrentProvider()
    return await provider.getBlockNumber()
}

export const getRpcPerformance = async (highTimeout = false): Promise<{performance: number}> => {
    const network = await getSelectedNetwork()
    if(!(network?.chainId > 0)) {
        return {
            performance: FAIL_PERFORMANCE_NO_NETOWRK
        }
    }
    const time = performance.now()
    const timeoutTime = highTimeout ? 8000 : 1400
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(timeoutTime)
        }, timeoutTime)
    }) as Promise<number>
    const performancePromise = new Promise((resolve) => {
        getBlockNumber().then(() => {
            resolve(performance.now() - time)
        }).catch(() => {
            resolve(FAIL_PERFORMANCE_ERROR)
        })
    }) as Promise<number>
    return {
        performance: await Promise.race([performancePromise, timeoutPromise])
    }
}

export const getBlockByNumber = async (blockNum: number) => {
    const { provider } = await getCurrentProvider()
    return await provider.getBlock(blockNum)
}

export const estimateGas = async ({to = '', from = '', data = '', value = '0x0' }: {to: string, from: string, data: string, value: string}) => {
    const { provider } = await getCurrentProvider()
    return await provider.estimateGas({to, from, data, value})
}

export const evmCall = async (params: any[]) => {
    const tx = {} as {to: string, from: string, data: string, value: string, blockTag: string}
    const param1 = params[0] as any
    if(param1.to) tx.to = param1.to
    if(param1.from) tx.from = param1.from
    if(param1.data) tx.data = param1.data
    if(param1.value) tx.value = param1.value
    const param2 = params[1] as string
    if (param2.startsWith('0x')) {
        tx.blockTag = param2
    } else {
        tx.blockTag = 'latest'
    }
 
    const { provider } = await getCurrentProvider()
    const result = await provider.call(tx)
    return result
}

export const getTxByHash = async (hash: string) => {
    const { provider } = await getCurrentProvider()
    return await provider.getTransaction(hash)
}

export const getTxReceipt = async (hash: string) => {
    try {
    if (!hash) return null
    const { provider } = await getCurrentProvider()
    const receipt = await provider.getTransactionReceipt(hash)

    return convertReceipt(receipt)
    } catch (e) {
        console.error(e)
        return null
    }
}

export const getCode = async (addr: string) => {
    const { provider } = await getCurrentProvider()
    return await provider.getCode(addr)
}

export const getFromMnemonic = (mnemonic: string, index: number) => {
    const path = `m/44'/60'/0'/0/${index}`
    const mnemonicInst = ethers.Mnemonic.fromPhrase(mnemonic)
    const wallet =  ethers.HDNodeWallet.fromMnemonic(mnemonicInst, path)
    return wallet.privateKey
}

export const getTxCount = async (addr: string, block: null | string = null) => {
    const { provider } = await getCurrentProvider()
    if(block){
        return await provider.getTransactionCount(addr, block)
    } else {
        return await provider.getTransactionCount(addr)
    }
}

export const getRandomPk = () => {
    return ethers.Wallet.createRandom().privateKey
}

export const sendTransaction = async ({ data= '', gas='0x0', to='', from='', value='', gasPrice='0x0', supportsEIP1559=true}: 
{to: string, from: string, data: string, value: string, gas: string, gasPrice: string, supportsEIP1559: boolean}) => {
    const account = await getSelectedAccount()
    const { provider } = await getCurrentProvider()
    const wallet = new ethers.Wallet(account.pk, provider)
    const gasPriceInt = BigInt(gasPrice)
    const gasInt = BigInt(gas)

     if(gas === '0x0' || gasPrice === '0x0') {
        throw new Error('No gas estimate available')
     }
    return supportsEIP1559 ? await wallet.sendTransaction({
        to,
        from,
        data: data ? data : null, 
        value: value ? value : null,
        gasLimit: gasInt,
        gasPrice: null,
        maxFeePerGas: gasPriceInt,
    }) :
    await wallet.sendTransaction({
        to,
        from,
        data: data ? data : null, 
        value: value ? value : null,
        gasLimit: gasInt,
        gasPrice: gasPriceInt
    })
}

export const formatNumber = (num: number, digits = 0) => {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: digits
    }).format(num)
  }
  

export const getSelectedAddress = async () => {
    // give only the selected address for better privacy
    const account = await getSelectedAccount()
    const address = account?.address ? [account?.address] : []
    return address
}