
import type { Network } from '@/extension/types'

export const mainNets: {[key: number]: Network} = {
    1: {
        name: 'Ethereum Main',
        rpc: 'https://eth-mainnet.public.blastapi.io',
        chainId: 1,
        explorer: 'https://etherscan.io',
        icon: 'eth.webp',
        symbol: 'ETH',
        priceId: 'ethereum',
    },
    137: {
        name: 'Polygon Mainnet',
        rpc: 'https://polygon-rpc.com',
        chainId: 137,
        explorer: 'https://polygonscan.com',
        icon:'polygon.webp',
        symbol: 'MATIC',
        priceId: 'matic-network'
    },
    100: {
        name: 'Gnosis',
        rpc: 'https://rpc.gnosischain.com',
        chainId: 100,
        explorer: 'https://gnosisscan.io',
        icon:'xdai.webp',
        symbol: 'xDAI',
        priceId: 'xdai'
    },
    10: {
        name: 'Optimism',
        rpc: 'https://mainnet.optimism.io',
        chainId: 10,
        explorer: 'https://optimistic.etherscan.io',
        icon: 'optimism.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
    56: {
        name: 'BSC Main',
        rpc: 'https://bsc-dataseed2.binance.org',
        chainId: 56,
        explorer: 'https://bscscan.com',
        icon: 'binance.webp',
        symbol: 'BNB',
        priceId: 'binancecoin'
    },
    42161: {
        name: 'Arbitrum One',
        rpc: 'https://rpc.ankr.com/arbitrum',
        chainId: 42161,
        explorer: 'https://explorer.offchainlabs.com',
        icon: 'arbitrum.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
    8453: {
        name: 'Base Mainnet',
        rpc: 'https://base.publicnode.com',
        chainId: 8453,
        explorer: 'https://basescan.org',
        icon: 'base.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    }
}

export const testNets = {
    11155111: {
        name: 'TESTNET Ethereum Sepolia',
        rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
        chainId: 11155111,
        explorer: 'https://sepolia.etherscan.io',
        icon: 'eth_t.webp'
    },
    84532: {
        name: 'TESTNET Base Sepolia',
        rpc: 'https://sepolia.base.org',
        chainId: 84532,
        explorer: 'https://sepolia.basescan.org/',
        icon: 'base_t.webp'
    },
    80002: {
        name: 'TESTNET Polygon Amoy',
        rpc: 'https://rpc-amoy.polygon.technology',
        chainId: 80002,
        explorer: 'https://oklink.com/amoy',
        icon:'polygon_t.webp'
    },
    100200: {
        name: 'TESTNET Gnosis Chiado',
        rpc: 'https://rpc.chiadochain.net',
        chainId: 100200,
        explorer: 'https://gnosis-chiado.blockscout.com',
        icon:'xdai_t.webp'
    },
    420: {
        name: 'TESTNET Optimism Goreli',
        rpc: 'https://goerli.optimism.io/',
        chainId: 420,
        explorer: 'https://goerli.etherscan.io',
        icon: 'optimism_t.webp'
    },
    11155420 : {
        name: 'TESTNET Optimism Sepolia',
        rpc: 'https://sepolia.optimism.io',
        chainId: 11155420 ,
        explorer: 'https://sepolia-optimistic.etherscan.io/',
        icon: 'optimism_t.webp'
    },
    97: {
        name: 'TESTNET BSC',
        rpc: 'https://bsctestapi.terminet.io/rpc',
        chainId: 97,
        explorer: 'https://testnet.bscscan.com',
        icon: 'binance_t.webp'
    },
    421614: {
        name: 'TESTNET Arbitrum Sepolia',
        rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
        chainId: 421614,
        explorer: 'https://sepolia.arbiscan.io/',
        icon: 'arbitrum_t.webp'
    },
}

export const allTemplateNets = {...mainNets, ...testNets}

export const chainIdToPriceId = (chainId: number): string => {
    return mainNets?.[chainId]?.priceId ?? 'x'
}