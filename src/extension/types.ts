export interface Network {
    name: string
    chainId: number
    rpc: string
    symbol?: string
    icon?: string
    priceId?: string
    explorer?: string
}

export interface Account {
    name: string
    address: string
    pk: string
    encPk: string
}

export interface Accounts {
    [key: string]: Account
}

export interface Networks {
    [key: number]: Network
}

export interface RequestArguments {
    method: string;
    params?: any[];
    resId?: string
}

export interface ProviderRpcError extends Error {
    message: string;
    code: number;
    data?: unknown;
  }
  
export interface Price {
    [key: string]: number
}

export interface Prices {
    [key: string]: Price
}

export interface Settings {
    enableStorageEnctyption: boolean
    encryptAfterEveryTx: boolean
    lockOutPeriod: number
    lockOutEnabled: boolean
    theme: 'system' | 'light' | 'dark'
    lastLock: number
    lockOutBlocked: boolean
}