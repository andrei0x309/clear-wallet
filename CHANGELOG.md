# Changelog

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
