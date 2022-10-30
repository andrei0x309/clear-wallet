
(() =>{
  try {
    const metamaskStub = `
    // Add MetamaskAPI STUB for wallets lib to detect wallet exists
    window.ethereum = {
      isMetaMask: true,
      isConnected: () => false
  }`;
document.documentElement.setAttribute('onreset', metamaskStub);
document.documentElement.dispatchEvent(new CustomEvent('reset'));
document.documentElement.removeAttribute('onreset');
      const container = document.documentElement;
      const script = document.createElement('script');
      script.setAttribute('async', "false")
      script.setAttribute('fetchpriority', "high")
      script.src = chrome.runtime.getURL('src/extension/webInject.js')
      container.prepend(script)
  } catch (error) {
    console.error('MetaMask: Provider injection failed.', error);
  }
  chrome.runtime.connect({ 
      name: 'content'
  })
})()

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
  'wallet_switchEthereumChain': true,
  'eth_call': true,
  'eth_getBalance': true,
  'eth_getTransactionByHash': true,
  'eth_getTransactionReceipt': true,
  'signTypedData': true,
  'eth_signTypedData': true,
  'signTypedData_v1': true,
  'eth_signTypedData_v1': true,
  'signTypedData_v3': true,
  'eth_signTypedData_V3': true,
  'signTypedData_v4': true,
  'eth_signTypedData_v4': true,
  'web3_clientVersion': true,
  'wallet_getPermissions': true,
  'net_listening': true,
  'eth_coinbase': true,
  'wallet_addEthereumChain': true
}

window.addEventListener("message", (event) => {
  if (event.source != window)
      return;
  console.log(event)
  if (event.data.type && (event.data.type === "CLWALLET_CONTENT")) {
    event.data.data.resId = event.data.resId
    event.data.data.type = "CLWALLET_CONTENT_MSG"
    event.data.data.website =  document?.location?.href ?? ''
    if((event?.data?.data?.method ?? 'x') in allowedMethods) {
    chrome.runtime.sendMessage(event.data.data, (res) => {
      const data = { type: "CLWALLET_PAGE", data: res, resId: event.data.resId };
      console.log('data back', data)
      window.postMessage(data, "*");
    })
  }
   else {
    const data = { type: "CLWALLET_PAGE", data: { error: true, message: 'ClearWallet: Unknown method requested ' + event?.data?.data?.method ?? ''}, resId: event.data.resId };
    window.postMessage(data, "*");
  }
  } else if (event.data.type && (event.data.type === "CLWALLET_PING")) {
    event.data.data.resId = event.data.resId
    event.data.data.type = "CLWALLET_CONTENT_MSG"
    event.data.data.method = "wallet_connect"
    event.data.data.params =  Array(0)
    chrome.runtime.sendMessage(event.data.data , async (res) => {
        window.postMessage(res, "*");

    })
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((message: any , sender, sendResponse) => {
  if(message.type === "CLWALLET_EXT_LISTNER") {
    const data = { type: "CLWALLET_PAGE_LISTENER", data: message.data  };
    // console.log('data listner', data)
    window.postMessage(data, "*");
  }
  return true
});

