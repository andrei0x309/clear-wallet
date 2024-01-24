
(async () => {
    const CONTENT_BUILD_PATH = 'src/extension/content.js'
    const METAMASK_INJECT_PATH = 'src/extension/inject.js'
    const fs = (await import('fs')).default
    const path = (await import('path')).default
    const pkg = JSON.parse(fs.readFileSync('dist/manifest.json').toString());
    pkg.content_scripts[0].js[0] = CONTENT_BUILD_PATH
    pkg.content_scripts[1].js[0] = METAMASK_INJECT_PATH
    fs.writeFileSync('dist/manifest.json', JSON.stringify(pkg, null, 2))
    fs.writeFileSync('dist/'+ CONTENT_BUILD_PATH, fs.readFileSync('src/extension/content.js').toString())
    fs.writeFileSync('dist/'+ METAMASK_INJECT_PATH, fs.readFileSync('src/extension/inject.js').toString())
    const directory = 'dist/assets/';
    fs.readdir(directory, (err, files) => {
        files.forEach(file => {
          if(file.startsWith('content'))
                fs.unlinkSync( path.resolve(directory + file)) 
        });
    });
  })();
