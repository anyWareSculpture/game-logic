/**
 * Default Configuration
 * 
 * Use the object exported as this module to create your own local
 * configuration objects or use this directly.
 * A configuration file is any ES6 file that exports a single default
 * object containing all of the configuration options.
 *
 * Avoid requiring file into any file that might need this one.
 * In general game logic should never need this, a config object should
 * be passed around in constructors.
 */

const COLORS = require('../constants/colors');
const GAMES = require('../constants/games');

const config = {};
export default config;

// The username of the current user
config.username = "";

// A mapping between usernames and the colors that represent them
config.USER_COLORS = {
  // username : color
  sculpture0: COLORS.USER0,
  sculpture1: COLORS.USER1,
  sculpture2: COLORS.USER2
};

config.GAMES_SEQUENCE = [
  GAMES.MOLE,
  GAMES.DISK,
  GAMES.SIMON
];

