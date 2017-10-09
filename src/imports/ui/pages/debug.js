import "./debug.html"
import isElectron from "is-electron";
import CryptoJS from 'crypto-js';
import HKDF from 'hkdf';
import utf8 from 'utf8';

import {ReactiveDict} from 'meteor/reactive-dict';

Template.debug.onCreated(function () {
    this.dict = new ReactiveDict("debug");

    window.CryptoJS = CryptoJS;
    let secretKey = Meteor.uuid();

    let userEmailLowerCase = "deeeed@gmail.com".toLowerCase();

    let versionSetting = "A3";

    // don't use naïve approaches for converting text, otherwise international
    // characters won't have the correct byte sequences. Use TextEncoder when
    // available or otherwise use relevant polyfills
    let masterPassword = new Buffer("I hëart årt and £$¢!").toString('utf8').trim();
    console.debug("passphrase is ", masterPassword);

    // HKDF to 32 byte
    // secretKey = HKDF(secretKey, version, email, 32);

    // crypto.subtle.deriveKey({}, key, );
    let salt = CryptoJS.lib.WordArray.random(16);

    deriveHKDF({
        text: salt.toString(),
        salt: userEmailLowerCase,
        initialKeyringMaterial: versionSetting
    }).then((newSalt) => {
        console.debug(`old salt ${salt.length}`, salt);
        console.debug(`new salt ${newSalt.length}`, newSalt.toString('hex'));

        let keyM = CryptoJS.PBKDF2(masterPassword, newSalt.toString(), {
            keySize: 512 / 32,
            iterations: 10
        }).toString();
        console.debug("new key ", keyM.toString());

        // You should firstly import your passphrase Uint8array into a CryptoKey
        window.crypto.subtle.importKey(
            'raw',
            new Buffer(masterPassword),
            {name: 'PBKDF2'},
            false,
            ['deriveBits', 'deriveKey']
        ).then(function (key) {
            return window.crypto.subtle.deriveKey(
                {
                    "name": 'PBKDF2',
                    "salt": newSalt,
                    // don't get too ambitious, or at least remember
                    // that low-power phones will access your app
                    "iterations": 100,
                    "hash": 'SHA-256'
                },
                key,
                // Note: for this demo we don't actually need a cipher suite,
                // but the api requires that it must be specified.

                // For AES the length required to be 128 or 256 bits (not bytes)
                {"name": 'AES-CBC', "length": 256},
                // Whether or not the key is extractable (less secure) or not (more secure)
                // when false, the key can only be passed as a web crypto object, not inspected
                true,
                // this web crypto object will only be allowed for these functions
                ["encrypt", "decrypt"]
            )
        }).then(function (webKey) {
            console.debug("webkey", webKey);
            return crypto.subtle.exportKey("raw", webKey);
        }).then(function (buffer) {
            var proofOfSecret = buffer.toString("hex");
            console.debug("proofOfSecret", proofOfSecret, buffer);
            // this proof-of-secret / secure-remote password
            // can now be sent in place of the user's password
        });
    });
    // Need to derivate Master Unlock Key
    // salt should be Uint8Array or ArrayBuffer

    // let encAsymKey = CryptoJS.PBKDF2(passphrase, config.salt, {
    //     keySize: 512 / 32,
    //     iterations: 10
    // }).toString();
});

Template.debug.onRendered(function () {

})

Template.debug.helpers({
    processing() {
        return Template.instance().dict.get("processing");
    },
    stringify(obj) {
        return EJSON.stringify(obj)
    },
    RSAPublicKey() {
        return Template.instance().dict.get("jwk_public");
    },
    RSAPrivateKey() {
        return Template.instance().dict.get("jwk_private");
    }
})

Template.debug.events({
    "click .js-generate"(evt, tpl) {
// RSA-OAEP with 2048-bit moduli and a pub-lic exponent of 65537

        tpl.dict.set("processing", "generating RSA key");
        window.crypto.subtle.generateKey(
            {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048, //can be 1024, 2048, or 4096
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["sign", "verify"] //can be any combination of "sign" and "verify"
        ).then(function (key) {
            tpl.dict.set("processing", false);

            //returns a keypair object
            console.log(key);
            console.log(key.publicKey);
            console.log(key.privateKey);
            tpl.dict.set("rsakey", key);

            window.crypto.subtle.exportKey(
                "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
                key.privateKey //can be a publicKey or privateKey, as long as extractable was true
            ).then((privateKeydata) => {
                console.log("private key", privateKeydata);
                tpl.dict.set("jwk_private", privateKeydata);
            })

            window.crypto.subtle.exportKey(
                "jwk",
                key.publicKey
            ).then((publicKeydata) => {
                console.log("public key", publicKeydata);
                tpl.dict.set("jwk_public", publicKeydata);
            })
        }).then(function (publicKeydata) {

        }).catch(function (err) {
            tpl.dict.set("processing", false);
            console.error(err);
        });
    },
    "click .js-electron"(evt, tpl) {
        window.isElectron = isElectron;

        if (isElectron()) {
            console.debug("electron", Bridge);
        } else {
            console.warn("not inside electron");
        }

    },
    "click .js-disconnect": function (evt) {
        evt.preventDefault();
        Meteor.disconnect();
    }
})

const deriveHKDF = ({text, alg = 'sha256', size = 32, salt, initialKeyringMaterial}) => {
    return new Promise((resolve, reject) => {
        let hkdf = new HKDF(alg, salt, initialKeyringMaterial);
        hkdf.derive(text, size, function (key) {
            // key is a Buffer, that can be serialized however one desires
            return resolve(key);
        });

    });
}