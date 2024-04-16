/* eslint-disable no-console */

import { unixfs } from '@helia/unixfs'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'
import { promises as fsPromises } from 'node:fs';

const cidStr = process.argv[2] || (() => {
    console.log(`usage: get_book.ts <cid>`);
    console.error("CID is required as an argument");
    process.exit(123)
})();

async function main(cidStr: string) {
    const helia = await createHelia()

    const fs = unixfs(helia)

    const cid = CID.parse(cidStr);

    let fileCid = null;

    for await (const f of fs.ls(cid)) {
        console.log(`fs.ls: ${f.path} => ${f.cid}`);
        fileCid = f.cid;
    }

    if (!fileCid) {
        console.error(`Could not find a CID for the file`);
        return;
    }

    const outFile = await fsPromises.open("output.enc", "w");

    for await (const chunk of fs.cat(fileCid, {
        onProgress: (evt) => {
            console.info('cat event', evt.type, evt.detail)
        }
        })) {
        await outFile.write(chunk);
    }

    await outFile.close();
}

main(cidStr);
