
import { getNetworks, replaceNetworks, getVersion, type getSettings, setSettings } from "./platform";
import { allTemplateNets } from "./networks";

export function compareVersions(version1: string, version2: string) {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);
  
    const maxLength = Math.max(parts1.length, parts2.length);
  
    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0; // Use 0 if a component is missing (e.g., comparing "1.2" with "1.2.3")
      const part2 = parts2[i] || 0;
  
      if (part1 > part2) {
        return 1;
      }
      if (part1 < part2) {
        return -1;
      }
    }
  
    return 0;
  }

  const migrations = {} as { [key: string]: () => void };

  migrations["1.4.20"] = async () => {
    const networks = await getNetworks();
    // Delete 420 network as it's deprecated
    if(networks[420]) {
        delete networks[420];
    }
    // Replace arbitrum RPC as it's not working
    if(networks[42161]) {
        const badRpc = 'https://rpc.ankr.com/arbitrum';
        const goodRpc = allTemplateNets?.[42161]?.rpc;
        if(networks[42161].rpc === badRpc && goodRpc) {
           networks[42161].rpc = goodRpc;
        }
    }
    replaceNetworks(networks);
  }

  const runAllMigratons = async () => {
    for(const migration in migrations) {
        await migrations[migration]();
    }
  }

  const runMigrationsFrom = async ({from}: {from: string}) => {
    const migrationsToRun = Object.keys(migrations).filter(migration => {
        return compareVersions(from, migration) < 0;
    });
    for(const migration of migrationsToRun) {
        await migrations[migration]();
    }
  }

  export const runMigrations = async (settings: Awaited<ReturnType<typeof getSettings>>) => {
    const version = await getVersion();
    const lastMig = settings.lastExecutedMigration;
    if(!lastMig) {
        await runAllMigratons();
        settings.lastExecutedMigration = version;
        await setSettings(settings);
        return;
    }
    if(compareVersions(lastMig, version) >= 0) {
        return;
    }
    await runMigrationsFrom({
        from: version
    });
    settings.lastExecutedMigration = version;
    await setSettings(settings);
  }