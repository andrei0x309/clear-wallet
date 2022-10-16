# Clear EVM wallet

![CLW LOGO](/public/assets/extension-icon/wallet_128.png?raw=true "CLW LOGO")

## Description

Simple EVM wallet chrome extension implementation using ethers, mv3, ionc, vue.

[//]: # Here is an extended article abut this repo:

### FAQ

Q: Why using Ionic?
A: The main idea is to extend the codebase to try to aditional platforms like Desktop and Mobile, and because Ionic has a simple interface that is ready to use with no additional design work.

Q: Is released on Chrome webstore?
A: Not yet but will be probably soon

Q: What are some features?
A:  - It assumes some knowlodege about, EVM echosystem it dosen't come with any network, you can add any EVM network you want, and lets you sleect form the templates of some more popular networks.
    - You can have the key stored with or without encryption, you can enable or disable autolock, you can force decryption for every message sign or transaction sign & send.
    - You can import, export accounts.
    - You can wipe the data
    - It only uses local chrome storage
    - Is a drop-in replacement for metamask, and currently will overwite metamask if you have both enabled
    - It will allow sites directly to get your EVM address without prompting
    - Prompts only for changing the network, sending/signing transaction, sending message.

Q: Is this ready to use?
A: Currently is under some development but it has a nice set of features that I used, I developed this pretty fast in my free time, you should always backup your keys, and do your own research and only use what you are confortable to use. The software dosen't come with any gurantees and is released as it is. But I definitely recomand this to use for testnets and playing with any kind of experiments.

## LINKS

[LICENSE.md](LICENSE.md)
[PRIVACY_POLICY.md](PRIVACY_POLICY.md)
