'use strict';

export const FdsEntities =
    {
        BNDF: {
          CELL_CENTERED: {
            type: 'Logical',
            'default': [
              false
            ],
            help: 'Boundary file data are computed at the center of each surface cell, but they are linearly interpolated to cell corners and output to a file that is read by Smokeview. To prevent this from happening, set CELL_CENTERED=.TRUE.',
            pattern: '',
            valid_ranges: [
              {
                minInclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PART_ID: {
            type: 'Character',
            'default': [],
            help: 'Specify appropriate particle type related to an output quantity: ',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STATISTICS: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        CLIP: {
          MAXIMUM_DENSITY: {
            type: 'Real',
            units: 'kg/m^3',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAXIMUM_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MINIMUM_DENSITY: {
            type: 'Real',
            units: 'kg/m^3',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MINIMUM_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        CSVF: {
          UVWFILE: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        CTRL: {
          CONSTANT: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DELAY: {
            type: 'Real',
            units: 's',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DIFFERENTIAL_GAIN: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FUNCTION_TYPE: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INITIAL_STATE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INPUT_ID: {
            type: 'Char.Array',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INTEGRAL_GAIN: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LATCH: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ON_BOUND: {
            type: 'Character',
            'default': [
              'ctLOWER'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROPORTIONAL_GAIN: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SETPOINT: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TARGET_VALUE: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TRIP_DIRECTION: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        DEVC: {
          BYPASS_FLOWRATE: {
            type: 'Real',
            units: 'kg/s',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONVERSION_FACTOR: {
            type: 'Real',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COORD_FACTOR: {
            type: 'Real',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DELAY: {
            type: 'Real',
            units: 's',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEPTH: {
            type: 'Real',
            units: 'm',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DRY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DUCT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLOWRATE: {
            type: 'Real',
            units: 'kg/s',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HIDE_COORDINATES: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INITIAL_STATE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INIT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IOR: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LATCH: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MATL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NODE_ID: {
            type: 'Character(2)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NO_UPDATE_DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NO_UPDATE_CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ORIENTATION: {
            type: 'RealTriplet',
            'default': [
              0,0,-1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ORIENTATION_NUMBER: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OUTPUT: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PART_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PIPE_INDEX: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          POINTS: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY2: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY_RANGE: {
            type: 'RealPair',
            'default': [
              '-1e50,1e50'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RELATIVE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ROTATION: {
            type: 'Real',
            units: 'deg.',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SETPOINT: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STATISTICS: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STATISTICS_START: {
            type: 'Real',
            units: 's',
            'default': [
              'ctT'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOOTHING_FACTOR: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURF_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TIME_AVERAGED: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TRIP_DIRECTION: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          UNITS: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VELO_INDEX: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            'default': [
              0,1,0,1,0,1
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XYZ: {
            type: 'RealTriplet',
            'default': [
              0,0,0
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          X_ID: {
            type: 'Character',
            'default': [
              'ctID-x'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          Y_ID: {
            type: 'Character',
            'default': [
              'ctID-y'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          Z_ID: {
            type: 'Character',
            'default': [
              'ctID-z'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        DUMP: {
          CLIP_RESTART_FILES: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COLUMN_DUMP_LIMIT: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_COLUMN_LIMIT: {
            type: 'Integer',
            'default': [
              254
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_COLUMN_LIMIT: {
            type: 'Integer',
            'default': [
              254
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_BNDF: {
            type: 'Real',
            units: 's',
            'default': [
              '2,Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_CTRL: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_DEVC: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_DEVC_LINE: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/2'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_FLUSH: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_HRR: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_ISOF: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_MASS: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_PART: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_PL3D: {
            type: 'Real',
            units: 's',
            'default': [
              1.E10
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_PROF: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_RESTART: {
            type: 'Real',
            units: 's',
            'default': [
              200.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_SL3D: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/5'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_SLCF: {
            type: 'Real',
            units: 's',
            'default': [
              'Deltatct/NFRAMES'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EB_PART_FILE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLUSH_FILE_BUFFERS: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FILE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAXIMUM_PARTICLES: {
            type: 'Integer',
            'default': [
              1000000
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NFRAMES: {
            type: 'Integer',
            'default': [
              120
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PLOT3D_PART_ID: {
            type: 'Char.Quint',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PLOT3D_QUANTITY: {
            type: 'Char.Quint',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PLOT3D_SPEC_ID: {
            type: 'Char.Quint',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PLOT3D_VELO_INDEX: {
            type: 'Int.Quint',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RENDER_FILE: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SIG_FIGS: {
            type: 'Integer',
            'default': [
              8
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SIG_FIGS_EXP: {
            type: 'Integer',
            'default': [
              3
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOKE3D: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOKE3D_QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOKE3D_SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STATUS_FILES: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SUPPRESS_DIAGNOSTICS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          UVW_TIMER: {
            type: 'RealVector',
            units: 's',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VELOCITY_ERROR_FILE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          WRITE_XYZ: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        HEAD: {
          CHID: {
            type: 'Character',
            'default': [
              'Chid_out'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TITLE: {
            type: 'Character',
            'default': [
              'Simulation title'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        HOLE: {
          COLOR: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MESH_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MULT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RGB: {
            type: 'IntegerTriplet',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TRANSPARENCY: {
            type: 'Real',
            default: [1],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            'default': [
              0,1,0,1,0,1
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        HVAC: {
          AIRCOIL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          AMBIENT: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          AREA: {
            type: 'Real',
            units: 'm^2',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CLEAN_LOSS: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COOLANT_MASS_FLOW: {
            type: 'Real',
            units: 'kg/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COOLANT_SPECIFIC_HEAT: {
            type: 'Real',
            units: 'sikJ/(kg.K)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COOLANT_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DAMPER: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DIAMETER: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DUCT_ID: {
            type: 'CharacterArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EFFICIENCY: {
            type: 'RealArray',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FAN_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FILTER_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FIXED_Q: {
            type: 'Real',
            units: 'kW',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LEAK_ENTHALPY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LENGTH: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LOADING: {
            type: 'RealArray',
            units: 'kg',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LOADING_MULTIPLIER: {
            type: 'RealArray',
            units: '1/kg',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LOSS: {
            type: 'RealArray',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FLOW: {
            type: 'Real',
            units: 'kg/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAX_FLOW: {
            type: 'Real',
            units: 'm^3/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAX_PRESSURE: {
            type: 'Real',
            units: 'Pa',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NODE_ID: {
            type: 'CharacterDoublet',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PERIMETER: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REVERSE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ROUGHNESS: {
            type: 'Real',
            units: 'm',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'CharacterArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_AC: {
            type: 'Real',
            units: 's',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_FAN: {
            type: 'Real',
            units: 's',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_VF: {
            type: 'Real',
            units: 's',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TYPE_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VENT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VENT2_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VOLUME_FLOW: {
            type: 'Real',
            units: 'm^3/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XYZ: {
            type: 'RealTriplet',
            units: 'm',
            'default': [
              0,0,0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        INIT: {
          CELL_CENTERED: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DENSITY: {
            type: 'Real',
            units: 'kg/m^3',
            'default': [
              'Ambient'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DIAMETER: {
            type: 'Real',
            units: 'mum',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_INSERT: {
            type: 'Real',
            units: 's',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DX: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DY: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DZ: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEIGHT: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HRRPUV: {
            type: 'Real',
            units: 'kW/m^3',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FRACTION: {
            type: 'RealArray',
            units: 'kg/kg',
            'default': [
              'Ambient'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_PER_TIME: {
            type: 'Real',
            units: 'kg/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_PER_VOLUME: {
            type: 'Real',
            units: 'kg/m^3',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MULT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_PARTICLES: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_PARTICLES_PER_CELL: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PART_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PARTICLE_WEIGHT_FACTOR: {
            type: 'Real',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADIUS: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SHAPE: {
            type: 'Character',
            'default': [
              'BLOCK'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'CharacterArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              'ctTMPA'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          UVW: {
            type: 'RealTriplet',
            units: 'm/s',
            'default': [
              0,0,0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XYZ: {
            type: 'RealTriplet',
            'default': [
              0,0,0
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        ISOF: {
          QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REDUCE_TRIANGLES: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VALUE: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VELO_INDEX: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        MATL: {
          A: {
            type: 'Realarray',
            units: '1/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ABSORPTION_COEFFICIENT: {
            type: 'Real',
            units: '1/m',
            'default': [
              40000.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ALLOW_SHRINKING: {
            type: 'Logical',
            'default': [
              'cttrue'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ALLOW_SWELLING: {
            type: 'Logical',
            'default': [
              'cttrue'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BOILING_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              5000.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONDUCTIVITY: {
            type: 'Real',
            units: 'siW/(m.K)',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONDUCTIVITY_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DENSITY: {
            type: 'Real',
            units: 'kg/m^3',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          E: {
            type: 'Realarray',
            units: 'kJ/kmol',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EMISSIVITY: {
            type: 'Real',
            'default': [
              0.9
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GAS_DIFFUSION_DEPTH: {
            type: 'Realarray',
            units: 'm',
            'default': [
              0.001
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEATING_RATE: {
            type: 'Realarray',
            units: 'Cdeg/min',
            'default': [
              5.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_OF_COMBUSTION: {
            type: 'Realarray',
            units: 'kJ/kg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_OF_REACTION: {
            type: 'Realarray',
            units: 'kJ/kg',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MATL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NU_MATL: {
            type: 'Realarray',
            units: 'kg/kg',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NU_SPEC: {
            type: 'Realarray',
            units: 'kg/kg',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_REACTIONS: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_O2: {
            type: 'Realarray',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_S: {
            type: 'Realarray',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_T: {
            type: 'Realarray',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PCR: {
            type: 'Logicalarray',
            'default': [
              'ctfalse'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PYROLYSIS_RANGE: {
            type: 'Realarray',
            units: 'Cdeg',
            'default': [
              80.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REFERENCE_RATE: {
            type: 'Realarray',
            units: '1/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REFERENCE_TEMPERATURE: {
            type: 'Realarray',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPECIFIC_HEAT: {
            type: 'Real',
            units: 'sikJ/(kg.K)',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPECIFIC_HEAT_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THRESHOLD_SIGN: {
            type: 'Realarray',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THRESHOLD_TEMPERATURE: {
            type: 'Realarray',
            units: 'Cdeg',
            'default': [
              -273.15
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        MESH: {
          COLOR: {
            type: 'Character',
            'default': [
              'BLACK'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CYLINDRICAL: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_HUMANS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_Z_OFFSET: {
            type: 'Real',
            units: 'm',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: 'Help for MESH ID attribute',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IJK: {
            type: 'IntegerTriplet',
            'default': [
              10,10,10
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LEVEL: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MPI_PROCESS: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_THREADS: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MULT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RGB: {
            type: 'IntegerTriplet',
            'default': [
              0,0,0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            units: 'm',
            "default": [
              0,1,0,1,0,1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        MISC: {
          ALLOW_SURFACE_PARTICLES: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ALLOW_UNDERSIDE_PARTICLES: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ASSUMED_GAS_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ASSUMED_GAS_TEMPERATURE_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BAROCLINIC: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BNDF_DEFAULT: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CNF_CUTOFF: {
            type: 'Real',
            'default': [
              0.005
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CFL_MAX: {
            type: 'Real',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CFL_MIN: {
            type: 'Real',
            'default': [
              0.8
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CFL_VELOCITY_NORM: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CHECK_HT: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CHECK_VN: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CLIP_MASS_FRACTION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_DEARDORFF: {
            type: 'Real',
            'default': [
              0.1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_SMAGORINSKY: {
            type: 'Real',
            'default': [
              0.20
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_VREMAN: {
            type: 'Real',
            'default': [
              0.07
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONSTANT_SPECIFIC_HEAT_RATIO: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DNS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DRIFT_FLUX: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_HVAC: {
            type: 'Real',
            units: 's',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_MEAN_FORCING: {
            type: 'Real',
            units: 's',
            'default': [
              1.E10
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION_DRILL: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION_MC_MODE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_PRESSURE_ITERATIONS: {
            type: 'Integer',
            'default': [
              50
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_TIME_ITERATIONS: {
            type: 'Integer',
            'default': [
              50
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLUX_LIMITER: {
            type: 'Integer',
            'default': [
              2
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FORCE_VECTOR: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GAMMA: {
            type: 'Real',
            'default': [
              1.4
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GRAVITATIONAL_DEPOSITION: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GRAVITATIONAL_SETTLING: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GROUND_LEVEL: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GVEC: {
            type: 'RealTriplet',
            units: 'm/s^2',
            'default': [
              0,0,-9.81
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          H_F_REFERENCE_TEMPERATURE: {
            type: 'Real',
            units: 'sidegreeC',
            'default': [
              25.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HUMIDITY: {
            type: 'Real',
            units: '%',
            'default': [
              40.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INITIAL_UNMIXED_FRACTION: {
            type: 'Real',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LAPSE_RATE: {
            type: 'Real',
            units: 'sidegreeC/m',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAX_CHEMISTRY_ITERATIONS: {
            type: 'Integer',
            'default': [
              1000
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAX_LEAK_PATHS: {
            type: 'Integer',
            'default': [
              200
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAXIMUM_VISIBILITY: {
            type: 'Real',
            units: 'm',
            'default': [
              30
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MEAN_FORCING: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MPI_TIMEOUT: {
            type: 'Real',
            units: 's',
            'default': [
              10.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NOISE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NOISE_VELOCITY: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.005
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NO_EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OVERWRITE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PARTICLE_CFL: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PARTICLE_CFL_MAX: {
            type: 'Real',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          POROUS_FLOOR: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PR: {
            type: 'Real',
            'default': [
              0.5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROJECTION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          P_INF: {
            type: 'Real',
            units: 'Pa',
            'default': [
              101325
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_GX: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_GY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_GZ: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RESTART: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RESTART_CHID: {
            type: 'Character',
            'default': [
              'ctCHID'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RICHARDSON_ERROR_TOLERANCE: {
            type: 'Real',
            'default': [
              '1.0E-3'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RUN_AVG_FAC: {
            type: 'Real',
            'default': [
              0.5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SC: {
            type: 'Real',
            'default': [
              0.5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SECOND_ORDER_INTERPOLATED_BOUNDARY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SHARED_FILE_SYSTEM: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOKE_ALBEDO: {
            type: 'Real',
            'default': [
              0.3
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SOLID_PHASE_ONLY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STRATIFICATION: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SUPPRESSION: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEXTURE_ORIGIN: {
            type: 'RealTriplet',
            units: 'm',
            'default': [
              0,0,0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THERMOPHORETIC_DEPOSITION: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THICKEN_OBSTRUCTIONS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TMPA: {
            type: 'Real',
            units: 'sidegreeC',
            'default': [
              20.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TURBULENCE_MODEL: {
            type: 'Character',
            'default': [
              'DEARDORFF'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TURBULENT_DEPOSITION: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          U0: {
            type: 'Reals',
            units: 'm/s',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VISIBILITY_FACTOR: {
            type: 'Real',
            'default': [
              3
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VN_MAX: {
            type: 'Real',
            'default': [
              0.5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VN_MIN: {
            type: 'Real',
            'default': [
              0.4
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          Y_CO2_INFTY: {
            type: 'Real',
            units: 'kg/kg',
            'default': [
              0.000595
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          Y_O2_INFTY: {
            type: 'Real',
            units: 'kg/kg',
            'default': [
              0.232378
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        MULT: {
          DX: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DXB: {
            type: 'RealSextuplet',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DX0: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DY: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DY0: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DZ: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DZ0: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          I_LOWER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          I_UPPER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          J_LOWER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          J_UPPER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          K_LOWER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          K_UPPER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_LOWER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_UPPER: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        OBST: {
          ALLOW_VENT: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BNDF_FACE: {
            type: 'LogicalArray',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BNDF_OBST: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BULK_DENSITY: {
            type: 'Real',
            units: 'kg/m^3',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COLOR: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MESH_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MULT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OUTLINE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OVERLAY: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PERMIT_HOLE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REMOVABLE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RGB: {
            type: 'IntegerTriplet',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURF_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURF_ID6: {
            type: 'CharacterSextuplet',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURF_IDS: {
            type: 'CharacterTriplet',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEXTURE_ORIGIN: {
            type: 'RealTriplet',
            units: 'm',
            'default': [
              0,0,0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THICKEN: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TRANSPARENCY: {
            type: 'Real',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            'default': [
              0,1,0,1,0,1
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        PART: {
          AGE: {
            type: 'Real',
            units: 's',
            'default': [
              '1times10^5'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BREAKUP: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BREAKUP_CNF_RAMP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BREAKUP_DISTRIBUTION: {
            type: 'Character',
            'default': [
              'ROSIN...'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BREAKUP_GAMMA_D: {
            type: 'Real',
            'default': [
              2.4
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BREAKUP_RATIO: {
            type: 'Real',
            'default': [
              '3/7'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BREAKUP_SIGMA_D: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CHECK_DISTRIBUTION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CNF_RAMP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COLOR: {
            type: 'Character',
            'default': [
              'BLACK'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COMPLEX_REFRACTIVE_INDEX: {
            type: 'Real',
            'default': [
              0.01
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DENSE_VOLUME_FRACTION: {
            type: 'Real',
            units: 'm^3/m^3',
            'default': [
              '1times10^-5'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DIAMETER: {
            type: 'Real',
            'default': 0,
            units: 'mum',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DISTRIBUTION: {
            type: 'Character',
            'default': [
              'ROSIN...'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DRAG_COEFFICIENT: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DRAG_LAW: {
            type: 'Character',
            'default': [
              'SPHERE'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FREE_AREA_FRACTION: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GAMMA_D: {
            type: 'Real',
            'default': [
              2.4
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_OF_COMBUSTION: {
            type: 'Real',
            units: 'kJ/kg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HORIZONTAL_VELOCITY: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.2
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INITIAL_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              'ctTMPA'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASSLESS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAXIMUM_DIAMETER: {
            type: 'Real',
            units: 'mum',
            'default': [
              'Infinite'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MINIMUM_DIAMETER: {
            type: 'Real',
            units: 'mum',
            'default': [
              20.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MONODISPERSE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_STRATA: {
            type: 'Integer',
            'default': [
              7
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ORIENTATION: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PERMEABILITY: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROP_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITIES: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITIES_SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADIATIVE_PROPERTY_TABLE: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REAL_REFRACTIVE_INDEX: {
            type: 'Real',
            'default': [
              1.33
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RGB: {
            type: 'Integers',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SAMPLING_FACTOR: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SIGMA_D: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STATIC: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURFACE_TENSION: {
            type: 'Real',
            units: 'N/m',
            'default': [
              '7.28times10^4'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURF_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TURBULENT_DISPERSION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VERTICAL_VELOCITY: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        PRES: {
          CHECK_POISSON: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FISHPAK_BC: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAX_PRESSURE_ITERATIONS: {
            type: 'Integer',
            'default': [
              10
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PRESSURE_RELAX_TIME: {
            type: 'Real',
            units: 's',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RELAXATION_FACTOR: {
            type: 'Real',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VELOCITY_TOLERANCE: {
            type: 'Real',
            units: 'm/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        PROF: {
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FORMAT_INDEX: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IOR: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XYZ: {
            type: 'RealTriplet',
            'default': [
              0,0,0
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        PROP: {
          ACTIVATION_OBSCURATION: {
            type: 'Real',
            units: '%/m',
            'default': [
              3.24
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ACTIVATION_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              74.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ALPHA_C: {
            type: 'Real',
            'default': [
              1.8
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ALPHA_E: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BEAD_DENSITY: {
            type: 'Real',
            units: 'kg/m^3',
            'default': [
              8908.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BEAD_DIAMETER: {
            type: 'Real',
            units: 'm',
            'default': [
              0.001
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BEAD_EMISSIVITY: {
            type: 'Real',
            'default': [
              0.85
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BEAD_HEAT_TRANSFER_COEFFICIENT: {
            type: 'Real',
            units: 'siW/(m^2.K)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BEAD_SPECIFIC_HEAT: {
            type: 'Real',
            units: 'sikJ/(kg.K)',
            'default': [
              0.44
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BETA_C: {
            type: 'Real',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BETA_E: {
            type: 'Real',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CHARACTERISTIC_VELOCITY: {
            type: 'Real',
            units: 'm/s',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_FACTOR: {
            type: 'Real',
            units: '(m/s)^1/2',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLOW_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLOW_RATE: {
            type: 'Real',
            units: 'L/min',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLOW_TAU: {
            type: 'Real',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GAUGE_EMISSIVITY: {
            type: 'Real',
            'default': [
              0.9
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GAUGE_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              'ctTMPA'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INITIAL_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              'ctTMPA'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          K_FACTOR: {
            type: 'Real',
            units: 'siL/(min.bar^ha)',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PATH_LENGTH: {
            type: 'Real',
            units: 'm',
            'default': [
              1.8
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FLOW_RATE: {
            type: 'Real',
            units: 'kg/s',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OFFSET: {
            type: 'Real',
            units: 'm',
            'default': [
              0.05
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OPERATING_PRESSURE: {
            type: 'Real',
            units: 'bar',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ORIFICE_DIAMETER: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          P0: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PARTICLES_PER_SECOND: {
            type: 'Integer',
            'default': [
              5000
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PARTICLE_VELOCITY: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PART_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_END: {
            type: 'Real',
            units: 's',
            'default': [
              'ctT_END'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_HISTOGRAM: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_HISTOGRAM_CUMULATIVE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_HISTOGRAM_LIMITS: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_HISTOGRAM_NBINS: {
            type: 'Integer',
            'default': [
              10
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_INTEGRATE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_M: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_N: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_NORMALIZE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_RADIUS: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PDPA_START: {
            type: 'Real',
            units: 's',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PRESSURE_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RTI: {
            type: 'Real',
            units: 'sqrtsim.s',
            'default': [
              100.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOKEVIEW_ID: {
            type: 'Char.Array',
            'default': 'sensor',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SMOKEVIEW_PARAMETERS: {
            type: 'Char.Array',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPRAY_ANGLE: {
            type: 'RealPair',
            units: 'deg.',
            'default': [
              60.,75.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPRAY_PATTERN_BETA: {
            type: 'Integer',
            units: 'deg.',
            'default': [
              5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPRAY_PATTERN_MU: {
            type: 'Integer',
            units: 'deg.',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPRAY_PATTERN_SHAPE: {
            type: 'Character',
            'default': [
              'gaussian'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPRAY_PATTERN_TABLE: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VELOCITY_COMPONENT: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        RADI: {
          ANGLE_INCREMENT: {
            type: 'Integer',
            'default': [
              5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BAND_LIMITS: {
            type: 'RealArray',
            units: 'mum',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          KAPPA0: {
            type: 'Real',
            units: '1/m',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MIE_MINIMUM_DIAMETER: {
            type: 'Real',
            units: 'mum',
            'default': [
              0.5
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MIE_MAXIMUM_DIAMETER: {
            type: 'Real',
            units: 'mum',
            'default': [
              '1.5timesD'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MIE_NDG: {
            type: 'Integer',
            'default': [
              50
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NMIEANG: {
            type: 'Integer',
            'default': [
              15
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NUMBER_INITIAL_ITERATIONS: {
            type: 'Integer',
            'default': [
              10
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NUMBER_RADIATION_ANGLES: {
            type: 'Integer',
            'default': [
              100
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PATH_LENGTH: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADIATION: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADTMP: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              900
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TIME_STEP_INCREMENT: {
            type: 'Integer',
            'default': [
              3
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          WIDE_BAND_MODEL: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        RAMP: {
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          F: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NUMBER_INTERPOLATION_POINTS: {
            type: 'Integer',
            'default': [
              5000
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          T: {
            type: 'Real',
            units: 's or deg C',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          X: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        REAC: {
          A: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          AUTO_IGNITION_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C: {
            type: 'Real',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CHECK_ATOM_BALANCE: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CO_YIELD: {
            type: 'Real',
            units: 'kg/kg',
            'default': [
              0.01
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CRITICAL_FLAME_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              1327
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          E: {
            type: 'Real',
            units: 'kJ/kmol',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EPUMO2: {
            type: 'Real',
            units: 'kJ/kg',
            'default': [
              13100
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EQUATION: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FORMULA: {
            type: 'Character',
            'default': [''],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FUEL: {
            type: 'Character',
            'default': [''],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FUEL_RADCAL_ID: {
            type: 'Character',
            'default': [
              'methane'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          H: {
            type: 'Real',
            'default': [ 1.75 ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_OF_COMBUSTION: {
            type: 'Real',
            'default': [
              26200
            ],
            units: 'kJ/kg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [
              'FOAM'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IDEAL: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NU: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_S: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_T: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          O: {
            type: 'Real',
            'default': [
              0.25
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADIATIVE_FRACTION: {
            type: 'Real',
            'default': [
              0.34
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REAC_ATOM_ERROR: {
            type: 'Real',
            units: 'atoms',
            'default': [
              '1.E-5'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REAC_MASS_ERROR: {
            type: 'Real',
            units: 'kg/kg',
            'default': [
              '1.E-4'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SOOT_H_FRACTION: {
            type: 'Real',
            'default': [
              0.1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SOOT_YIELD: {
            type: 'Real',
            units: 'kg/kg',
            'default': [
              0.13
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID_N_S: {
            type: 'Char.Array',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID_NU: {
            type: 'Char.Array',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THIRD_BODY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        SLCF: {
          CELL_CENTERED: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MAXIMUM_VALUE: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MESH_NUMBER: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MINIMUM_VALUE: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PART_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PBX: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PBY: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PBZ: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          QUANTITY2: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VECTOR: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VELO_INDEX: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        SPEC: {
          AEROSOL: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ALIAS: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BACKGROUND: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONDUCTIVITY: {
            type: 'Real',
            units: 'siW/(m.K)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONDUCTIVITY_SOLID: {
            type: 'Real',
            units: 'siW/(m.K)',
            'default': [
              0.26
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DENSITY_LIQUID: {
            type: 'Real',
            units: 'kg/m^3',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DENSITY_SOLID: {
            type: 'Real',
            units: 'kg/m^3',
            'default': [
              1800.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DIFFUSIVITY: {
            type: 'Real',
            units: 'm^2/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ENTHALPY_OF_FORMATION: {
            type: 'Real',
            units: 'kJ/mol',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EPSILONKLJ: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FIC_CONCENTRATION: {
            type: 'Real',
            units: 'ppm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FLD_LETHAL_DOSE: {
            type: 'Real',
            units: 'ppmtimesmin',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FORMULA: {
            type: 'Character',
            'default': [
              ''
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_OF_VAPORIZATION: {
            type: 'Real',
            units: 'kJ/kg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          H_V_REFERENCE_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LUMPED_COMPONENT_ONLY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_EXTINCTION_COEFFICIENT: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FRACTION: {
            type: 'RealArray',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FRACTION_0: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MEAN_DIAMETER: {
            type: 'Real',
            units: 'm',
            'default': [
              '1.E-6'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MELTING_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MW: {
            type: 'Real',
            units: 'g/mol',
            'default': [
              29.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PR_GAS: {
            type: 'Real',
            'default': [
              'ctPR'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PRIMITIVE: {
            type: 'Logical',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADCAL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_CP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_CP_L: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_D: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_G_F: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_K: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_MU: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REFERENCE_ENTHALPY: {
            type: 'Real',
            units: 'kJ/kg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REFERENCE_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              25.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SIGMALJ: {
            type: 'Real',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'CharacterArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPECIFIC_HEAT: {
            type: 'Real',
            units: 'sikJ/(kg.K)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPECIFIC_HEAT_LIQUID: {
            type: 'Real',
            units: 'sikJ/(kg.K)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VAPORIZATION_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VISCOSITY: {
            type: 'Real',
            units: 'sikg/(m.s)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VOLUME_FRACTION: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        SURF: {
          ADIABATIC: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BACKING: {
            type: 'Character',
            'default': [
              'EXPOSED'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          BURN_AWAY: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CELL_SIZE_FACTOR: {
            type: 'Real',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_FORCED_CONSTANT: {
            type: 'Real',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_FORCED_PR_EXP: {
            type: 'Real',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_FORCED_RE: {
            type: 'Real',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_FORCED_RE_EXP: {
            type: 'Real',
            'default': [
              0.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_HORIZONTAL: {
            type: 'Real',
            'default': [
              1.52
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          C_VERTICAL: {
            type: 'Real',
            'default': [
              1.31
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          COLOR: {
            type: 'Character',
            'default': [
              'RED'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONVECTION_LENGTH_SCALE: {
            type: 'Real',
            units: 'm',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONVECTIVE_HEAT_FLUX: {
            type: 'Real',
            units: 'sikW/m^2',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CONVERT_VOLUME_TO_MASS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          'default': {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DT_INSERT: {
            type: 'Real',
            units: 's',
            'default': [
              0.01
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EMISSIVITY: {
            type: 'Real',
            'default': [
              0.9
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EMISSIVITY_BACK: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_DEFAULT: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EXTERNAL_FLUX: {
            type: 'Real',
            units: 'sikW/m^2',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          E_COEFFICIENT: {
            type: 'Real',
            units: 'sim^2/(kg.s)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          FREE_SLIP: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          GEOMETRY: {
            type: 'Character',
            'default': [
              'CARTESIAN'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_OF_VAPORIZATION: {
            type: 'Real',
            units: 'kJ/kg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_TRANSFER_COEFFICIENT: {
            type: 'Real',
            units: 'siW/(m^2.K)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HEAT_TRANSFER_MODEL: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          HRRPUA: {
            type: 'Real',
            units: 'sikW/m^2',
            'default': [
              100.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IGNITION_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              5000.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INNER_RADIUS: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          INTERNAL_HEAT_SOURCE: {
            type: 'RealArray',
            units: 'kW/m^3',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LAYER_DIVIDE: {
            type: 'Real',
            'default': [
              'ctN_LAYERS/2'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LEAK_PATH: {
            type: 'Int.Pair',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LENGTH: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FLUX: {
            type: 'Real',
            default: 0,
            units: 'kg/(m^2s)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FLUX_TOTAL: {
            type: 'Real',
            'default': 0,
            units: 'kg/(m^2s)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FLUX_VAR: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_FRACTION: {
            type: 'Real',
            'default': 0,
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MASS_TRANSFER_COEFFICIENT: {
            type: 'Real',
            units: 'm/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MATL_ID: {
            type: 'Char.Array',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MATL_MASS_FRACTION: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MINIMUM_LAYER_THICKNESS: {
            type: 'Real',
            units: 'm',
            'default': [
              '1.E-6'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MLRPUA: {
            type: 'Real',
            units: 'sikg/(m^2.s)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_LAYER_CELLS_MAX: {
            type: 'IntegerArray',
            'default': [
              1000
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NET_HEAT_FLUX: {
            type: 'Real',
            units: 'kW/m^2',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NO_SLIP: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          NPPC: {
            type: 'Integer',
            'default': [
              1
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PARTICLE_MASS_FLUX: {
            type: 'Real',
            units: 'sikg/(m^2.s)',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PART_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PLE: {
            type: 'Real',
            'default': [
              0.3
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PROFILE: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RADIUS: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_EF: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_MF: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_PART: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_Q: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_T: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_T_I: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_V: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_V_X: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_V_Y: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RAMP_V_Z: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RGB: {
            type: 'Int.Triplet',
            'default': [
              255,204,102
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ROUGHNESS: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPEC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPREAD_RATE: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.05
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          STRETCH_FACTOR: {
            type: 'Real',
            'default': [
              2.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_EF: {
            type: 'Real',
            units: 's',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_MF: {
            type: 'Real',
            units: 's',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_PART: {
            type: 'Real',
            units: 's',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_Q: {
            type: 'Real',
            units: 's',
            'default': [ 1. ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_T: {
            type: 'Real',
            units: 's',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TAU_V: {
            type: 'Real',
            units: 's',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEXTURE_HEIGHT: {
            type: 'Real',
            units: 'm',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEXTURE_MAP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEXTURE_WIDTH: {
            type: 'Real',
            units: 'm',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TGA_ANALYSIS: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TGA_FINAL_TEMPERATURE: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              800.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TGA_HEATING_RATE: {
            type: 'Real',
            units: 'Cdeg/min',
            'default': [
              5.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          THICKNESS: {
            type: 'RealArray',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TMP_BACK: {
            type: 'Real',
            units: 'Cdeg',
            'default': [
              20.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TMP_FRONT: {
            type: 'Real',
            units: '^{\\circ}C',
            default: 20.,
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TMP_INNER: {
            type: 'RealArray',
            units: 'Cdeg',
            'default': [
              20.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TRANSPARENCY: {
            type: 'Real',
            default: 1.,
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VEL: {
            type: 'Real',
            default: 0,
            units: 'm/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VEL_BULK: {
            type: 'Real',
            units: 'm/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VEL_GRAD: {
            type: 'Real',
            units: '1/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VEL_T: {
            type: 'RealPair',
            'default': [
              0,0,0
            ],
            units: 'm/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VOLUME_FLOW: {
            type: 'Real',
            default: 0,
            units: 'm^3/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          WIDTH: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XYZ: {
            type: 'RealTriplet',
            'default': [
              0,0,0
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          Z0: {
            type: 'Real',
            units: 'm',
            'default': [
              10.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        TABL: {
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TABLE_DATA: {
            type: 'RealArray',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        TIME: {
          DT: {
            type: 'Real',
            units: 's',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_DT_FLOWFIELD: {
            type: 'Real',
            units: 's',
            'default': [
              0.01
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVAC_DT_STEADY_STATE: {
            type: 'Real',
            units: 's',
            'default': [
              0.05
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LIMITING_DT_RATIO: {
            type: 'Real',
            'default': [
              0.0001
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LOCK_TIME_STEP: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RESTRICT_TIME_STEP: {
            type: 'Logical',
            'default': [
              true
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          T_BEGIN: {
            type: 'Real',
            units: 's',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__',
                minInclusive: 0,
                maxInclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          T_END: {
            type: 'Real',
            units: 's',
            'default': [
              1200.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TIME_SHRINK_FACTOR: {
            type: 'Real',
            'default': [
              1.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          WALL_INCREMENT: {
            type: 'Integer',
            'default': [
              2
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        TRNX: {
          CC: {
            type: 'Real',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IDERIV: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MESH_NUMBER: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PC: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        VENT: {
          COLOR: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          CTRL_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DEVC_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          DYNAMIC_PRESSURE: {
            type: 'Real',
            units: 'Pa',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          EVACUATION: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          IOR: {
            type: 'Integer',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          L_EDDY: {
            type: 'Real',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          L_EDDY_IJ: {
            type: 'RealArray',
            units: 'm',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MB: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MESH_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          MULT_ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          N_EDDY: {
            type: 'Integer',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          OUTLINE: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PBX: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PBY: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PBZ: {
            type: 'Real',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PRESSURE_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          REYNOLDS_STRESS: {
            type: 'RealArray',
            units: 'm^2/s^2',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          RGB: {
            type: 'IntegerTriplet',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SPREAD_RATE: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.05
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          SURF_ID: {
            type: 'Character',
            'default': [
              'INERT'
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TEXTURE_ORIGIN: {
            type: 'RealTriplet',
            units: 'm',
            'default': [
              0,0,0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TMP_EXTERIOR: {
            type: 'Real',
            units: 'Cdeg',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TMP_EXTERIOR_RAMP: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          TRANSPARENCY: {
            type: 'Real',
            'default': [
              1.0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          UVW: {
            type: 'RealTriplet',
            'default': [
              0,0,0
            ],
            units: 'm/s',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          VEL_RMS: {
            type: 'Real',
            units: 'm/s',
            'default': [
              0.
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            'default': [
              0,1,0,1,0,0
            ],
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XYZ: {
            type: 'RealTriplet',
            'default': [
              0,0,0
            ],
            units: 'm',
            help: 'XYZ help',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        },
        ZONE: {
          ID: {
            type: 'Character',
            'default': [],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          LEAK_AREA: {
            type: 'Real',
            units: 'm^2',
            'default': [
              0
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          PERIODIC: {
            type: 'Logical',
            'default': [
              false
            ],
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          },
          XB: {
            type: 'RealSextuplet',
            units: 'm',
            help: '',
            pattern: '',
            valid_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ],
            reasonable_ranges: [
              {
                minExclusive: '__',
                maxExclusive: '__'
              }
            ]
          }
        }
}
