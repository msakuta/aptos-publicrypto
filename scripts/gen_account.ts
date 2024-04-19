import { Account } from "@aptos-labs/ts-sdk";
import { promises as fsPromises } from 'node:fs';

async function main() {
    const reader = Account.generate();
    const publisher = Account.generate();

    const outFile = await fsPromises.open("../.aptos/config.yaml", "w");
    await outFile.write("---\nprofiles:\n");

    async function printAccount(name, acc) {
        await outFile.write(`  ${name}:
    private_key: "${acc.privateKey}"
    public_key: "${acc.publicKey}"
    account: ${acc.accountAddress}
    rest_url: "https://fullnode.devnet.aptoslabs.com"
    faucet_url: "https://faucet.devnet.aptoslabs.com"
`);
    }

    await printAccount("reader", reader);
    await printAccount("publisher", publisher);
}

main();
