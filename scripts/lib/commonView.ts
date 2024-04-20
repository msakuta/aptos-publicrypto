import { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

export const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK || ""] || Network.DEVNET;
export const PRIVATE_KEY: string | undefined = process.env.APTOS_PRIVATE_KEY;
export const ADDRESS: string | undefined = process.env.APTOS_ADDRESS;
export const config = new AptosConfig({ network: APTOS_NETWORK });
export const aptos = new Aptos(config);

export const receiverAddress = ADDRESS || Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
}).accountAddress || (() => {
    console.log("Please specify APTOS_PRIVATE_KEY or APTOS_ADDRESS env var to specify the account private key.");
    process.exit(1);
});

export function getFileName(usage: () => void) {
    return process.argv[2] || (() => {
        usage();
        console.log("Please specify the file name of the book to add");
        process.exit(124);
    })()
}
