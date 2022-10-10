
const allowedMethods = {
  'eth_accounts': true,
  'eth_requestAccounts' : true,
  'eth_chainId': true,
  'personal_sign' : true,
  'wallet_requestPermissions': true,
  'eth_gasPrice': true,
  'eth_getBlockByNumber': true,
  'eth_blockNumber': true,
  'eth_estimateGas': true,
  'eth_sign': true,
  'net_version': true,
  'eth_sendTransaction': true,
  'wallet_switchEthereumChain': true
}

window.addEventListener("message", (event) => {
  if (event.source != window)
      return;

  if (event.data.type && (event.data.type == "CLWALLET_CONTENT")) {
    event.data.data.resId = event.data.resId
    if((event?.data?.data?.method ?? 'x') in allowedMethods) {
    chrome.runtime.sendMessage(event.data.data, (res) => {
      const data = { type: "CLWALLET_PAGE", data: res, resId: event.data.resId };
      console.log('data back', data)
      window.postMessage(data, "*");
    })
  } else {
    const data = { type: "CLWALLET_PAGE", data: { error: true, message: 'Unknown method requested'}, resId: event.data.resId };
    window.postMessage(data, "*");
  }
  }
});

(function() {
    chrome.runtime.connect({ 
      name: 'content'
    })
    const script = document.createElement('script')
    script.src =  chrome.runtime.getURL('src/extension/inject.js')
    document.documentElement.appendChild(script)
  })()
  