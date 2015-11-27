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
      TARGET_PANEL_GROUPS: [
        // Each group will be lit up one at a time
        // When every panel in the group has been pressed, the next group will turn on
        // After the last group the game will end
        // [[stripId, panelId], ...],
        [['0', '3'], ['1', '3'], ['2', '3']],
        [['0', '4'], ['1', '5']],
        [['0', '3'], ['0', '5'], ['2', '4']]
      ],
      // The intensity to use on the lit up panels
      TARGET_PANEL_INTENSITY: 100,
      // The intensity to use once a panel has been pressed
      PANEL_OFF_INTENSITY: 0
    };

    this.DISK_GAME = {
      // The user will wins when they reach these positions for each diskId.
      RELATIVE_TOLERANCE: 3, // degrees tolerance for disks relative to each other
      ABSOLUTE_TOLERANCE: 5, // degrees tolerance for the absolute disk positions
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
          // panelId -- diskId
          '1': { disk0: Disk.COUNTERCLOCKWISE },
          '2': { disk0: Disk.COUNTERCLOCKWISE },
          '4': { disk1: Disk.COUNTERCLOCKWISE },
          '5': { disk1: Disk.COUNTERCLOCKWISE },
          '7': { disk2: Disk.COUNTERCLOCKWISE },
          '8': { disk2: Disk.COUNTERCLOCKWISE }
        },
        '2': {
          // panelId -- diskId
          '1': { disk0: Disk.CLOCKWISE },
          '2': { disk0: Disk.CLOCKWISE },
          '4': { disk1: Disk.CLOCKWISE },
          '5': { disk1: Disk.CLOCKWISE },
          '7': { disk2: Disk.CLOCKWISE },
          '8': { disk2: Disk.CLOCKWISE }
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

