import { getSelectedAccount, getSelectedNetwork } from '@/utils/platform';
import { ethers} from "ethers"

export const signMsg = async (msg: string) => {
    const account = await getSelectedAccount()
    const wallet = new ethers.Wallet(account.pk)
    return await wallet.signMessage( msg.startsWith('0x') ? ethers.getBytes(msg): msg)
}

export const signTypedData = async (msg: string) => {
    const account = await getSelectedAccount()
    const wallet = new ethers.Wallet(account.pk)
    const parsedMsg = JSON.parse(msg)
    if(parsedMsg?.primaryType) {
        if(parsedMsg.primaryType in parsedMsg.types){
            parsedMsg.types = {
                [parsedMsg.primaryType]: parsedMsg.types[parsedMsg.primaryType]
            }
        }
    }

    return await wallet.signTypedData(parsedMsg.domain, parsedMsg.types, parsedMsg.message)
}

export const getBalance = async () =>{
    const account = await getSelectedAccount()
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.getBalance(account.address)    
}

export const getGasPrice = async () => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    const feed = await provider.getFeeData()
    const gasPrice = feed.maxFeePerGas ?? feed.gasPrice ?? 0n
    return Number(gasPrice) / 1e9
}

export const getBlockNumber = async () => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.getBlockNumber()
}

export const getBlockByNumber = async (blockNum: number) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.getBlock(blockNum)
}

export const estimateGas = async ({to = '', from = '', data = '', value = '0x0' }: {to: string, from: string, data: string, value: string}) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.estimateGas({to, from, data, value})
}

export const evmCall = async ({to = '', from = '', data = '', value = '0x0' }: {to: string, from: string, data: string, value: string}) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.call({to, from, data, value})
}

export const getTxByHash = async (hash: string) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.getTransaction(hash)
}

export const getTxReceipt = async (hash: string) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.getTransactionReceipt(hash)
}

export const getCode = async (addr: string) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    return await provider.getCode(addr)
}

export const getFromMnemonic = (mnemonic: string, index: number) => {
    const path = `m/44'/60'/0'/0/${index}`
    const mnemonicInst = ethers.Mnemonic.fromPhrase(mnemonic)
    const wallet =  ethers.HDNodeWallet.fromMnemonic(mnemonicInst, path)
    return wallet.privateKey
}

export const getTxCount = async (addr: string, block: null | string = null) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.JsonRpcProvider(network.rpc)
    if(block){
        return await provider.getTransactionCount(addr, block)
    } else {
        return await provider.getTransactionCount(addr)
    }
}

export const getRandomPk = () => {
    return ethers.Wallet.createRandom().privateKey
}

export const getCurrentProvider = async () => {
    const network = await getSelectedNetwork()
    return new ethers.JsonRpcProvider(network.rpc)
}

export const sendTransaction = async ({ data= '', gas='0x0', to='', from='', value='', gasPrice='0x0'}: 
{to: string, from: string, data: string, value: string, gas: string, gasPrice: string}) => {
    const account = await getSelectedAccount()
    const network = await getSelectedNetwork()
    const wallet = new ethers.Wallet(account.pk, new ethers.JsonRpcProvider(network.rpc))
    const gasPriceInt = BigInt(gasPrice)
    const gasInt = BigInt(gas)

     if(gas === '0x0' || gasPrice === '0x0') {
        throw new Error('No gas estimate available')
     }
    return await wallet.sendTransaction({
        to,
        from,
        data: data ? data : null, 
        value: value ? value : null,
        gasLimit: gasInt,
        gasPrice: null,
        maxFeePerGas: gasPriceInt,
    })
}

export const formatBalance = (balance: string) => {
    Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 6
      }).format(Number(ethers.parseEther(balance)))
}

export const getSelectedAddress = async () => {
    // give only the selected address for better privacy
    const account = await getSelectedAccount()
    const address = account?.address ? [account?.address] : []
    return address
}