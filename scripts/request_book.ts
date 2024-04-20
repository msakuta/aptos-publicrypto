/* eslint-disable no-console */

// A script to request book purchase from an author.
// It pushes the public key of the reader's password to the smart contract.

import { Account, AccountAddress, Ed25519PrivateKey, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK || ""] || Network.DEVNET;
const PRIVATE_KEY: string = process.env.APTOS_PRIVATE_KEY || process.exit(1);
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const receiver = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
});

const fileName = process.argv[2] || (() => {
    console.log(`usage: request_book.ts <fileName> <senderAddress>`);
    console.log("Please specify the file name of the book to add");
    process.exit(124);
})();

const senderAddress = process.argv[3] || (() => {
    console.log(`usage: request_book.ts <fileName> <senderAddress>`);
    console.log("Please specify the price in integer");
    process.exit(125);
})();

async function main() {
    // const senderAccount = AccountAddress.fromStringStrict(senderAddress);
    const transaction = await aptos.transaction.build.simple({
        sender: receiver.accountAddress,
        data: {
            function: `${receiver.accountAddress}::contract::request_book`,
            // typeArguments: [`std::string::String`, `std::string::String`],
            functionArguments: [senderAddress, fileName],
        },
    });
    console.log(`tx sent`);

    const senderAuthenticator = aptos.transaction.sign({ signer: receiver, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log(`pendingTxn: ${pendingTxn.hash}`);
    await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
}

main();
