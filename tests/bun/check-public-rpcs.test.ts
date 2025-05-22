import { getPerformanceForNets } from './utils/rpc'
import { expect, test } from "bun:test";
import {  mainNets, testNets } from "../../src/utils/networks"

let testOrSkip: typeof test | typeof test.skip;

const testEnabled = {
    "testPublicRPCsMain": true,
    "testPublicRPCsTest": false,
}



testOrSkip = testEnabled.testPublicRPCsMain ? test : test.skip;
testOrSkip("Test mainnet RPCs", async () => {
const perf = await getPerformanceForNets(mainNets);
console.info(`Performance:`, perf);

for (const net in perf) {
    const netPerformance = perf[net];
    if(netPerformance >= 2000) {
        console.error(`${net} is slow`);
    }
    expect(netPerformance).toBeLessThan(2000);
}

}, { timeout: 30000 });


testOrSkip = testEnabled.testPublicRPCsMain ? test : test.skip;
testOrSkip("Test testnet RPCs", async () => {
const perf = await getPerformanceForNets(testNets);
console.info(`Performance:`, perf);

for (const net in perf) {
    const netPerformance = perf[net];
    if(netPerformance >= 2000) {
        console.error(`${net} is slow`);
    }
    expect(netPerformance).toBeLessThan(2000);
}

}, { timeout: 30000 });