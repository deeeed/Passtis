import { Meteor } from 'meteor/meteor';
import {logger as log} from "../../util/loggers";

import GeoIP from 'geoip-lite-country';

Meteor.methods({
    ping: function() {
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
    "user.config"({passphrase,pincode}={}) {
        check(passphrase, String);

        //TODO
    }
});
