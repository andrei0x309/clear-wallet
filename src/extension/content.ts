
const allowedMethods = {
  'eth_accounts': true,
  'eth_requestAccounts': true,
  'eth_chainId': true,
  'personal_sign': true,
  'wallet_requestPermissions': true,
  'wallet_registerOnboarding': true,
  'wallet_revokePermissions': true,
  'eth_gasPrice': true,
  'eth_getBlockByNumber': true,
  'eth_blockNumber': true,
  'eth_estimateGas': true,
  'eth_syncing': true,
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
  'wallet_addEthereumChain': true,
  'eth_getCode': true,
  'eth_getTransactionCount': true,
}

window.addEventListener("message", (event) => {
  if (event.source != window)
    return;
  if (event?.data?.type === "CLWALLET_CONTENT") {
    event.data.data.data.resId = event.data.resId
    event.data.data.data.type = "CLWALLET_CONTENT_MSG"
    event.data.data.data.website = document?.location?.href ?? ''
    if ((event?.data?.data?.method ?? 'x') in allowedMethods) {
      event.data.data.data.method = event?.data?.data?.method ?? ''
      try {
        chrome?.runtime?.sendMessage(event.data.data.data, (res) => {
          if (chrome.runtime.lastError) {
            console.warn("LOC1: Error sending message:", JSON.stringify(chrome.runtime.lastError));
          }
          const id = Number(event.data.resId.replace(/[A-Za-z]/g, '').slice(0, 10))
          const data = {
            target: 'metamask-inpage',
            type: "CLWALLET_PAGE",
            resId: event.data.resId,
            data: {
              name: 'metamask-provider', data: {
                jsonrpc: '2.0',
                id,
                result: res,
              },
              id,
              method: event?.data?.data?.data?.method ?? '',
              params: event?.data?.data?.data?.params ?? [],
              listener: undefined
            },
          }

          if(res?.type === "CLWALLET_PAGE_LISTENER") {
            data.type = "CLWALLET_PAGE_LISTENER"
            data.data.listener = res?.data?.listener
            data.data.data.result = res?.data?.data
          }

          if (event?.data?.data?.data?.method !== 'eth_chainId') {
            // console.info('data out', data)
          }

          window.postMessage(data, "*");
        })
      } catch (e) {
        if ((e as Error)?.message === 'Extension context invalidated') {
          console.info('Error: Extension context invalidated. Ignoring.');
        }
      }
    }
    else {
      const data = {
        type: "CLWALLET_PAGE",
        data: {
          data: {
            result: { error: true, message: 'ClearWallet: Unknown method requested ' + (event?.data?.data?.data?.method ?? '') }
          }
        }
        , resId: event.data.resId
      };
      window.postMessage(data, "*");
    }
  } else if (event?.data?.type === "CLWALLET_PING") {
    event.data.data.data.resId = event.data.resId
    event.data.data.data.type = "CLWALLET_CONTENT_MSG"
    event.data.data.data.method = "wallet_connect"
    event.data.data.data.params = Array(0)
    try {
      chrome.runtime.sendMessage(event.data.data.data, async (res) => {
        if (chrome.runtime.lastError) {
          console.warn("LOC2: Error sending message:", chrome.runtime.lastError);
        }
        window.postMessage(res, "*");
      })
    } catch (e) {
      if ((e as Error)?.message === 'Extension context invalidated') {
        console.info('Error: Extension context invalidated. Ignoring.');
      }
    }
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (chrome.runtime.lastError) {
    console.warn("Error receiving message:", chrome.runtime.lastError);
  }
  if (message.type === "CLWALLET_EXT_LISTNER") {
    const data = { type: "CLWALLET_PAGE_LISTENER", data: message.data };
    // console.log('data listner', data)
    window.postMessage(data, "*");
  }
  return true

});

