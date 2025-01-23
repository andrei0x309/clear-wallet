import { expect, test } from "bun:test";
import { getLastChangeLog } from '../create-release';


let testOrSkip: typeof test | typeof test.skip;

const testEnabled = {
    "getLastLog": true,
}

testOrSkip = testEnabled.getLastLog ? test : test.skip;

testOrSkip("getLastChangeLog", async () => {
    const lastChangeLog = await getLastChangeLog();
    expect(lastChangeLog.length).toBeGreaterThan(0);
});