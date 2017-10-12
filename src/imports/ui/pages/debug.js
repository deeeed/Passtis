import "./debug.html"
import isElectron from "is-electron";
import CryptoJS from 'crypto-js';
import HKDF from 'hkdf';
import utf8 from 'utf8';

import {ReactiveDict} from 'meteor/reactive-dict';

Template.debug.onCreated(function () {
    this.dict = new ReactiveDict("debug");

    window.CryptoJS = CryptoJS;

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