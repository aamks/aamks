'use strict';

export const FdsGuiEntities =
  {
    MESH: {
      SIZE: {
        type: 'Realtriplet',
        units: 'm',
        'default': [
          0.1, 0.1, 0.1
        ],
        help: 'Mesh cell size help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxExclusive: '__'
          }
        ],
        reasonable_ranges: [
          {
            minExclusive: '__',
            maxExclusive: '__'
          }
        ]
      },
      OPEN: {
        type: 'LogicalSextuplet',
        units: '',
        'default': [
          false,
          false,
          false,
          false,
          false,
          false
        ],
        help: 'Mesh open help',
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
      }
    },
    REAC: {
      RADCAL_ID: {
        type: 'Character',
        units: '',
        'default': [
          'methane'
        ],
        help: '',
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
      SPEC: {
        type: 'Character',
        units: '',
        'default': [
          'ethylene'
        ],
        help: '',
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
      }
    },
    RAMP: {
      TYPE: {
        type: 'Character',
        units: '',
        'default': [
          'matl'
        ],
        help: 'Ramp type help',
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
      T: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'T help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
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
      F: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'F help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      CONDUCTIVITY_RAMP_F: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'CRF help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
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
      SPECIFIC_HEAT_RAMP_F: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'F help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      FRACTION: {
        type: 'Real',
        units: '',
        'default': [
          1
        ],
        help: 'Material fraction in layer help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '1.1'
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
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'Layer thickness help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
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
      HRR_VALUE: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'HRRPUA help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
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
      HRR: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'HRR help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
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
      SPREAD_RATE: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'HRRPUA help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
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
      ALPHA: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'HRRPUA help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      ELEVATION: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'Elev help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      ELEVATION: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'Elev help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      ELEVATION: {
        type: 'Real',
        units: '',
        'default': [
          0
        ],
        help: 'Elev help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      DIRECTION: {
        type: 'Character',
        units: '',
        'default': [
          '+x'
        ],
        help: 'Direction help',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '0',
            maxInclusive: '__'
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
      TYPE: {
        type: 'Character',
        units: '',
        'default': [
          'basic'
        ],
        help: '',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '__',
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
      GEOMETRICAL_TYPE: {
        type: 'Character',
        units: '',
        'default': [
          'point'
        ],
        help: '',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '__',
            maxInclusive: '__'
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
      TYPE: {
        type: 'Character',
        units: '',
        'default': [
          'sprinkler'
        ],
        help: '',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '__',
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
      FLOW_TYPE: {
        type: 'Character',
        units: '',
        'default': [
          'flowRate'
        ],
        help: '',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '__',
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
      SMOKE_DETECTOR_MODEL: {
        type: 'Character',
        units: '',
        'default': [
          'heskestad'
        ],
        help: '',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '__',
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
      SMOKE_DETECTOR_MODEL_TYPE: {
        type: 'Character',
        units: '',
        'default': [
          'cleary_ionization_i1'
        ],
        help: '',
        pattern: '',
        valid_ranges: [
          {
            minInclusive: '__',
            maxInclusive: '__'
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
