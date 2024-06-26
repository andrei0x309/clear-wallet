# Changelog

## Manifest Version 1.3.9

- add an additional throttle on 'eth_chainId' to prevent websites from spamming the wallet with requests
- change inject throttle to only affect UI requests
- updated some core dependencies
- optimized performance for json rpc calls
- disabled assets fetch until new provider is found before yup.io was used
- simplified wallet switching
- added sonarCloud badge to README.md

## Manifest Version 1.3.8

- improved sign message display to better accomodate SIWE & other messages

## Manifest Version 1.3.7

- improved add Network pages
- upgraded and optimized some dependencies including vite
- optimized vite config
- added condition to not reinject wallet if already injected for websites that reload injected scripts
- optimized throttle fuffilment of requests in case of too many requests
- removed uneeded mobile native code

## Manifest Version 1.3.6

- better display of blockchain explorer button
- updated ethers dependency to latest 6.11.1
- better handling of type sigining
- changed the password input for unlock to not lose focus
- activated focus on password input for unlock on view enter
- disabled integration of fire wallet(in cause user has it installed) with type signing due to incompatibility
- other misc improvements
- added a check when sending native token to check if internet / RPC or Blockchain and show a message to the user
- customize testNets icons to show a small dev icon on the top right corner
- updated testNets templates to include newer networks
- show icons for testNets too in most places

## Manifest Version 1.3.5

- added copy button to chainId for easier development
- added settings to be able to transfrom address to lower case when copying
- added a check in get recepit to return null if hash is missing
- added version display to wallet first page

## Manifest Version 1.3.4

- bump fake Metamask version signature to 11.0.0
- improved compatibility with older deprecated websites
- improved mimicking of Metamask API
- made the wallet compatible with fire extension on sending transaction( by mimicking new Metamask API)

## Manifest Version 1.3.3

- improved eth_call and eth_blockNumber to be more compatible with older websites
- better error internal handling
- modify the receipt returned to resamble more the one from Metamask
- change some notes in about
- refactored account name edit to be more user friendly

## Manifest Version 1.3.2

- added button to open non kyc exchange, no referral is used to maximize privacy

## Manifest Version 1.3.1

- refactored the wallet to use etheres V6
- implemented EIP6963Provider
- updated all dependencies
- added ability to send native tokens
- added ability to manage ABIs
- added ability to perfrom arbitrary read calls to contracts
- added ability to perfrom arbitrary write calls to contracts
- added ability to save read or write calls for later use
- added sandbox to be able to evaluate JS code in order to pass complex parameters to read or write calls
- added base Network to templates class
- added Icon for base network
- added ability to add contacts and load them in Read contract and Write and Send token pages
- added ability to paste current selected address to both webpages and insde wallet itself

## Manifest Version 1.2.8

- better support for estimate gas
- added support for deprecated .send method to support more websites

## Manifest Version 1.2.7

- improve compatibility with ionic 7

## Manifest Version 1.2.6

- upgrade ionic to v7 and update dependencies
  
## Manifest Version 1.2.5

- improve post build script
  
## Manifest Version 1.2.4

- updated showing assets page to use new api
- removed yup score from assets page
- change the info modal in settings

## Manifest Version 1.2.3

- injected stub with chrome feature available in chrome 103 ( register world ) to bypass CSP
- clear up some console errors
- pushed minimum version to 103

## Manifest Version 1.2.2

- updated dependencies

## Manifest Version 1.2.1

- added support fro eth_getTransactionCount method

## Manifest Version 1.1.9

- added proxy in intial stub for send, request, sendAsync for better compatibility

## Manifest Version 1.1.8

- added support to extract private key from seed when adding account

## Manifest Version 1.1.7

- added support for eth get code method
- added article about repo in README.md

## Manifest Version 1.1.6

- made wallet proxy `return true` on trying to overwrite object (to fix an issue with the official polygon bridge website)
- change `sendAsync` implementation to `not redirect` to `send` method to improve compatibility
- added notification on gas estimation error due to invalid decimal trimming from user

## Manifest Version 1.1.5

- Added multiple new multiple implementations of MetamaskAPI including request to add a network by a website
- Injecting in sync mode stub wallet to increese compatibility with websites that expect a walled defined at the lowest point of page load
- Modifing CSP requests to allow sync injecting of stub
- Added Web3 Shim for compatibility with older websites
- Tested new websites and TX's
- Refactoring the 10 maximum conqurent messages limit
- Added support for most of listners and improve emiting them
- Added a post buil script
- Switch the content script to load initialy without a wrapper module

## Manifest Version: 1.1.4

- Added max 10 allowed concurrent messages to the wallet to prevent abusive websites from sending too many messages.
- Added explorer-button to main wallet page for easier viewing of the selected address on the blockchain explorer.
- Show the price converted in dollars also besides the native token price on transaction view for networks: 1(Ethereum), 137(Polygon), 100(Gnosis), 10(Optimism), 56(BSC), 42161(Arbitrum One)
