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
    this.COLORS = {
      USERS: {
        // username : color
        [this.user0]: COLORS.USER0,
        [this.user1]: COLORS.USER1,
        [this.user2]: COLORS.USER2
      },
      ERROR: 'error'
    };

    // The sequence of the games to be run. The first game is run on startup
    this.GAMES_SEQUENCE = [
      GAMES.HANDSHAKE,
      GAMES.MOLE,
      GAMES.DISK,
      GAMES.SIMON
    ];

    /******* LIGHTS  ********************/
    this.LIGHTS = {
      // Name : strip Id (corresponds to hardware)
      STRIP_A: '0',
      STRIP_B: '1',
      STRIP_C: '2',
      PERIMETER_STRIP: '3',
      DISK_LIGHT_STRIP: '4',
      HANDSHAKE_STRIP: '5',
      ART_LIGHTS_STRIP: '6'
    };
    this.LIGHTS.GAME_STRIPS = [
      this.LIGHTS.STRIP_A,
      this.LIGHTS.STRIP_B,
      this.LIGHTS.STRIP_C
    ];
    this.PANELS = {
      // stripId : [all associated panel Ids]
      [this.LIGHTS.STRIP_A]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      [this.LIGHTS.STRIP_B]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      [this.LIGHTS.STRIP_C]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    };

    // These settings effect the default behaviour of panels outside of
    // any custom logic in any of the games
    this.PANEL_DEFAULTS = {
      ACTIVE_INTENSITY: 100,
      INACTIVE_INTENSITY: 0
    };

    /******* GAMES CONFIGURATION *******/

    this.HANDSHAKE_GAME = {
      TRANSITION_OUT_TIME: 4000 // Time (ms) from handshake is touched until we start the next game
    };
    this.MOLE_GAME = {
      GAME_END: 30,
      INITIAL_PANELS: [
        {stripId: this.LIGHTS.STRIP_A, panelId: '3'},
        {stripId: this.LIGHTS.STRIP_A, panelId: '7'},
        {stripId: this.LIGHTS.STRIP_C, panelId: '6'},
        {stripId: this.LIGHTS.STRIP_B, panelId: '5'}
      ],
      NUM_ACTIVE_PANELS: {
        10: 1, // At panelCount of 10, increase # of simultaneusly active panels
        20: 1,
        25: -1, // At panelCount of 25, decrease # of simultaneusly active panels
        27: -1
      },
      PANEL_LIFETIME: [
        {count: 0, range: [10, 10]}, // Initial timeout
        {count: 4, range: [4, 6]}, // At panelCount of 4, set panel lifetime to 4-6 seconds. Gradually interpolate to next timeout level
        {count: 20, range: [2, 3]},
        {count: 30, range: [1.5, 2]}
      ],
      // How long to wait before enabling the next panel, on success
      PANEL_SUCCESS_DELAY: 1000,
      // How long to wait before enabling the next panel, on automatic panel move
      PANEL_MOVE_DELAY: 200,
      // The intensity to use on active panels
      ACTIVE_PANEL_INTENSITY: 100,
      // The intensity to use on inactive panels
      INACTIVE_PANEL_INTENSITY: 0,
      // The intensity to use on ignored panels (panels turned to location color)
      COLORED_PANEL_INTENSITY: 75,
      // We don't use failure sounds in the default setup due to too many accidental touches
      ENABLE_FAILURE_SOUND: false
    };

    this.DISK_GAME = {
      // The user will wins when they reach these positions for each diskId.
      RELATIVE_TOLERANCE: 5, // degrees tolerance for disks relative to each other
      ABSOLUTE_TOLERANCE: 8, // degrees tolerance for the absolute disk positions
      // The intensity of the panels that the user can use to play the sequence
      CONTROL_PANEL_INTENSITY: 20,
      ACTIVE_CONTROL_PANEL_INTENSITY: 100,
      ACTIVE_PERIMETER_INTENSITY: 100,
      INACTIVE_PERIMETER_INTENSITY: 50, // Inactive: when turned to location color
      PERIMETER_COLOR: "white",
      SHADOW_LIGHTS: {
        // stripId: [panelId..]
        '6': ['0', '1', '2']
      },
      SHADOW_LIGHT_INTENSITY: 100,
      LEVELS: [
        // level 0
        // disks: { diskId: target position }
        // perimeter: { stripId: [panelIds..] }
        { disks:     { disk2: 52, disk1: 317, disk0: 316 },
          perimeter: { [this.LIGHTS.PERIMETER_STRIP]: ['0', '4'] }
        },
        // level 1
        { disks:     { disk2: 66, disk1: 287, disk0: 308 },
          perimeter: { [this.LIGHTS.PERIMETER_STRIP]: ['1', '3'] }
        },
        // level 2
        { disks:     { disk2: 286, disk1: 335, disk0: 240 },
          perimeter: { [this.LIGHTS.PERIMETER_STRIP]: ['2', '5'] }
        }
      ],
      LIGHT_MAPPING: {
        // diskId: { stripId: panelId }
        disk0: { [this.LIGHTS.DISK_LIGHT_STRIP]: '0' },
        disk1: { [this.LIGHTS.DISK_LIGHT_STRIP]: '1' },
        disk2: { [this.LIGHTS.DISK_LIGHT_STRIP]: '2' }
      },
      CONTROL_MAPPINGS: {
        CLOCKWISE_STRIP: this.LIGHTS.STRIP_C,
        COUNTERCLOCKWISE_STRIP: this.LIGHTS.STRIP_A,

        CLOCKWISE_PANELS: {
          // diskId : [panelId1, ...]
          disk0: ['1'],
          disk1: ['3'],
          disk2: ['5']
        },
        COUNTERCLOCKWISE_PANELS: {
          disk0: ['1'],
          disk1: ['3'],
          disk2: ['5']
        }
      }
    };

    this.SIMON_GAME = {
      PATTERN_LEVELS: [
        // level 0 sequence
        {
          stripId: this.LIGHTS.STRIP_A,
          // Each array of panel IDs is lit up one at a time
          // Each array within this array is called a "frame" in the "sequence"
          panelSequence: [['3'], ['5'], ['7']],
          frameDelay: 750 // Overriding default frame delay to make first level slower
        },
        // level 1 sequence
        {
          stripId: '1',
          panelSequence: [['1'], ['8'], ['5']]
        },
        // level 2 sequence
        {
          stripId: '2',
          panelSequence: [['3'], ['6'], ['2'], ['9']]
        }
      ],
      // The intensity of the panels when they are pressed or when the sequence is playing
      TARGET_PANEL_INTENSITY: 100,
      // The intensity of the panels that the user can use to play the sequence
      AVAILABLE_PANEL_INTENSITY: 1,
      // The delay in ms between sequence frames
      SEQUENCE_ANIMATION_FRAME_DELAY: 500,
      // The delay in ms to wait before replaying the sequence
      // Only replayed if no input is received from the user
      DELAY_BETWEEN_PLAYS: 5000,
      // The time after input to wait for the user to finish the sequence
      INPUT_TIMEOUT: 10000,
      // The default color to set the panels to when
      DEFAULT_SIMON_PANEL_COLOR: "white",
      // Wait while playing final sound
      TRANSITION_OUT_TIME: 10000
    };
  }

  getUserColor(username) {
    return this.COLORS.USERS[username];
  }
}

