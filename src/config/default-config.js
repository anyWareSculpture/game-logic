/**
 * Default Configuration
 * 
 * Extend the class exported from this module to create your own local
 * configuration objects or use this directly.
 * A configuration file is any ES6 file that exports a single default
 * object containing all of the configuration options.
 *
 * Avoid requiring this file into any file that might need this one.
 * In general game logic should never need this, a config object should
 * be passed around through constructors.
 * 
 * Try to keep the structure as flat as possible while grouping things logically
 */

const COLORS = require('../constants/colors');
const GAMES = require('../constants/games');

const Disk = require('../utils/disk');

export default class DefaultConfig {
  constructor({
      username="",
      user0="sculpture0",
      user1="sculpture1",
      user2="sculpture2"
  } = {}) {
    this.user0 = user0;
    this.user1 = user1;
    this.user2 = user2;

    // The username of the current user
    this.username = username || user0;

    // A mapping between usernames and the colors that represent them
    this.USER_COLORS = {
      // username : color
      [this.user0]: COLORS.USER0,
      [this.user1]: COLORS.USER1,
      [this.user2]: COLORS.USER2
    };

    // The sequence of the games to be run. The first game is run on startup
    this.GAMES_SEQUENCE = [
      GAMES.HANDSHAKE,
      GAMES.MOLE,
      GAMES.DISK,
      GAMES.SIMON
    ];

    /******* LIGHTS ********************/
    this.LIGHTS = {
      GAME_STRIPS: ['0','1','2']
    }

    /******* GAMES CONFIGURATION *******/

    this.MOLE_GAME = {
      INITIAL_PANELS: [
        ['0', '3'],
        ['0', '7'],
        ['2', '6']
      ],
      NUM_ACTIVE_PANELS: {
        10: 1, // At panelCount of 10, increase # of simultaneusly active panels
        20: 1,
        25: -1, // At panelCount of 25, decrease # of simultaneusly active panels
        27: -1
      },
      PANEL_LIFETIME: [
        {count: 4, range: [4, 6]}, // At panelCount of 4, set panel lifetime to 4-6 seconds. Gradually interpolate to next timeout level
        {count: 20, range: [2, 3]},
        {count: 30, range: [1.5, 2]}
      ],
      // The intensity to use on the active panels
      ACTIVE_PANEL_INTENSITY: 100,
      // The intensity to use on the active panels
      INACTIVE_PANEL_INTENSITY: 0,
      // The intensity to use on the inactive panels (panels turned to location color)
      COLORED_PANEL_INTENSITY: 75
    };

    this.DISK_GAME = {
      // The user will wins when they reach these positions for each diskId, within the given tolerance
      TOLERANCE: 3, // degrees
      TARGET_POSITIONS_LEVELS: [
        // level 0
        {
          // diskId: target position
          disk0: 90,
          disk1: 180,
          disk2: 270
        },
        {
          disk0: 45,
          disk1: 225,
          disk2: 90
        },
        {
          disk0: 120,
          disk1: 70,
          disk2: 100
        }
      ],
      CONTROL_MAPPINGS: {
        // stripId
        '0': {
          // panelId
          '3': {
            // diskId
            disk0: Disk.CLOCKWISE
          },
          '4': {
            disk1: Disk.CLOCKWISE
          },
          '5': {
            disk2: Disk.CLOCKWISE
          }
        },
        '2': {
          // panelId
          '3': {
            // diskId
            disk0: Disk.COUNTERCLOCKWISE
          },
          '4': {
            disk1: Disk.COUNTERCLOCKWISE
          },
          '5': {
            disk2: Disk.COUNTERCLOCKWISE
          }
        }
      }
    };

    this.SIMON_GAME = {
      PATTERN_LEVELS: [
        // level 0 sequence
        {
          stripId: '0',
          // Each array of panel IDs is lit up one at a time
          // Each array within this array is called a "frame" in the "sequence"
          panelSequence: [['3'], ['4'], ['5']]
        },
        // level 1 sequence
        {
          stripId: '1',
          panelSequence: [['3'], ['5'], ['4']]
        },
        // level 2 sequence
        {
          stripId: '2',
          panelSequence: [['3'], ['5'], ['4'], ['6']]
        }
      ],
      // The intensity of the panels when they are pressed or when the sequence is playing
      TARGET_PANEL_INTENSITY: 100,
      // The intensity of the panels that the user can use to play the sequence
      AVAILABLE_PANEL_INTENSITY: 20,
      // The delay in ms between sequence frames
      SEQUENCE_ANIMATION_FRAME_DELAY: 500,
      // The delay in ms to wait before replaying the sequence
      // Only replayed if no input is received from the user
      DELAY_BETWEEN_PLAYS: 5000,
      // The time after input to wait for the user to finish the sequence
      INPUT_TIMEOUT: 10000,
      // The default color to set the panels to when
      DEFAULT_SIMON_PANEL_COLOR: "white"
    };
  }

  getUserColor(username) {
    return this.USER_COLORS[username];
  }
}

