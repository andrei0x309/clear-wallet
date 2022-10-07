
const allowedMethods = {
  'eth_accounts': true,
  'eth_requestAccounts' : true,
  'eth_chainId': true,
  'personal_sign' : true,
  'wallet_requestPermissions': true
}

window.addEventListener("message", (event) => {
  if (event.source != window)
      return;

  if (event.data.type && (event.data.type == "CLWALLET_CONTENT")) {
    event.data.data.resId = event.data.resId
    console.log('data in', event?.data)
    if(event?.data?.data?.method ?? 'x' in allowedMethods)

    chrome.runtime.sendMessage(event.data.data, (res) => {
      const data = { type: "CLWALLET_PAGE", data: res, resId: event.data.resId };
      console.log('data back', data)
      window.postMessage(data, "*");
    })
  }
});


(function() {
    const script = document.createElement('script')
    script.src =  chrome.runtime.getURL('src/extension/inject.js')
    document.documentElement.appendChild(script)
  })()
  