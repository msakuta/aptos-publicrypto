import { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK || ""] || Network.DEVNET;
const PRIVATE_KEY: string | undefined = process.env.APTOS_PRIVATE_KEY;
const ADDRESS: string | undefined = process.env.APTOS_ADDRESS;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const receiverAddress = ADDRESS || Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
}).accountAddress || (() => {
    console.log("Please specify APTOS_PRIVATE_KEY or APTOS_ADDRESS env var to specify the account private key.");
    process.exit(1);
});

function usage() {
    console.log(`usage: find_book.ts <fileName> <senderAddress> <readerPubKey>`);
}

const fileName = process.argv[2] || (() => {
    usage();
    console.log("Please specify the file name of the book to add");
    process.exit(124);
})();

interface FindBookResult {
    vec: string[],
}

async function main() {
    const view: FindBookResult[] = await aptos.view({
        payload: {
            function: `${receiverAddress}::contract::find_book`,
            functionArguments: [fileName],
        },
    });

    console.log(`view: ${view[0].vec}`);
}

main();
