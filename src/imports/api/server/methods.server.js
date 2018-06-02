import {Meteor} from 'meteor/meteor';
import {logger as log} from "../../util/loggers";
import {KeyAccounts} from "../model/KeyAccounts.model";
import CryptoJS from 'crypto-js';
import GeoIP from 'geoip-lite-country';
const fs = require('fs');

Meteor.methods({
    ping: function () {
        log.debug("ping / pong on the server");
        return "pong";
    },
    /**
     * Use GeoIP to detect the country from the given ip address.
     *
     * @param clientIp || default to ddp connection clientAddress.
     * @returns {Object} georesult - The result of the ip lookup.
     * @returns {String} georesult.ip - The value of the ip used for lookup.
     * @returns {String} georesult.country - Country code of the ip
     */
    countryByIP: function (clientIp) {
        // logger.debug(`countryByIp for ${clientIp}`);

        check(clientIp, String);
        // Default to ddp connection ip address.
        let ip = clientIp || this.connection.clientAddress;
        const georesult = GeoIP.lookup(ip) || {};
        // Keep a copy of the ip with the georesult object.
        georesult.ip = ip;
        return georesult;
    },
    "user.config"({passphrase, pincode} = {}) {
        check(passphrase, String);

        //TODO
    },
    /**
     * Export the list of passwords for the current user as csv file.
     * CSV File format is compatible with 1Password.
     *
     * @param masterPassword
     * @param serverFile
     * @return {string}
     */
    "export1Password"({masterPassword, serverFile}={}) {
        if (!this.userId) {
            throw new Meteor.Error("Authentication required")
        }
        check(masterPassword, String)

        const config = Meteor.user().config;
        // Create enc/dec key from masterPassword
        let enckey = CryptoJS.PBKDF2(masterPassword, config.salt, {keySize: 512 / 32, iterations: 10}).toString();


        log.info(`Export for ${Meteor.userId()} - key=${enckey}`)
        let res = "";
        // List through password
        KeyAccounts.find({}, {limit: 1000}).forEach((keyAccount) => {
            log.info(`keyAccount processing ${keyAccount.name}`)
            // Try to decrypt 3 times
            // There was a bug that sometime made decryption fail, trying again when it occurs usually fixes it.
            let success = true;
            let sDecrypted;
            try {
                let decrypted = CryptoJS.AES.decrypt(keyAccount.secure, enckey);
                sDecrypted = decrypted.toString(CryptoJS.enc.Utf8);
            } catch (e1) {
                log.error(`#1 Failed to process account ${keyAccount.name}`)
                try {
                    sDecrypted = decrypted.toString(CryptoJS.enc.Utf8);
                } catch (e2) {
                    log.error(`#2 Failed to process account ${keyAccount.name}`)
                    try {
                        sDecrypted = decrypted.toString(CryptoJS.enc.Utf8);
                    } catch(e3) {
                        log.error(`#3 Failed to process account ${keyAccount.name}`)
                        log.error(`Secure data: ${keyAccount.secure}`)
                        success = false;
                    }
                }
            }
            // log.info(`Success=${success} && sDecrypted=${sDecrypted}`)
            if(success && sDecrypted) {
                let decrypted = EJSON.parse(sDecrypted);
                let csvLine = `"${nonEmpty(keyAccount.name)}","${nonEmpty(decrypted.host)}",${usersFormatter(decrypted.users)},"${nonEmpty(keyAccount.description)}",${extraUsersFormatter(decrypted.users)}\n`;
                log.info(csvLine)
                res += csvLine;
            }
        })
        // Write csv file
        fs.writeFile('1password.csv', res, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else{
                console.log('It\'s saved!');
            }
        });
        return res;
    }
});

const nonEmpty = (s) => {
    return s ? s : "";
}

/** Utility functions to extra user infos **/
const usersFormatter = (users) => {
    if(users && users.length>0) {
        return `"${nonEmpty(users[0].login)}","${nonEmpty(users[0].password)}"`;
    } else
        return `""`;
}
const extraUsersFormatter = (users) => {
    if(users && users.length<2)
        return `""`;

    let len=users.length;
    let res = ``;

    for(let i=1; i<len; i++) {
        res += `"${nonEmpty(users[i].login)} / ${nonEmpty(users[i].password)}",`;
    }
    return res;
}