# Aptos-publicrypto

<div align="center"><img src="images/book-on-chain.png" alt="Book on chain icon"></div>

A development repository for publicrypto book publishing platform using Aptos blockchain
and IPFS distributed filesystem.


## Overview

Publicrypto is a platform to achieve book or article publication without intermediary.
The reader can purchase a document and most of the reward is fed back to the author.
The blockchain consumes a little bit of gas fee, but it is minimal compared to conventional publication platforms.

The key idea is that each copy of the document is encrypted by a unique key, so other users cannot see the contents.


## Strategy of the development

Since we need rapid prototyping to get the grant, we develop with the following strategy:

1. Implement a set of script files to perform basic operations, such as publishing a book, sending to a reader and decripting on the reader side.
2. Implement smart contract to perform key exchange between the publisher and the reader.
3. Implement a simple frontend to demonstrate the publishing UX. Ideally we should encrypt on the frontend without using external servers, but we need to see if it's possible.
4. Implement a offline tool using Electron or Tauri for more DTP-like experience.
5. Implement a reader app that decrypt and view simultaneously, probalby by utilizing pdf.js.
6. Implement watermark feature to the publishing app as a countermeasure for piracy.
7. Implement reselling feature, i.e. re-encryption with renewed key, and remove from previous owner's reader app.
8. Implement a marketplace that publishers and readers can match.


## Scripts

See [README in scripts](./scripts/README.md) for the full list of scripts for basic operations.


## Smart contract

See [contract](./contract/) for the smart contract codes in Move.
