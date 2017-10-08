import Winston from 'winston';

/*
 * Winston configuration option available on https://github.com/winstonjs/winston
 */
export const logger = new Winston.Logger({
    level:'debug',
    transports: [new (Winston.transports.Console)()]
});
