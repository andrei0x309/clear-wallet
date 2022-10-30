
(async () => {
    const fs = (await import('fs')).default
    const pkg = JSON.parse(fs.readFileSync('dist/manifest.json').toString());
    pkg.content_scripts[0].js[0] = 'src/extension/content.js'
    fs.writeFileSync('dist/manifest.json', JSON.stringify(pkg, null, 2))
  })();