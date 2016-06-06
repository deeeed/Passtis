/**
 * Prevent using Session from the window scope.
 *
 * export a singleton instance of a ReactiveDict to be used instead of the Session object.
 *
 * example:
 * import LocalSession from '/imports/api/client/LocalSession.js';
 * LocalSession.set("key", value);
 *
 */

import { ReactiveDict } from 'meteor/reactive-dict';

// ReactiveDict needs to be called with an argument to persist across hotcode push.
const localSession = new ReactiveDict('persist');
export default localSession;
