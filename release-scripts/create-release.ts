import fs from 'fs'
import { spawn } from 'node:child_process'

async function readFirst2000Characters(filePath: string): Promise<string> {

  try {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let data = '';

    for await (const chunk of fileStream) {
      data += chunk;
      if (data.length >= 2000) {
        break;
      }
    }

    return data.substring(0, 2000); 
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    throw err;
  }
}

function limitedSplit(str: string, delimiter: string, limit: number): string[] {
  if (limit <= 0) {
    throw new Error("Limit must be greater than 0");
  }
  const result: string[] = [];
  let remaining: string = str;
  for (let i = 0; i < limit; i++) {
    const index = remaining.indexOf(delimiter);
    if (index === -1) {
      break;
    }
    result.push(remaining.substring(0, index));
    remaining = remaining.substring(index + delimiter.length);
  }
  return result;
}

export const getLastChangeLog = async () => {
  const mainChainLogPath = 'CHANGELOG.md';

  if (!fs.existsSync(mainChainLogPath)) {
    return '';
  }
  const mainChainLog = await readFirst2000Characters(mainChainLogPath)
  const manifestVersions = limitedSplit(mainChainLog, '##', 2)[1]
  const changesText = '##' + manifestVersions
  return changesText
}


 
async function ghRelease (isRebuild: boolean, forFireFox: boolean = false) {

  if (!fs.existsSync('releases')) {
    fs.mkdirSync('releases');
  }

  if (forFireFox) {
    
    fs.writeFileSync('dist/manifest.json', fs.readFileSync('dist/firefox-manifest.json').toString())

    if (!fs.existsSync('releases/firefox')) {
      fs.mkdirSync('releases/firefox');
    }

  } else {
    
    fs.writeFileSync('dist/manifest.json', fs.readFileSync('dist/chromium-manifest.json').toString())

  }
  
  const pkg = JSON.parse(fs.readFileSync('package.json').toString());

  const ZipArchive = (await import('archiver')).ZipArchive 
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const dirPipes = ['dist'];

  const filePipes = ['LICENSE', 'README.md', 'PRIVACY_POLICY.md'];
  const outputPath = `releases/${forFireFox ? 'firefox/' : ''}${pkg.version}.zip`;
  const outputZip = fs.createWriteStream(outputPath);

  await new Promise((resolve, reject) => {
    let arch = archive;
    dirPipes.forEach((dir) => {
      arch = arch.directory(dir, false);
    });
    filePipes.forEach((file) => {
      arch = arch.file(file, { name: file });
    });
    arch.on('error', (err: unknown) => reject(err)).pipe(outputZip);

    outputZip.on('close', () => resolve(true));
    arch.finalize();
  });

  if (!isRebuild) {
    const changeLogPath = `releases/${pkg.version}.changelog.md`;
    const releaseCreationDate = new Date().toISOString();

    fs.writeFileSync(
      changeLogPath,
      `# Latest changes - (${releaseCreationDate})\n\n
  ${await getLastChangeLog()}`,
    );
     console.log(
      await new Promise((resolve) => {
        const p = spawn('gh', ['release', 'create', `v${pkg.version}`, `./${outputPath}`, '-F', `./${changeLogPath}`, '--target', 'main'], {
          shell: true,
        });
        let result = '';
        p.stdout.on('data', (data) => (result += data.toString()));
        p.stderr.on('data', (data) => (result += data.toString()));
        p.on('close', () => {
          resolve(result);
        });
      }),
    );
  }
}

const main = async () => {

  const isRebuild = process.argv[2] === 'rebuild';

  await ghRelease(isRebuild);
  await ghRelease(true, true);
  console.log('Release created');
}

await main();
