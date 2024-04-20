import { receiverAddress, aptos, getFileName } from './lib/commonView';
import { promises as fsPromises } from 'node:fs';

const fileName = getFileName(() => {
    console.log(`usage: find_book.ts <fileName> <senderAddress> <readerPubKey>`);
});

interface FindBookResult {
    vec: string[],
}

async function main() {
    const view: FindBookResult[] = await aptos.view({
        payload: {
            function: `${receiverAddress}::contract::get_book_encrypted_password`,
            functionArguments: [fileName],
        },
    });

    const out = await fsPromises.open("randompassword.received", "w");
    await out.writeFile(view[0].vec);
    await out.close();
}

main();
