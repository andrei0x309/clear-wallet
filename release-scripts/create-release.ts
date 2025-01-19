const pFs = import('fs')
const pCps = import('child_process')


async function readFirst2000Characters(filePath: string): Promise<string> {

  const fs = (await pFs).default
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
  let current = 0;
  let found;

  do {
    found = str.indexOf(delimiter, current);
    if (found === -1 || result.length === limit - 1) {
      result.push(str.substring(current));
      break;
    }
    result.push(str.substring(current, found));
    current = found + delimiter.length; 
  } while (true);

  return result;
}

const getLastChangeLog = async () => {
  const mainChainLogPath = 'CHANGELOG.md';
  const fs = (await pFs).default
  if (!fs.existsSync(mainChainLogPath)) {
    return '';
  }
  const mainChainLog = await readFirst2000Characters(mainChainLogPath)
  const manifestVersions = limitedSplit(mainChainLog, '## ', 2)[1]
  const changesText = '## ' + manifestVersions
  return changesText
}



async function ghRelease (isRebuild: boolean) {
  const fs = (await pFs).default

  if (!fs.existsSync('releases')) {
    fs.mkdirSync('releases');
  }

  const pkg = JSON.parse(fs.readFileSync('package.json').toString());

  const archiver = (await import('archiver')).default
  const archive = archiver('zip', { zlib: { level: 9 } });
  const dirPipes = ['dist'];

  const filePipes = ['LICENSE', 'README.md', 'PRIVACY_POLICY.md'];
  const outputPath = `releases/${pkg.version}.zip`;
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

    fs.writeFileSync(
      changeLogPath,
      `# ${pkg.version} \n
  ${await getLastChangeLog()}`,
    );
    const cps = (await pCps)
    console.log(
      await new Promise((resolve) => {
        const p = cps.spawn('gh', ['release', 'create', `v${pkg.version}`, `./${outputPath}`, '-F', `./${changeLogPath}`, '--target', 'main'], {
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

(async () => {

  const isRebuild = process.argv[2] === 'rebuild';

  await ghRelease(isRebuild);
  console.log('Release created');
})();
