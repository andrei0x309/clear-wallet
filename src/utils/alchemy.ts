import type { AlchemyAssetChange } from "@/extension/types"

const supportedAlchemyChains = {
    8453: 'base-mainnet',
    42161: 'arb-mainnet',
    137: 'polygon-mainnet',
    10: 'optimism-mainnet',
    1: 'eth-mainnet',
    360: 'shape-mainnet',
} as Record<number, string>;

export const getAlchemyEndpointFromChainId = (chainId: number, apiKey: string) => {
    const network = supportedAlchemyChains[chainId];
    if (!network) {
        return '';
    }
    const alchemyEndpoint = `https://${network}.g.alchemy.com/v2/${apiKey}`;
    return alchemyEndpoint;
};

export const simulateTx = async (endpoint: string, txData: any) => {
    try {
        if (!endpoint) {
            return;
        }

        const data = {
            "jsonrpc": "2.0",
            "method": "alchemy_simulateAssetChanges",
            "id": 1,
            "params": [ txData ]
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error('Error simulating transaction:', response.status, response.statusText);
            return null;
        }

        const result = await response.json();
        return (result?.result?.changes || []) as AlchemyAssetChange[];
    } catch (error) {
        console.error('Error simulating transaction:', error);
        return null;
    }


};