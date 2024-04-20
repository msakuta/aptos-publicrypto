# Contracts

This directory contains smart contracts in Move.

## Prerequisites

* [Aptos CLI](https://aptos.dev/tools/aptos-cli/install-cli/)

## Accounts

We prepare the account to deploy on devnet.
Aptos CLI creates account in devnet by default, so you can simply run this to prepare the account to deploy the contracts:

    aptos init

## Compile

Compile with the command below. Note that the named address `publicrypto` is the account address to deploy the contract to.

    aptos move compile --named-addresses publicrypto=default

## Deploy

Similarly to compile, you can deploy the a

    aptos move publish --named-addresses publicrypto=default

## Check the deployed contract

See [the Aptos Eexplorer](https://explorer.aptoslabs.com/?network=devnet) to check your account and the contract.

