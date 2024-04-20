import { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { promises as fsPromises } from 'node:fs';

const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK || ""] || Network.DEVNET;
const PRIVATE_KEY: string = process.env.APTOS_PRIVATE_KEY || (() => {
    console.log("Please specify APTOS_PRIVATE_KEY env var to specify the account private key.");
    process.exit(1);
})();
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const receiver = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
});

function usage() {
    console.log(`usage: set_book_reencrypt.ts <fileName> <encrypted_passwd>`);
}

const fileName = process.argv[2] || (() => {
    usage();
    console.log("Please specify the file name of the book to add");
    process.exit(124);
})();

const encryptedPasswdFile = process.argv[3] || "./randompassword.encrypted";

console.log(`Reading ${fileName}`);

const fun = `${receiver.accountAddress}::contract::reencrypt_book`;
console.log(`fun: ${fun}`);

function readFile(fname: string) {
    return (async () => {
        const file = await fsPromises.open(fname);
        const ret = await file.readFile();
        await file.close();
        return ret;
    })();
}


async function main() {
    const [fileContents, encryptedPasswd] = await Promise.all([
        readFile(fileName),
        readFile(encryptedPasswdFile),
    ]);

    console.log(`Read content file ${fileContents.byteLength} bytes and encryption key ${encryptedPasswd.byteLength} bytes`);

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
            function: fun,
            // typeArguments: [`std::string::String`, `std::string::String`],
            functionArguments: [fileName, fileCid.toString(), encryptedPasswd],
        },
    });

    console.log(`tx sent`);

    const senderAuthenticator = aptos.transaction.sign({ signer: receiver, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log(`pendingTxn: ${pendingTxn.hash}`);
    await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
}

main();
