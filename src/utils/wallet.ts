import { getSelectedAccount, getSelectedNetwork } from '@/utils/platform';
import { BigNumber, ethers } from "ethers"

export const signMsg = async (msg: string) => {
    const account = await getSelectedAccount()
    const wallet = new ethers.Wallet(account.pk)
    return await wallet.signMessage( msg.startsWith('0x') ? ethers.utils.arrayify(msg): msg)
}

export const getBalance = async () =>{
    const account = await getSelectedAccount()
    const network = await getSelectedNetwork()
    const wallet = new ethers.Wallet(account.pk, new ethers.providers.JsonRpcProvider(network.rpc))
    return await wallet.getBalance()    
}

export const getGasPrice = async () => {
    const network = await getSelectedNetwork()
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    return await provider.getGasPrice()
}

export const getBlockNumber = async () => {
    const network = await getSelectedNetwork()
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    return await provider.getBlockNumber()
}

export const getBlockByNumber = async (blockNum: number) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    return await provider.getBlock(blockNum)
}

export const estimateGas = async ({to = '', from = '', data = '', value = '0x0' }: {to: string, from: string, data: string, value: string}) => {
    const network = await getSelectedNetwork()
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    return await provider.estimateGas({to, from, data, value})
}

export const sendTransaction = async ({ data= '', gas='0x0', to='', from='', value='0x0', gasPrice='0x0'}: 
{to: string, from: string, data: string, value: string, gas: string, gasPrice: string}, 
gasEstimate: Promise<BigNumber> | null = null, pGasPrice : Promise<BigNumber> | null) => {
    const account = await getSelectedAccount()
    const network = await getSelectedNetwork()
    const wallet = new ethers.Wallet(account.pk, new ethers.providers.JsonRpcProvider(network.rpc))
    if(gas === '0x0') {
       if(!gasEstimate){
        throw new Error('No gas estimate available')
       }else {
        gas = (await gasEstimate).toString()
       }
    }

    if(gasPrice === '0x0') {
        if(!pGasPrice){
         throw new Error('No gas estimate available')
        }else {
        gasPrice = (await pGasPrice).toString()
        }
     }
    return await wallet.sendTransaction({to, from, data, value, gasLimit: gas, gasPrice})
}

export const formatBalance = (balance: string) => {
    Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 6
      }).format(Number(ethers.utils.parseEther(balance)))
}
