/// This module defines a minimal Coin and Balance.
module publicrypto::contract {
    use std::signer;
    use std::vector;
    use std::string::String;
    use std::option::{some, none, Option, is_some};

    /// Address of the owner of this module
    const MODULE_OWNER: address = @publicrypto;

    /// Error codes
    const ENOT_MODULE_OWNER: u64 = 0;
    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EALREADY_HAS_BALANCE: u64 = 2;

    struct Book has store {
        name: String,
        price: u64,
        ipfs_cid: String,
        encryption_pub_key: String,
    }

    /// A collection of books owned by this account.
    struct Bookshelf has key {
        books: vector<Book>,
    }

    fun init_module(sender: &signer) {
        move_to(sender, Bookshelf {
            books: vector[],
        });
    }

    #[view]
    public fun find_book(name: String): Option<String> acquires Bookshelf {
        find_book_int(MODULE_OWNER, name)
    }

    fun find_book_int(addr: address, name: String): Option<String> acquires Bookshelf {
        if (exists<Bookshelf>(addr)) {
            let bookshelf = borrow_global_mut<Bookshelf>(MODULE_OWNER);
            for (i in 0..vector::length(&bookshelf.books)) {
                let book = vector::borrow(&bookshelf.books, i);
                if (book.name == name) {
                    return some(book.ipfs_cid)
                }
            };
            none()
        } else {
            none()
        }
    }

    public entry fun request_book(sender: &signer, _receiver: &signer, name: String) acquires Bookshelf {
        let sender_addr = signer::address_of(sender);
        if (exists<Bookshelf>(sender_addr)) {
            let bookshelf = borrow_global_mut<Bookshelf>(sender_addr);
            let has_book = false;
            for (i in 0..vector::length(&bookshelf.books)) {
                let book = vector::borrow(&bookshelf.books, i);
                if (book.name == name) {
                    has_book = true;
                    break
                }
            };
            if (has_book) {

            }
        }
    }

    public entry fun publish_book(account: &signer, name: String, price: u64, ipfs_cid: String, encryption_pub_key: String) acquires Bookshelf {
        let addr = signer::address_of(account);
        if (is_some(&find_book_int(addr, name))) {
            return
        };
        let book = Book {
            name,
            price,
            ipfs_cid,
            encryption_pub_key,
        };
        if (exists<Bookshelf>(addr)) {
            let bookshelf = borrow_global_mut<Bookshelf>(addr);
            vector::push_back(&mut bookshelf.books, book);
        } else {
            move_to(account, Bookshelf { books: vector[book] });
        }
    }

    #[view]
    public fun get_bookshelf(): vector<String> acquires Bookshelf {
        let bookshelf = borrow_global<Bookshelf>(MODULE_OWNER);
        let ret = vector[];
        for (i in 0..vector::length(&bookshelf.books)) {
            let book = vector::borrow(&bookshelf.books, i);
            vector::push_back(&mut ret, book.ipfs_cid);
        };
        ret
    }

    #[view]
    public fun num_books(): u64 acquires Bookshelf {
        let bookshelf = borrow_global<Bookshelf>(MODULE_OWNER);
        vector::length(&bookshelf.books)
    }
}
