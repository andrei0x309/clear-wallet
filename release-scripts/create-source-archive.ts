const pFs = import('fs')
const pCps = import('child_process')

async function buildSource () {
    const fs = (await pFs).default

    if (!fs.existsSync('releases')) {
        fs.mkdirSync('releases');
    }

    if (!fs.existsSync('releases/source')) {
        fs.mkdirSync('releases/source');
    }

    const pkg = JSON.parse(fs.readFileSync('package.json').toString());

    const archiver = (await import('archiver')).default
    const archive = archiver('zip', { zlib: { level: 9 } });
    const dirPipes = [
        '.github',
        'public',
        'release-scripts',
        'repo_res',
        'src',
        'tests'
    ];

    const filePipes = [
        '.browserslistrc',
        '.eslintrc.js',
        '.gitignore',
        'babel.config.js',
        'bun.lockb',
        'capacitor.config.ts',
        'CHANGELOG.md',
        'cypress.json',
        'eval-sandbox.html',
        'funding.json',
        'index.html',
        'ionic.config.json',
        'jest.config.js',
        'LICENSE',
        'package.json',
        'PRIVACY_POLICY.md',
        'README.md',
        'tsconfig.json',
        'vite.config.ts'
    ];
    const outputPath = `releases/source/source-${pkg.version}.zip`;
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

}

const main = async () => {
    await buildSource();
    console.info('Source archive created')
}

main();