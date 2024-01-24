
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
    5: {
        name: 'TESTNET Ethereum Goerli',
        rpc: 'https://rpc.ankr.com/eth_goerli',
        chainId: 5,
        explorer: 'https://goerli.etherscan.io',
        icon: 'eth.webp'
    },
    4: {
        name: 'TESTNET Ethereum Rinkeby',
        rpc: 'https://rpc.ankr.com/eth_rinkeby',
        chainId: 4,
        explorer: 'https://rinkeby.etherscan.io',
        icon: 'eth.webp'
    },
    80001: {
        name: 'TESTNET Polygon',
        rpc: 'https://rpc.ankr.com/polygon_mumbai',
        chainId: 80001,
        explorer: 'https://mumbai.polygonscan.com',
        icon:'polygon.webp'
    },
    100100: {
        name: 'TESTNET Gnosis Chiado',
        rpc: 'https://gnosis-mainnet.public.blastapi.io',
        chainId: 100100,
        explorer: '',
        icon:'xdai.webp'
    },
    420: {
        name: 'TESTNET Optimism Goreli',
        rpc: 'https://goerli.optimism.io/',
        chainId: 420,
        explorer: 'https://goerli.etherscan.io',
        icon: 'optimism.webp'
    },
    97: {
        name: 'TESTNET BSC',
        rpc: 'https://bsctestapi.terminet.io/rpc',
        chainId: 97,
        explorer: 'https://testnet.bscscan.com',
        icon: 'binance.webp'
    },
    421613: {
        name: 'TESTNET Arbitrum One',
        rpc: 'https://goerli-rollup.arbitrum.io/rpc/',
        chainId: 421613,
        explorer: 'https://testnet.arbiscan.io',
        icon: 'arbitrum.webp'
    },
}

export const chainIdToPriceId = (chainId: number): string => {
    return mainNets?.[chainId]?.priceId ?? 'x'
}