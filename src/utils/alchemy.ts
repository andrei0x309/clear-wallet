import type { AlchemyAssetChange } from "@/extension/types"

const supportedAlchemyChains = {
    8453: 'base-mainnet',
    42161: 'arb-mainnet',
    137: 'polygon-mainnet',
    10: 'optimism-mainnet',
    1: 'eth-mainnet',
    360: 'shape-mainnet',
} as Record<number, string>;

const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const transferSingleTopic = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
const transferBatchTopic = '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb';
const nativeTransferAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

type JsonRpcResponse<T> = {
    result?: T;
    error?: {
        code?: number;
        message?: string;
    };
};

type SimulationLog = {
    address?: string;
    topics?: string[];
    data?: string;
};

type TokenMetadata = {
    name?: string | null;
    symbol?: string | null;
    decimals?: number | null;
    logo?: string | null;
};

type ParsedTransfer = {
    address: string;
    assetType: AlchemyAssetChange['assetType'];
    from: string;
    to: string;
    amount: string;
    decimals: number;
};

export const getAlchemyEndpointFromChainId = (chainId: number, apiKey: string) => {
    const network = supportedAlchemyChains[chainId];
    if (!network) {
        return '';
    }
    const alchemyEndpoint = `https://${network}.g.alchemy.com/v2/${apiKey}`;
    return alchemyEndpoint;
};

const formatUnits = (value: string, decimals: number) => {
    const amount = BigInt(value);
    if (decimals === 0) {
        return amount.toString();
    }

    const base = 10n ** BigInt(decimals);
    const whole = amount / base;
    const fraction = (amount % base).toString().padStart(decimals, '0').replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole.toString();
};

const getAddressFromTopic = (topic: string) => `0x${topic.slice(-40)}`;

const parseTransferLog = (log: SimulationLog): ParsedTransfer[] => {
    const topics = log.topics ?? [];
    const address = log.address?.toLowerCase();
    const eventTopic = topics[0]?.toLowerCase();
    if (!address || !log.data || !topics[1] || !/^0x[0-9a-f]*$/i.test(log.data)) {
        return [];
    }

    if (eventTopic === transferTopic && topics.length === 3) {
        if (!/^0x[0-9a-f]+$/i.test(log.data)) {
            return [];
        }
        const from = getAddressFromTopic(topics[1]);
        const to = getAddressFromTopic(topics[2]);
        const isNative = address === nativeTransferAddress;
        return [{
            address,
            assetType: isNative ? 'NATIVE' : 'ERC20',
            from,
            to,
            amount: BigInt(log.data).toString(),
            decimals: isNative ? 18 : -1,
        }];
    }

    if (eventTopic === transferTopic && topics.length === 4) {
        if (!/^0x[0-9a-f]{64}$/i.test(topics[3])) {
            return [];
        }
        return [{
            address,
            assetType: 'ERC721',
            from: getAddressFromTopic(topics[1]),
            to: getAddressFromTopic(topics[2]),
            amount: '1',
            decimals: 0,
        }];
    }

    if (eventTopic === transferSingleTopic && topics.length === 4) {
        const words = log.data.slice(2).match(/.{64}/g) ?? [];
        if (!/^0x[0-9a-f]{128}$/i.test(log.data) || words.length !== 2) {
            return [];
        }
        return [{
            address,
            assetType: 'ERC1155',
            from: getAddressFromTopic(topics[2]),
            to: getAddressFromTopic(topics[3]),
            amount: BigInt(`0x${words[1]}`).toString(),
            decimals: 0,
        }];
    }

    if (eventTopic === transferBatchTopic && topics.length === 4) {
        const data = log.data.slice(2);
        const readWord = (byteOffset: bigint) => {
            if (byteOffset < 0n || byteOffset > BigInt(data.length / 2)) {
                return null;
            }
            const start = Number(byteOffset) * 2;
            const word = data.slice(start, start + 64);
            return /^[0-9a-f]{64}$/i.test(word) ? BigInt(`0x${word}`) : null;
        };
        const idsOffset = readWord(0n);
        const valuesOffset = readWord(32n);
        if (idsOffset === null || valuesOffset === null) {
            return [];
        }
        const idsLength = readWord(idsOffset);
        const valuesLength = readWord(valuesOffset);
        if (
            idsLength === null
            || valuesLength === null
            || idsLength !== valuesLength
            || valuesLength > BigInt(data.length / 64)
        ) {
            return [];
        }

        const transfers: ParsedTransfer[] = [];
        for (let index = 0n; index < idsLength; index++) {
            const amount = readWord(valuesOffset + 32n + index * 32n);
            if (amount === null) {
                return [];
            }
            transfers.push({
                address,
                assetType: 'ERC1155',
                from: getAddressFromTopic(topics[2]),
                to: getAddressFromTopic(topics[3]),
                amount: amount.toString(),
                decimals: 0,
            });
        }
        return transfers;
    }

    return [];
};

