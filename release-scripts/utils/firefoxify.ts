const pFs = import('fs')

export const foxyfyManifest = async () => {
    const fs = (await pFs).default
    const pkg = JSON.parse(fs.readFileSync('dist/manifest.json').toString());

    // Check if the manifest is already foxyfied
    if (!pkg?.background?.service_worker) {
        console.warn('Manifest is already foxyfied');
        return
    }
    // make backup copy of manifest
    fs.writeFileSync('dist/chromium-manifest.json', JSON.stringify(pkg, null, 2))

    
    // Add service worker for Firefox
    pkg.background = {
        scripts : ['service-worker-loader.js'],
        type: 'module'
    }

    // Remove Version name
    delete pkg.version_name

    // Remove sandbox page as is not supported
    delete pkg.sandbox

    // Delete minimum chrome version
    delete pkg.minimum_chrome_version

    // remove use_dynamic_url
    const newWebResources = [...pkg.web_accessible_resources]

    for (const resource of pkg.web_accessible_resources) {
        delete resource.use_dynamic_url
    }

    pkg.web_accessible_resources = newWebResources


    // add Firefox Author fields
    pkg.author = 'andrei0x309'
    pkg.developer = {
        name: 'andrei0x309',
        url: 'https://github.com/andrei0x309/clear-wallet'
    }

    // Add Firefox specific settings
    pkg.browser_specific_settings = {
        gecko: {
            id: 'clear-wallet@flashsoft.eu',
            strict_min_version: '128.0' // minimum version that supports injecting into world main
        },
        // For later use FF Android lack neaded features maybe in the future they will be implemented
        gecko_android: {
            strict_min_version: '128.0' // minimum version that supports injecting into world main
        }
    }

    // Save foxyfied manifest
    fs.writeFileSync('dist/firefox-manifest.json', JSON.stringify(pkg, null, 2))
    fs.writeFileSync('dist/manifest.json', JSON.stringify(pkg, null, 2))
  
}

export const unfoxyfyManifest = async () => {
    const fs = (await pFs).default
    
    // check if manifest is already unfoxyfied
    if (fs.existsSync('dist/chromium-manifest.json')) {
        fs.writeFileSync('dist/manifest.json', fs.readFileSync('dist/chromium-manifest.json').toString())
    } else {
        console.warn('Chromium manifest not found, cannot unfoxyfy')
    }
}