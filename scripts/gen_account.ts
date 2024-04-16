import { Account } from "@aptos-labs/ts-sdk";

// Create two accounts, Alice and Bob
const alice = Account.generate();

console.log(`account: ${alice.accountAddress}`);