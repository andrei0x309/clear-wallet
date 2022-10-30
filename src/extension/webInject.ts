const container = document.head
const script = document.createElement('script');
script.setAttribute('async', "false")
script.textContent = `
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var listners = {
    accountsChanged: new Set(),
    connect: new Set(),
    disconnect: new Set(),
    chainChanged: new Set(),
    once: {
        accountsChanged: new Set(),
        connect: new Set(),
        disconnect: new Set(),
        chainChanged: new Set()
    }
};
var promResolvers = new Map();
var getListnersCount = function () {
    var _a;
    var count = 0;
    for (var _i = 0, _b = Object.keys(listners); _i < _b.length; _i++) {
        var key = _b[_i];
        if (key === 'once') {
            for (var _c = 0, _d = Object.keys(listners[key]); _c < _d.length; _c++) {
                var onceKey = _d[_c];
                count += (_a = listners[key][onceKey]) === null || _a === void 0 ? void 0 : _a.length;
            }
        }
        else {
            count += listners[key].length;
        }
    }
    return count;
};
var sendMessage = function (args, ping) {
    if (ping === void 0) { ping = false; }
    if (Object.values(promResolvers).filter(function (r) { return r; }).length < 10) {
        return new Promise(function (resolve, reject) {
            var resId = crypto.randomUUID();
            promResolvers.set(resId, { resolve: resolve, reject: reject });
            var data = { type: "CLWALLET_CONTENT", data: args, resId: resId };
            if (ping) {
                data.type = 'CLWALLET_PING';
            }
            // console.log('data in', data)
            window.postMessage(data, "*");
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            reject(new Error("You have reached the maximum number of concurent wallet messeges."));
        });
    }
};
var MetaMaskAPI = /** @class */ (function () {
    function MetaMaskAPI() {
        this.isMetaMask = true;
        this._state = { accounts: Array(1), isConnected: true, isUnlocked: true, initialized: true, isPermanentlyDisconnected: false };
        this._sentWarnings = { enable: false, experimentalMethods: false, send: false, events: {} };
        // Deprecated - hardcoded for now, websites should not access this directly since is deprecated for a long time
        this.chainId = "0x89";
        // Deprecated - hardcoded for now, websites should not access this directly since is deprecated for a long time
        this.networkVersion = "137";
        this.selectedAddress = null;
        this.autoRefreshOnNetworkChange = false;
        // Internal Simulate Metamask 
        this._events = {};
        this._eventsCount = 2;
        this._jsonRpcConnection = {};
        this._log = {};
        this._maxListeners = 100;
        this._metamask = new Proxy({
            isUnlocked: function () {
                return Promise.resolve(true);
            },
            requestBatch: function () {
                // empty
            }
        }, {});
        this._rpcEngine = {
            _events: {}, _eventsCount: 0, _maxListeners: undefined, _middleware: Array(4)
        };
    }
    MetaMaskAPI.prototype.isConnected = function () {
        return false;
    };
    // for maximum compatibility since is cloning the same API
    MetaMaskAPI.prototype.enable = function () {
        return sendMessage({ method: 'eth_requestAccounts', params: Array(0) });
    };
    MetaMaskAPI.prototype.request = function (args) {
        return sendMessage(args);
    };
    // Deprecated
    MetaMaskAPI.prototype.sendAsync = function (arg1, arg2) {
        return this.send(arg1, arg2);
    };
    // Deprecated
    MetaMaskAPI.prototype.send = function (arg1, arg2) {
        if (typeof arg1 === 'string') {
            return sendMessage({
                method: arg1,
                params: arg2
            });
        }
        else if (arg2 === undefined) {
            console.error('Clear Wallet: Sync calling is deprecated and not supported');
        }
        else {
            sendMessage(arg1).then(function (result) {
                if (typeof arg2 === 'function') {
                    arg2(undefined, {
                        id: arg1 === null || arg1 === void 0 ? void 0 : arg1.id,
                        jsonrpc: '2.0',
                        method: arg1.method,
                        result: result
                    });
                }
            })["catch"](function (e) {
                arg2(new Error(e), {
                    id: arg1 === null || arg1 === void 0 ? void 0 : arg1.id,
                    jsonrpc: '2.0',
                    method: arg1.method,
                    error: new Error(e)
                });
            });
        }
    };
    MetaMaskAPI.prototype.on = function (eventName, callback) {
        this.addListener(eventName, callback);
        return this;
    };
    MetaMaskAPI.prototype.addListener = function (eventName, callback) {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged.add(callback);
                break;
            case 'connect':
                listners.connect.add(callback);
                sendMessage({
                    method: 'wallet_ready'
                }, true);
                break;
            case 'disconnect':
            case 'close':
                listners.disconnect.add(callback);
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.chainChanged.add(callback);
                break;
        }
        return this;
    };
    MetaMaskAPI.prototype.once = function (eventName, callback) {
        switch (eventName) {
            case 'accountsChanged':
                listners.once.accountsChanged.add(callback);
                break;
            case 'connect':
                listners.once.connect.add(callback);
                sendMessage({
                    method: 'wallet_ready'
                }, true);
                break;
            case 'disconnect':
            case 'close':
                listners.once.disconnect.add(callback);
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.once.chainChanged.add(callback);
                break;
        }
        return this;
    };
    MetaMaskAPI.prototype.off = function (eventName, callback) {
        (this).removeListener(eventName, callback);
        return this;
    };
    MetaMaskAPI.prototype.removeListener = function (eventName, callback) {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged["delete"](callback);
                break;
            case 'connect':
                listners.connect["delete"](callback);
                break;
            case 'disconnect':
            case 'close':
                listners.disconnect["delete"](callback);
                break;
            // Deprecated  - chainIdChanged -networkChanged
            case 'chainChanged':
            case 'chainIdChanged':
            case 'networkChanged':
                listners.chainChanged["delete"](callback);
                break;
            default:
                return;
        }
        return this;
    };
    MetaMaskAPI.prototype.removeAllListeners = function () {
        listners.accountsChanged.clear();
        listners.chainChanged.clear();
        listners.disconnect.clear();
        listners.connect.clear();
        return this;
    };
    MetaMaskAPI.prototype.getMaxListeners = function () {
        return 100;
    };
    MetaMaskAPI.prototype._getExperimentalApi = function () {
        return this._metamask;
    };
    MetaMaskAPI.prototype.eventNames = function () {
        return [];
    };
    MetaMaskAPI.prototype.listenerCount = function () {
        return getListnersCount();
    };
    MetaMaskAPI.prototype.listners = function () { return []; };
    MetaMaskAPI.prototype.rawListners = function () { return []; };
    // Internal Simulate Metamask 
    MetaMaskAPI.prototype._warnOfDeprecation = function () { return true; };
    MetaMaskAPI.prototype._rpcRequest = function () { return true; };
    MetaMaskAPI.prototype._handleAccountsChanged = function () { return true; };
    MetaMaskAPI.prototype._handleChainChanged = function () { return true; };
    MetaMaskAPI.prototype._handleConnect = function () { return true; };
    MetaMaskAPI.prototype._handleDisconnect = function () { return true; };
    MetaMaskAPI.prototype._handleStreamDisconnect = function () { return true; };
    MetaMaskAPI.prototype._handleUnlockStateChanged = function () { return true; };
    MetaMaskAPI.prototype._sendSync = function () {
        console.error('Clear Wallet: Sync calling is deprecated and not supported');
    };
    return MetaMaskAPI;
}());
var eth = new Proxy(new MetaMaskAPI(), {
    // set: () => { return true },
    // get: function(target, name, receiver) {
    //     if (typeof (<any>target)[name] == 'function') {
    //         return function (...args: any) {
    //           console.dir({ call: [name, ...args] });
    //           return undefined;
    //         }
    //         }
    //         let check = true
    //         setTimeout(() => check = false, 400)
    //         while(check){
    //             // igmore
    //         }
    // },
    deleteProperty: function () { return false; }
});
var listner = function (event) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type === "CLWALLET_PAGE")) {
        try {
            if ((_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) {
                (_c = promResolvers.get(event.data.resId)) === null || _c === void 0 ? void 0 : _c.reject(event.data.data);
                console.error((_d = event === null || event === void 0 ? void 0 : event.data) === null || _d === void 0 ? void 0 : _d.data);
            }
            else {
                (_e = promResolvers.get(event.data.resId)) === null || _e === void 0 ? void 0 : _e.resolve(event.data.data);
            }
            promResolvers["delete"](event.data.resId);
        }
        catch (e) {
            console.log('Failed to connect resolve msg', e);
        }
    }
    else if (event.data.type && (event.data.type === "CLWALLET_PAGE_LISTENER")) {
        if (((_h = (_g = (_f = event === null || event === void 0 ? void 0 : event.data) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.listner) !== null && _h !== void 0 ? _h : 'x') in listners) {
            try {
                var listnerName_1 = (_k = (_j = event === null || event === void 0 ? void 0 : event.data) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.listner;
                if (listnerName_1 === 'connect' && ((_m = (_l = event === null || event === void 0 ? void 0 : event.data) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.data)) {
                    eth.networkVersion = (_s = (_r = (_q = (_p = (_o = event === null || event === void 0 ? void 0 : event.data) === null || _o === void 0 ? void 0 : _o.data) === null || _p === void 0 ? void 0 : _p.data) === null || _q === void 0 ? void 0 : _q.chainId) === null || _r === void 0 ? void 0 : _r.toString(10)) !== null && _s !== void 0 ? _s : '137';
                    eth.chainId = (_w = (_v = (_u = (_t = event === null || event === void 0 ? void 0 : event.data) === null || _t === void 0 ? void 0 : _t.data) === null || _u === void 0 ? void 0 : _u.data) === null || _v === void 0 ? void 0 : _v.chainId) !== null && _w !== void 0 ? _w : '0x89';
                    eth.selectedAddress = (_z = (_y = (_x = event === null || event === void 0 ? void 0 : event.data) === null || _x === void 0 ? void 0 : _x.data) === null || _y === void 0 ? void 0 : _y.address) !== null && _z !== void 0 ? _z : null;
                    eth.isConnected = function () { return true; };
                }
                else if (listnerName_1 === 'chainChanged') {
                    console.log((_1 = (_0 = event === null || event === void 0 ? void 0 : event.data) === null || _0 === void 0 ? void 0 : _0.data) === null || _1 === void 0 ? void 0 : _1.data);
                    eth.networkVersion = (_4 = (_3 = (_2 = event === null || event === void 0 ? void 0 : event.data) === null || _2 === void 0 ? void 0 : _2.data) === null || _3 === void 0 ? void 0 : _3.data.toString(10)) !== null && _4 !== void 0 ? _4 : '137';
                    eth.chainId = (_7 = (_6 = (_5 = event === null || event === void 0 ? void 0 : event.data) === null || _5 === void 0 ? void 0 : _5.data) === null || _6 === void 0 ? void 0 : _6.data) !== null && _7 !== void 0 ? _7 : '0x89';
                }
                else if (listnerName_1 === 'accountsChanged') {
                    eth.selectedAddress = (_11 = (_10 = (_9 = (_8 = event === null || event === void 0 ? void 0 : event.data) === null || _8 === void 0 ? void 0 : _8.data) === null || _9 === void 0 ? void 0 : _9.data) === null || _10 === void 0 ? void 0 : _10.address) !== null && _11 !== void 0 ? _11 : 'dummy-string';
                }
                listners[listnerName_1].forEach(function (listner) { var _a, _b; return listner((_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data); });
                listners.once[listnerName_1].forEach(function (listner) {
                    var _a, _b;
                    listner((_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data);
                    listners.once[listnerName_1]["delete"](listner);
                });
            }
            catch (e) {
                console.error(e);
                // ignore
            }
        }
    }
};
window.addEventListener("message", listner);
var proxy1 = new Proxy({
// on: (event: any, callback:any) => { if (event === 'message') {
//     debugger;
//     callback(true, true)
// } }
}, {
    get: function (target, name, receiver) {
        if (typeof target[name] == 'function') {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.dir({ call: __spreadArray([name], args, true) });
            };
        }
        console.log('ETH', name.toString(), target, receiver);
        return undefined;
    }
});
var proxy2 = new Proxy({
// on: (event: any, callback:any) => { if (event === 'message') {
//     debugger;
//     callback(true, true)
// } }
}, {
    get: function (target, name, receiver) {
        if (typeof target[name] == 'function') {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.dir({ call: __spreadArray([name], args, true) });
            };
        }
        console.log('web3', name.toString(), target, receiver);
        return undefined;
    }
});
var web3Shim = {
    currentProvider: eth,
    __isMetaMaskShim__: true
};
var injectWallet = function (win) {
    Object.defineProperty(win, 'ethereum', {
        value: eth
    });
    Object.defineProperty(win, 'web3', {
        value: web3Shim
    });
    sendMessage({
        method: 'wallet_ready'
    }, true);
    console.log('Clear wallet injected', window.ethereum, win);
};
injectWallet(this);
// setTimeout(() => {
//     // console.log('Metamask clone test');
//     // (<any>window).ethereum.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x89"}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum2.request({method: 'wallet_switchEthereumChain', params: [{chainId: "0x89"}]}).then((res: any) => { console.log(res, '111111111')});
//     //    (<any>window).ethereum.on('connect', ((a: any, b: any) => console.log('connect', a, b)));
//     // (<any>window).ethereum.on('accountsChanged', ((a: any, b: any) => console.log('accountsChanged', a, b)));
//     // (<any>window).ethereum.on('chainChanged', ((a: any) => console.log('chainChanged', a, typeof a)));
//     // console.log((<any>window).ethereum.on('message', (a: any, b:any) => console.log(a,b)))
//     console.log((<any>window).ethereum.toString())
//     console.log((<any>window).ethereum2.toString())
//     console.log((<any>window).ethereum.Symbold)
// }, 3500)
// console.log( (window as any).ethereum.request({method: 'eth_chainId'}))

`
container.prepend(script);
script.parentElement?.removeChild(script)
