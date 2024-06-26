import { receiverAddress, aptos, getFileName } from './lib/commonView';

const fileName = getFileName(() => {
    console.log(`usage: find_book.ts <fileName> <senderAddress> <readerPubKey>`);
});

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
