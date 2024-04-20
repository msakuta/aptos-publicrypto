import { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { promises as fsPromises } from 'node:fs';

const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK || ""] || Network.DEVNET;
const PRIVATE_KEY: string = process.env.APTOS_PRIVATE_KEY || (() => {
    console.log("Please specify APTOS_PRIVATE_KEY env var to specify the account private key.");
    process.exit(1);
});
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const receiver = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
});

const fileName = process.argv[2] || (() => {
    console.log(`usage: add_book.ts <fileName> <price in uaptos> <encryptionPubKey>`);
    console.log("Please specify the file name of the book to add");
    process.exit(124);
})();

const price = parseInt(process.argv[3]) || (() => {
    console.log(`usage: add_book.ts <fileName> <price in uaptos> <encryptionPubKey>`);
    console.log("Please specify the price in integer");
    process.exit(125);
})();

const encryptionPubKeyName = process.argv[4] || (() => {
    console.log(`usage: add_book.ts <fileName> <price in uaptos> <encryptionPubKey>`);
    console.log("Please specify the encryption public key");
    process.exit(125);
})();

console.log(`Reading ${fileName}`);

console.log(`fun: ${receiver.accountAddress}::contract::publish_book`);

function readFile(fname: string) {
    return (async () => {
        const file = await fsPromises.open(fname);
        const ret = await file.readFile();
        await file.close();
        return ret;
    })();
}


async function main() {
    const [fileContents, encryptionPubKey] = await Promise.all([
        readFile(fileName),
        readFile(encryptionPubKeyName),
    ]);

    console.log(`Read content file ${fileContents.byteLength} bytes and encryption key ${encryptionPubKey.byteLength} bytes`);

    const helia = await createHelia({
    // ... helia config
    });
    const fs = unixfs(helia);

    // create an empty dir and a file, then add the file to the dir
    const emptyDirCid = await fs.addDirectory()
    const fileCid = await fs.addBytes(new Uint8Array(fileContents));
    const updateDirCid = await fs.cp(fileCid, emptyDirCid, 'foo.txt')
    // const ipfs_cid = "Qmcjuxa9ccH9oriJNmywBX3AmxeZq9KC55gG9mpiWQXivf";

    console.log(`file pushed to IPFS: ${fileCid}`);

    const transaction = await aptos.transaction.build.simple({
        sender: receiver.accountAddress,
        data: {
            function: `${receiver.accountAddress}::contract::publish_book`,
            // typeArguments: [`std::string::String`, `std::string::String`],
            functionArguments: [fileName, price, fileCid.toString(), encryptionPubKey.toString()],
        },
    });

    console.log(`tx sent`);

    const senderAuthenticator = aptos.transaction.sign({ signer: receiver, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log(`pendingTxn: ${pendingTxn.hash}`);
    await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
}

main();
