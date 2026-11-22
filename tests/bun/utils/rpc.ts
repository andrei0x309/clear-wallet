import type { Network } from "@/extension/types"
import { ethers } from "ethers"

const FAIL_PERFORMANCE_CONST = 600000

export const getNetworkProvider = async (network: Network) => {
    const provider = new ethers.JsonRpcProvider(network.rpc, ethers.Network.from(network.chainId), { staticNetwork: true, batchMaxCount: 6, polling: false })
    return {provider, network}
}

export const getBlockNumberForNetwork = async (provider: ethers.JsonRpcProvider) => {
    return await provider.getBlockNumber()
}

export const getRpcPerformanceForNetwork = async (
  provider: ethers.JsonRpcProvider
): Promise<{ performance: number }> => {
    try {
        const timeoutTime = 4000;
        
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve(timeoutTime);
            }, timeoutTime);
        }) as Promise<number>;

        const performancePromise = new Promise((resolve) => {
            setTimeout(async () => {
                const time = performance.now();
                try {
                    await getBlockNumberForNetwork(provider);
                    resolve(performance.now() - time);
                } catch {
                    resolve(FAIL_PERFORMANCE_CONST);
                }
            }, 50);
        }) as Promise<number>;

        return {
            performance: await Promise.race([performancePromise, timeoutPromise])
        };
    } catch (error) {
        console.log(`RPC FAILED: `, error);
        return {
            performance: FAIL_PERFORMANCE_CONST
        };
    }
}

export const getPerformanceForNets = async (nets: {
    [key: number]: Network;
}) => {

    const performance = {} as Record<string, number>;
   
    for (const net in nets) {
            const provider = await getNetworkProvider(nets[net]);
            performance[net] = (await getRpcPerformanceForNetwork(provider.provider)).performance;
    }

    return performance;
}
