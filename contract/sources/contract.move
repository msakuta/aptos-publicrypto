/// This module defines a minimal Coin and Balance.
module publicrypto::contract {
    use std::signer;
    use std::vector;
    use std::string::String;

    /// Address of the owner of this module
    // const MODULE_OWNER: address = @publicrypto;

    /// Error codes
    const ENOT_MODULE_OWNER: u64 = 0;
    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EALREADY_HAS_BALANCE: u64 = 2;

    struct Book has store {
        ipfs_cid: String,
        encryption_pub_key: String,
    }

    /// Struct representing the balance of each address.
    struct Bookshelf has key {
        books: vector<Book>,
    }

    /// Publish an empty balance resource under `account`'s address. This function must be called before
    /// minting or transferring to the account.
    public entry fun publish_book(account: &signer, ipfs_cid: String, encryption_pub_key: String) acquires Bookshelf {
        let book = Book {
            ipfs_cid,
            encryption_pub_key,
        };
        let addr = signer::address_of(account);
        if (exists<Bookshelf>(addr)) {
            let bookshelf = borrow_global_mut<Bookshelf>(addr);
            vector::push_back(&mut bookshelf.books, book);
        } else {
            move_to(account, Bookshelf { books: vector[book] });
        }
    }
}
