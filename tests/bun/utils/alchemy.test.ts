import { afterEach, expect, test } from "bun:test"
import { simulateTx } from "@/utils/alchemy"

const endpoint = "https://eth-mainnet.g.alchemy.com/v2/test"
const sender = "0x0000000000000000000000000000000000000001"
const recipient = "0x0000000000000000000000000000000000000002"
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
})

test("simulates a transaction and maps native and ERC-20 transfer logs", async () => {
    const calls: Array<{ jsonrpc: string; method: string; id: number; params: unknown[] }> = []
    globalThis.fetch = (async (_input, init) => {
        const request = JSON.parse(String(init?.body)) as {
            jsonrpc: string;
            method: string;
            id: number;
            params: unknown[];
        }
        calls.push(request)

        const result = request.method === "eth_simulateV1"
            ? [{
                calls: [{
                    status: "0x1",
                    logs: [
                        {
                            address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                            topics: [
                                transferTopic,
                                `0x${sender.slice(2).padStart(64, "0")}`,
                                `0x${recipient.slice(2).padStart(64, "0")}`,
                            ],
                            data: "0x0de0b6b3a7640000",
                        },
                        {
                            address: "0x1111111111111111111111111111111111111111",
                            topics: [
                                transferTopic,
                                `0x${sender.slice(2).padStart(64, "0")}`,
                                `0x${recipient.slice(2).padStart(64, "0")}`,
                            ],
                            data: "0x0f4240",
                        },
                    ],
                }],
            }]
            : {
                name: "USD Coin",
                symbol: "USDC",
                decimals: 6,
                logo: "https://example.com/usdc.png",
            }

        return new Response(JSON.stringify({ result }), { status: 200 })
    }) as typeof fetch

    const changes = await simulateTx(endpoint, {
        from: sender,
        to: recipient,
        value: "0x1",
        chainId: "0x1",
    })

    expect(calls[0].method).toBe("eth_simulateV1")
    expect(calls[0].params[0]).toMatchObject({
        blockStateCalls: [{ calls: [{ from: sender, to: recipient, value: "0x1" }] }],
        validation: true,
        traceTransfers: true,
    })
    expect(calls[0].params[1]).toBe("latest")
    expect(calls[1]).toEqual({
        jsonrpc: "2.0",
        method: "alchemy_getTokenMetadata",
        id: 1,
        params: ["0x1111111111111111111111111111111111111111"],
    })
    expect(changes).toEqual([
        {
            assetType: "NATIVE",
            changeType: "OUT",
            from: sender,
            to: recipient,
            amount: "1",
            name: "ETH",
            logo: "",
            symbol: "ETH",
        },
        {
            assetType: "ERC20",
            changeType: "OUT",
            from: sender,
            to: recipient,
            amount: "1",
            name: "USD Coin",
            logo: "https://example.com/usdc.png",
            symbol: "USDC",
        },
    ])
})
