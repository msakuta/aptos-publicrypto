/// This module defines a minimal Coin and Balance.
module publicrypto::contract {
    use std::signer;
    use std::vector;
    use std::string::String;
    use std::option::{Self, some, none, Option, is_none};

    /// Address of the owner of this module
    const MODULE_OWNER: address = @publicrypto;

    /// Error codes
    const ENOT_MODULE_OWNER: u64 = 0;
    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EALREADY_HAS_BOOK: u64 = 2;
    const ENOT_INITIALIZED: u64 = 3;
    const ENO_BOOK: u64 = 4;

    struct Requester has store, copy, drop {
        addr: address,
        encryption_pub_key: String,
        reencrypted_cid: Option<String>,
        encrypted_passwd: Option<vector<u8>>,
    }

    struct Book has store {
        name: String,
        price: u64,
        ipfs_cid: String,
        encryption_pub_key: String,
        requester: Option<Requester>,
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
        let i = find_book_int(MODULE_OWNER, name);
        if (is_none(&i)) {
            return none()
        };
        let idx = option::extract(&mut i);
        let bookshelf = borrow_global<Bookshelf>(MODULE_OWNER);
        some(vector::borrow(&bookshelf.books, idx).ipfs_cid)
    }

    #[view]
    public fun get_book_reencrypted_cid(name: String): Option<String> acquires Bookshelf {
        let i = find_book_int(MODULE_OWNER, name);
        if (is_none(&i)) {
            return none()
        };
        let idx = option::extract(&mut i);
        let bookshelf = borrow_global<Bookshelf>(MODULE_OWNER);
        let book = vector::borrow(&bookshelf.books, idx);
        if (is_none(&book.requester)) {
            return none()
        };
        option::borrow(&book.requester).reencrypted_cid
    }

    #[view]
    public fun get_book_encrypted_password(name: String): Option<vector<u8>> acquires Bookshelf {
        let i = find_book_int(MODULE_OWNER, name);
        if (is_none(&i)) {
            return none()
        };
        let idx = option::extract(&mut i);
        let bookshelf = borrow_global<Bookshelf>(MODULE_OWNER);
        let book = vector::borrow(&bookshelf.books, idx);
        if (is_none(&book.requester)) {
            return none()
        };
        option::borrow(&book.requester).encrypted_passwd
    }

    fun find_book_int(addr: address, name: String): Option<u64> acquires Bookshelf {
        if (exists<Bookshelf>(addr)) {
            let bookshelf = borrow_global<Bookshelf>(MODULE_OWNER);
            for (i in 0..vector::length(&bookshelf.books)) {
                let book = vector::borrow(&bookshelf.books, i);
                if (book.name == name) {
                    return some(i)
                }
            };
            none()
        } else {
            none()
        }
    }

    public entry fun request_book(sender: &signer, receiver: address, name: String, encryption_pub_key: String) acquires Bookshelf {
        let sender_addr = signer::address_of(sender);
        assert!(exists<Bookshelf>(sender_addr), ENOT_INITIALIZED);
        let bookshelf = borrow_global_mut<Bookshelf>(sender_addr);
        let has_book = false;
        for (i in 0..vector::length(&bookshelf.books)) {
            let book = vector::borrow_mut(&mut bookshelf.books, i);
            if (book.name == name) {
                has_book = true;
                book.requester = some(Requester {
                    addr: receiver,
                    encryption_pub_key,
                    reencrypted_cid: none(),
                    encrypted_passwd: none(),
                });
                break
            }
        };
        assert!(has_book, ENO_BOOK);
    }

    public entry fun publish_book(account: &signer, name: String, price: u64, ipfs_cid: String, encryption_pub_key: String) acquires Bookshelf {
        let addr = signer::address_of(account);
        assert!(is_none(&find_book_int(addr, name)), EALREADY_HAS_BOOK);
        let book = Book {
            name,
            price,
            ipfs_cid,
            encryption_pub_key,
            requester: none(),
        };
        if (exists<Bookshelf>(addr)) {
            let bookshelf = borrow_global_mut<Bookshelf>(addr);
            vector::push_back(&mut bookshelf.books, book);
        } else {
            move_to(account, Bookshelf { books: vector[book] });
        }
    }

    public entry fun reencrypt_book(account: &signer, name: String, encrypted_cid: String, encrypted_passwd: vector<u8>) acquires Bookshelf {
        let addr = signer::address_of(account);
        let book_i = find_book_int(addr, name);
        assert!(option::is_some(&book_i), ENO_BOOK);
        let bookshelf = borrow_global_mut<Bookshelf>(addr);
        let book = vector::borrow_mut(&mut bookshelf.books, option::extract(&mut book_i));
        assert!(option::is_some(&book.requester), ENO_BOOK);
        let requester = option::borrow_mut(&mut book.requester);
        requester.reencrypted_cid = some(encrypted_cid);
        requester.encrypted_passwd = some(encrypted_passwd);
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
