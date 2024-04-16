# Overview

This directory contains scripts to perform basic operations, such as encrypting and publishing a book.

All scripts intended to run on testnet (for now).


## Prerequisites

* bash
* node >=20
* openssl 1.1.1w


## How to run scripts

First, run `npm i` to install dependencies.

Then, run a command like below.

    npx tsx <scripts.ts>


## Generating a testing account `gen_account.ts`

This is the most basic script to scaffold testing environment.
Using Aptos SDK, it generates a new account and prints its address.


## Generating an encrypted version of a document `make_encrypted.bash`

This script takes single argument like below:

    ./make_encrypted.bash <filename.pdf>

where `<filename.pdf>` is a document file name, typically a pdf.
It will output encrypted version of the document with the name `filename.enc`,
using OpenSSL's RSA encryption implementation.
The password used to encrypt the content is output to a file `randompassword`.

I would like to replace it with a typescript, since having a bash script here is
inconsistent.


## Uploading the document and pushing the IPFS hash `add_book.ts`

This script takes 2 arguments:

    npx tsx add_book.ts <filename.enc> <encryptionPubKey>

The first argument is the file name of the encrypted document, and the second is the filename of the encryption public key.
The encrypted file is uploaded to IPFS and its CID is published to the smart contract along with the encryption public key.

Note that the book is added to the shelf, so you can put multiple books in an account.


## Retrieve encrypted contents from IPFS `get_book.ts`

This script takes an argument, the IPFS CID, to obtain the file.
The file has to be pinned beforehand.

    npx tsx get_book.ts <CID>

and the output is written to `output.enc`.
