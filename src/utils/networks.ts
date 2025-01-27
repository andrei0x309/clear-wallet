
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
        symbol: 'POL',
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
    30: {
        name: 'Rootstock',
        rpc: 'https://public-node.rsk.co',
        chainId: 30,
        explorer: 'https://explorer.rootstock.io',
        icon: 'rootstock.webp',
        symbol: 'RBTC',
        priceId: 'rootstock'
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
        rpc: 'https://bsc-dataseed1.binance.org',
        chainId: 56,
        explorer: 'https://bscscan.com',
        icon: 'binance.webp',
        symbol: 'BNB',
        priceId: 'binancecoin'
    },
    480: {
        name: 'World Chain',
        rpc: 'https://worldchain-mainnet.g.alchemy.com/public',
        chainId: 480,
        explorer: 'https://worldscan.org',
        icon: 'world.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
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
    },
    7560 : {
        name: 'Cyber',
        rpc: 'https://rpc.cyber.co',
        chainId: 7560,
        explorer: 'https://cyberscan.co',
        icon: 'cyber.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
    59144: {
        name: 'Linea',
        rpc: 'https://rpc.linea.build',
        chainId: 59144,
        explorer: 'https://lineascan.build',
        icon: 'linea.webp',
        symbol: 'ETH',
        priceId: 'ethereum'
    },
    666666666: {
        name: 'Degen',
        rpc: 'https://rpc.degen.tips',
        chainId: 666666666,
        explorer: 'https://explorer.degen.tips/',
        icon: 'degen.webp',
        symbol: 'DEGEN',
        priceId: 'degen'
    },
    42220: {
        name: 'Celo Mainenet',
        rpc: 'https://forno.celo.org',
        chainId: 42220,
        explorer: 'https://celoscan.io/',
        icon: 'celo.webp',
        symbol: 'CELO',
        priceId: 'celo'
    },
    534351: {
        name: 'Scroll',
        rpc: 'https://rpc.scroll.io/',
        chainId: 534351,
        explorer: 'https://scrollscan.com',
        icon: 'scroll.webp',
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
    31: {
        name: 'Rootstock Testnet',
        rpc: 'https://public-node.testnet.rsk.co',
        chainId: 31,
        explorer: 'https://explorer.testnet.rootstock.io',
        icon: 'rootstock_t.webp',
        symbol: 'tRBTC',
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
        rpc: 'https://bsc-testnet-rpc.publicnode.com',
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
    111557560 : {
        name: 'Cyber',
        rpc: 'https://rpc.testnet.cyber.co',
        chainId: 111557560 ,
        explorer: 'https://testnet.cyberscan.co/',
        icon: 'cyber_t.webp'
    },
    44787: {
        name: 'Celo TestNet',
        rpc: 'https://alfajores-forno.celo-testnet.org',
        chainId: 44787,
        explorer: 'https://alfajores.celoscan.io/',
        icon: 'celo_t.webp',
        symbol: 'CELO',
    },
    59141: {
        name: 'Linea Sepolia',
        rpc: 'https://rpc.sepolia.linea.build',
        chainId: 59141,
        explorer: 'https://sepolia.lineascan.build/',
        icon: 'linea_t.webp',
        symbol: 'ETH'
    },
    4801: {
        name: 'World Chain',
        rpc: 'https://worldchain-sepolia.g.alchemy.com/public',
        chainId: 4801,
        explorer: 'https://worldchain-sepolia.explorer.alchemy.com',
        icon: 'world_t.webp',
        symbol: 'ETH',
    },
    534351: {
        name: 'Scroll Sepolia',
        rpc: 'https://sepolia-rpc.scroll.io/',
        chainId: 534351,
        explorer: 'https://sepolia.scrollscan.com',
        icon: 'scroll_t.webp',
        symbol: 'ETH'
    }
}

export const allTemplateNets = {...mainNets, ...testNets}

export const chainIdToPriceId = (chainId: number): string => {
    return mainNets?.[chainId]?.priceId ?? 'x'
}