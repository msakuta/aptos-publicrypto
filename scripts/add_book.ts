import { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK || ""] || Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const receiver = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey("0x030bce595098949b64bd17f4812b03e4a28d1bf14ea290cbff6a28f7f7379a46"),
});

const ipfs_cid = "Qmcjuxa9ccH9oriJNmywBX3AmxeZq9KC55gG9mpiWQXivf";
const encryption_pub_key = "QmQfpjgaGKTz1vqz7Dgzvp3gmodgfnjiZ9CM8kNZ2QAXwb";

console.log(`fun: ${receiver.accountAddress}::contract::publish_book`);

async function main() {
    const transaction = await aptos.transaction.build.simple({
        sender: receiver.accountAddress,
        data: {
            function: `${receiver.accountAddress}::contract::publish_book`,
            typeArguments: [`std::string::String`, `std::string::String`],
            functionArguments: [ipfs_cid, encryption_pub_key],
        },
    });

    console.log(`tx sent`);

    const senderAuthenticator = aptos.transaction.sign({ signer: receiver, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log(`pendingTxn: ${pendingTxn.hash}`);
    await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
}

main();