const requestAlchemy = async <T>(endpoint: string, method: string, params: unknown[]) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            id: 1,
            params,
        }),
    });

    if (!response.ok) {
        console.error(`Error calling ${method}:`, response.status, response.statusText, await response.text());
        return null;
    }

    const payload = await response.json() as JsonRpcResponse<T>;
    if (payload.error) {
        console.error(`Error calling ${method}:`, payload.error);
        return null;
    }
    return payload.result ?? null;
};

export const simulateTx = async (endpoint: string, txData: Record<string, unknown>, nativeSymbol = 'ETH') => {
    try {
        if (!endpoint) {
            return null;
        }

        const call: Record<string, string> = {};
        for (const field of ['from', 'to', 'gas', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas', 'value'] as const) {
            const value = txData[field];
            if (typeof value === 'string') {
                call[field] = value;
            }
        }
        const data = txData.data ?? txData.input;
        if (typeof data === 'string') {
            call.data = data;
        }

        const simulation = await requestAlchemy<Array<{ calls?: Array<{ status?: string; logs?: SimulationLog[] }> }>>(
            endpoint,
            'eth_simulateV1',
            [{
                blockStateCalls: [{ calls: [call] }],
                validation: true,
                traceTransfers: true,
            }, 'latest'],
        );
        if (!simulation?.[0]?.calls) {
            console.error('Error simulating transaction: invalid simulation response');
            return null;
        }

        const transfers = simulation[0].calls
            .filter((result) => !result.status || !/^0x0+$/i.test(result.status))
            .flatMap((result) => (result.logs ?? []).flatMap(parseTransferLog));
        const tokenAddresses = Array.from(new Set(
            transfers
                .filter((transfer) => transfer.assetType === 'ERC20')
                .map((transfer) => transfer.address),
        ));
        const metadataEntries = await Promise.all(tokenAddresses.map(async (address) => {
            const metadata = await requestAlchemy<TokenMetadata>(endpoint, 'alchemy_getTokenMetadata', [address]);
            return [address, metadata] as const;
        }));
        const metadataByAddress = new Map(metadataEntries);
        const sender = typeof txData.from === 'string' ? txData.from.toLowerCase() : '';

        return transfers.map((transfer): AlchemyAssetChange => {
            const metadata = metadataByAddress.get(transfer.address);
            const metadataDecimals = metadata?.decimals;
            const hasMetadataDecimals = typeof metadataDecimals === 'number'
                && Number.isInteger(metadataDecimals)
                && metadataDecimals >= 0
                && metadataDecimals <= 255;
            const decimals = transfer.decimals >= 0
                ? transfer.decimals
                : hasMetadataDecimals
                    ? metadataDecimals
                    : 0;
            const amount = formatUnits(transfer.amount, decimals);
            return {
                assetType: transfer.assetType,
                changeType: transfer.from.toLowerCase() === sender
                    ? 'OUT'
                    : transfer.to.toLowerCase() === sender
                        ? 'IN'
                        : 'TRANSFER',
                from: transfer.from,
                to: transfer.to,
                amount,
                name: metadata?.name || (transfer.assetType === 'NATIVE' ? nativeSymbol : transfer.address),
                logo: metadata?.logo || '',
                symbol: transfer.assetType === 'NATIVE'
                    ? nativeSymbol
                    : transfer.assetType === 'ERC20'
                        ? hasMetadataDecimals ? metadata?.symbol || '' : 'base units'
                        : metadata?.symbol || 'items',
            };
        });
    } catch (error) {
        console.error('Error simulating transaction:', error);
        return null;
    }
};
