import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { Wallet, verifyMessage } from "ethers"
import { compareVersions } from "@/utils/network-migrations"
import { base64ToBase64Url, cyrb64Hash, stringify } from "@/utils/misc"
import { chainIdToPriceId, mainNets } from "@/utils/networks"
import { addToHistory, getHistory, getNetworks, saveNetwork } from "@/utils/platform"
import { signMsg } from "@/utils/wallet"

const storageData = new Map<string, unknown>()
let originalChrome: PropertyDescriptor | undefined

const createChromeMock = () => {
    const area = {
        get: async (key: string) => ({ [key]: storageData.get(key) }),
        set: async (values: Record<string, unknown>) => {
            for (const [key, value] of Object.entries(values)) {
                storageData.set(key, value)
            }
        },
        clear: async () => storageData.clear(),
    }

    return { storage: { local: area, session: area } } as unknown as typeof chrome
}

beforeEach(() => {
    storageData.clear()
    originalChrome = Object.getOwnPropertyDescriptor(globalThis, "chrome")
    Object.defineProperty(globalThis, "chrome", {
        configurable: true,
        value: createChromeMock(),
    })
})

afterEach(() => {
    if (originalChrome) {
        Object.defineProperty(globalThis, "chrome", originalChrome)
    } else {
        Reflect.deleteProperty(globalThis, "chrome")
    }
})

describe("core utilities", () => {
    test("compares numeric versions including omitted trailing components", () => {
        expect(compareVersions("1.4.9", "1.4.10")).toBe(-1)
        expect(compareVersions("1.5", "1.5.0")).toBe(0)
        expect(compareVersions("2.0.0", "1.99.99")).toBe(1)
    })

    test("serializes circular references without throwing", () => {
        const value: { label: string; self?: unknown } = { label: "wallet" }
        value.self = value

        expect(JSON.parse(stringify(value))).toEqual({ label: "wallet", self: "[Circular]" })
    })

    test("creates deterministic seeded hashes", () => {
        expect(cyrb64Hash("clear-wallet", 42)).toBe(cyrb64Hash("clear-wallet", 42))
        expect(cyrb64Hash("clear-wallet", 42)).not.toBe(cyrb64Hash("clear-wallet", 43))
    })

    test("converts Base64 to URL-safe Base64 and removes padding", () => {
        expect(base64ToBase64Url("+/8=" )).toBe("-_8")
    })

    test("returns known token price ids and a fallback for unknown chains", () => {
        expect(chainIdToPriceId(1)).toBe("ethereum")
        expect(chainIdToPriceId(999999)).toBe("x")
        expect(mainNets[8453].chainId).toBe(8453)
    })
})

describe("extension-backed wallet behavior", () => {
    test("saves and retrieves a network by chain id", async () => {
        await saveNetwork(mainNets[8453])

        expect(await getNetworks()).toEqual({ 8453: mainNets[8453] })
    })

    test("keeps only the newest 100 history entries", async () => {
        storageData.set("history", Array.from({ length: 100 }, (_, index) => ({
            date: index,
            txHash: `0x${index}`,
        })))

        await addToHistory({ date: 100, txHash: "0xnewest" })
        const history = await getHistory()

        expect(history).toHaveLength(100)
        expect(history[0].txHash).toBe("0xnewest")
        expect(history[99].txHash).toBe("0x98")
    })

    test("signs a message with the selected account key", async () => {
        const wallet = new Wallet(`0x${"11".repeat(32)}`)
        storageData.set("selectedAccount", {
            address: wallet.address,
            pk: wallet.privateKey,
            encPk: "",
        })

        const signature = await signMsg("Clear Wallet test")

        expect(verifyMessage("Clear Wallet test", signature)).toBe(wallet.address)
    })

    test("signs hex-prefixed messages as bytes", async () => {
        const wallet = new Wallet(`0x${"22".repeat(32)}`)
        storageData.set("selectedAccount", {
            address: wallet.address,
            pk: wallet.privateKey,
            encPk: "",
        })

        const signature = await signMsg("0x1234")

        expect(verifyMessage(new Uint8Array([0x12, 0x34]), signature)).toBe(wallet.address)
    })
})
