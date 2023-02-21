try {
    window.ethereum = {
        isMetaMask: true,
        isConnected: () => true,
        request: (a,b,c) => window.ethereum.request(a,b,c),
        sendAsync: (a,b,c) => window.ethereum.sendAsync(a,b,c),
        send: (a,b,c) => window.ethereum.send(a,b,c),
    }
} catch {
  // ignore
}