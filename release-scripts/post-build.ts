
(async () => {
    const CONTENT_BUILD_PATH = 'src/extension/content.js'
    const fs = (await import('fs')).default
    const pkg = JSON.parse(fs.readFileSync('dist/manifest.json').toString());
    pkg.content_scripts[0].js[0] = CONTENT_BUILD_PATH
    fs.writeFileSync('dist/manifest.json', JSON.stringify(pkg, null, 2))
    // fs.writeFileSync('dist/rules.js', fs.readFileSync('rules.json').toString())
    fs.writeFileSync('dist/'+ CONTENT_BUILD_PATH, fs.readFileSync('src/extension/content.js').toString())
  })();