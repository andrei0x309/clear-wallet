var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var listners = {
    accountsChanged: new Set(),
    connect: new Set(),
    disconnect: new Set,
    chainChanged: new Set()
};
var promResolvers = {};
var listner = function (event) {
    var _a, _b;
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type == "CLWALLET_PAGE")) {
        if ((_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) {
            promResolvers[event.data.resId].reject(event.data.data);
        }
        else {
            promResolvers[event.data.resId].resolve(event.data.data);
        }
        promResolvers[event.data.resId] = undefined;
    }
};
window.addEventListener("message", listner);
var sendMessage = function (args) {
    return new Promise(function (resolve, reject) {
        var resId = crypto.randomUUID();
        promResolvers[resId] = { resolve: resolve, reject: reject };
        var data = { type: "CLWALLET_CONTENT", data: args, resId: resId };
        window.postMessage(data, "*");
    });
};
// chainId
// : 
// "0x89"
// enable
// : 
// ƒ ()
// isMetaMask
// : 
// true
// networkVersion
// : 
// "137"
// request
// : 
// ƒ ()
// selectedAddress
// : 
// null
// send
// : 
// ƒ ()
// sendAsync
// : 
// ƒ ()
// _events
// : 
// {connect: ƒ}
// _eventsCount
// : 
// 1
// _handleAccountsChanged
// : 
// ƒ ()
// _handleChainChanged
// : 
// ƒ ()
// _handleConnect
// : 
// ƒ ()
// _handleDisconnect
// : 
// ƒ ()
// _handleStreamDisconnect
// : 
// ƒ ()
// _handleUnlockStateChanged
// : 
// ƒ ()
// _jsonRpcConnection
// : 
// {events: s, stream: d, middleware: ƒ}
// _log
// : 
// u {name: undefined, levels: {…}, methodFactory: ƒ, getLevel: ƒ, setLevel: ƒ, …}
// _maxListeners
// : 
// 100
// _metamask
// : 
// Proxy {isUnlocked: ƒ, requestBatch: ƒ}
// _rpcEngine
// : 
// o {_events: {…}, _eventsCount: 0, _maxListeners: undefined, _middleware: Array(3)}
// _rpcRequest
// : 
// ƒ ()
// _sendSync
// : 
// ƒ ()
// _sentWarnings
// : 
// {enable: false, experimentalMethods: false, send: false, events: {…}}
// _state
// : 
// {accounts: Array(0), isConnected: true, isUnlocked: true, initialized: true, isPermanentlyDisconnected: false}
// _warnOfDeprecation
// : 
// ƒ (
var eth = new Proxy({
    isConnected: function () {
        return true;
    },
    // for maximum compatibility since is cloning the same API
    isMetaMask: true,
    enable: function () {
        return sendMessage({ method: 'eth_requestAccounts', params: Array(0) });
    },
    request: function (args) {
        return sendMessage(args);
    },
    on: function (eventName, callback) {
        switch (eventName) {
            case 'accountsChanged':
                listners.accountsChanged.add(callback);
                break;
            case 'connect':
                listners.connect.add(callback);
                break;
            case 'disconnect':
                listners.disconnect.add(callback);
                break;
            case 'chainChanged':
                listners.chainChanged.add(callback);
                break;
            default:
                return;
        }
    },
    // Simulate Metamask
    _warnOfDeprecation: function () { return null; },
    _state: {},
    _sentWarnings: function () { return null; },
    _rpcRequest: function () { return null; },
    _handleAccountsChanged: function () { return null; },
    chainId: "0x89",
    networkVersion: "137",
    selectedAddress: null,
    send: function () { return null; },
    sendAsync: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); }); },
    _events: {},
    _eventsCount: 0,
    _handleChainChanged: function () { return null; },
    _handleConnect: function () { return null; },
    _handleDisconnect: function () { return null; },
    _handleStreamDisconnect: function () { return null; },
    _handleUnlockStateChanged: function () { return null; },
    _jsonRpcConnection: {},
    _log: {},
    _maxListeners: 100,
    _metamask: new Proxy({}, {}),
    _rpcEngine: {}
}, {
    set: function () { return false; },
    deleteProperty: function () { return false; }
});
var injectWallet = function (win) {
    Object.defineProperty(win, 'ethereum', {
        get: function () {
            return eth;
        },
        set: function () {
            return;
        }
    });
    window.tttest = 'test';
    // Object.defineProperty(window, 'ethereum', 444)
    console.log('Clear wallet injected', window.ethereum, win);
};
injectWallet(this);
// setTimeout(() => {
//     console.log('Metamask clone test');
//     // (<any>window).ethereum.request({method: 'eth_requestAccounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_accounts', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'eth_chainId', params: Array(0)}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]}).then((res: any) => { console.log(res, '111111111')});
//     // (<any>window).ethereum.request({method: 'net_version', params: []}).then((res: any) => { console.log(res, '111111111')});
// }, 3500)
// console.log( (window as any).ethereum.request({method: 'eth_chainId'}))
