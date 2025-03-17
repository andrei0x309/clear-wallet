# Clear EVM wallet

![CLW LOGO](/public/assets/extension-icon/wallet_128.png?raw=true "CLW LOGO")

## Description

It is a simple EVM wallet chrome extension implementation using ethers, manifest version 3, Ionc, and Vue, first released on the Chrome web store on August 2022.

ATM it also has some farcaster & warpcast related features.

For more info you can check [docs website](https://clear-wallet.flashsoft.eu)

![Featured on Alchemy](/repo_res/alchemy.png?raw=true "Featured on Alchemy")

**Listed on:** ethereum.org, alchemy, product hunt, alternativeto, walletconnect, and more.

<!-- [![Clear EVM Wallet (CLW) - Open source EVM wallet that implements meta mask API. | Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=381026&theme=dark)](https://www.producthunt.com/posts/clear-evm-wallet-clw?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-clear-evm-wallet-clw) -->

### Badges

[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=andrei0x309_clear-wallet)](https://sonarcloud.io/summary/new_code?id=andrei0x309_clear-wallet)

### Extended article about this repo

[Article on Mirror](https://mirror.xyz/andrei0x309.eth/9nc8UXrGIGOvz694ZY2gouS1JM9L8-Z8ITLNtirqD6Q)

### Latest Demo Clip

https://github.com/user-attachments/assets/4f7d267a-7410-43cf-b3bd-0256f1ccc954

### LINKS

[LICENSE.md](LICENSE.md)

[PRIVACY_POLICY.md](PRIVACY_POLICY.md)

### FAQ

Q: Why use Ionic?
A: The main idea is to extend the codebase to try additional platforms like Desktop and Mobile because Ionic has a simple and friendly interface that is instantly ready to use with no additional design work.

Q: Is released on the Chrome web store?

A: Yes, Link: [https://chrome.google.com/webstore/detail/clear-evm-wallet-clw/djlahdpfkflehaepgohnnodmaajabdlg?hl=en](https://chrome.google.com/webstore/detail/clear-evm-wallet-clw/djlahdpfkflehaepgohnnodmaajabdlg?hl=en)

Q: What are some features?

A:  - It assumes that the user has some knowledge about the EVM ecosystem. It doesn't come with any predefined network. You can add any EVM network you want, and it lets you select from the templates of some more popular networks.
    - You can have the key stored with or without encryption, you can enable or disable auto-lock, and you can force decryption for every message sign or transaction sign & send.
    - You can import and export accounts.
    - You can wipe the data
    - It only uses local chrome storage
    - Is a drop-in replacement for meta mask, and currently will overwrite meta mask if you have both enabled
    - It will allow sites directly to get your EVM address without prompting
    - Prompts only for changing the network, sending/signing the transaction, and sending a message.

Q: Is this ready to use?

A: Should work on most modern websites as a Metamask replacement. Currently is pretty stable. It has a nice set of features that I needed.
I developed this pretty fast in my free time, and you should always back-up your keys( since I've seen even well-known wallets sometimes render keys inaccessible). This wallet only handles the keys and personal data locally for maximum privacy and trust.

Q: Will this project be heavily maintained?

A: Planing not to add too many features, so I will update it as long as I'll use it, and not plan to ditch it anytime soon.
