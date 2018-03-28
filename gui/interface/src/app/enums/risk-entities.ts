'use strict';

export const RiskEntities =
    {
        general: {
            project_name: {
                type: 'Character',
                units: '',
                default: 'New Project',
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
            simulation_time: {
                type: 'Real',
                units: 's',
                'default': 0,
                help: '',
                pattern: '',
                valid_ranges: [
                    {
                        minInclusive: 0,
                        maxExclusive: '__'
                    }
                ],
                reasonable_ranges: [
                    {
                        minExclusive: '__',
                        maxExclusive: '__'
                    }
                ]
            },
            number_of_simulations: {
                type: 'Integer',
                units: '',
                'default': 5000,
                help: '',
                pattern: '',
                valid_ranges: [
                    {
                        minInclusive: 1,
                        maxExclusive: '__'
                    }
                ],
                reasonable_ranges: [
                    {
                        minExclusive: '3000',
                        maxExclusive: '20000'
                    }
                ]
            },
            indoor_temp: {
                type: 'Real',
                units: 'C',
                'default': 20,
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
            elevation: {
                type: 'Real',
                units: 'm',
                'default': 0,
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
            indoor_pressure: {
                type: 'Real',
                units: 'Pa',
                'default': 101325,
                help: '',
                pattern: '',
                valid_ranges: [
                    {
                        minInclusive: 0,
                        maxExclusive: '__'
                    }
                ],
                reasonable_ranges: [
                    {
                        minExclusive: '__',
                        maxExclusive: '__'
                    }
                ]
            },
            humidity: {
                type: 'Real',
                units: '%',
                'default': 40,
                help: '',
                pattern: '',
                valid_ranges: [
                    {
                        minInclusive: 0,
                        maxInclusive: 100
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
        building: {
            type: {
                type: 'Character',
                units: '',
                'default': '',
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
            has_fire_detectors: {
                type: 'Logical',
                units: '',
                'default': false,
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
            has_sprinklers: {
                type: 'Logical',
                units: '',
                'default': false,
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
            has_trained_staff: {
                type: 'Logical',
                units: '',
                'default': false,
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
            has_dso: {
                type: 'Logical',
                units: '',
                'default': false,
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
            alarming_level: {
                type: 'Character',
                units: '',
                'default': '1',
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
        sprinklers: {
            activation_temp: {
                type: 'Real',
                units: 'C',
                'default': '0',
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
            activation_obscuration: {
                type: 'Real',
                units: '',
                'default': '0',
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
            rti: {
                type: 'Real',
                units: '',
                'default': '0',
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
            spray_density: {
                type: 'Real',
                units: '',
                'default': '0',
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
        detectors: {
            rti: {
                type: 'Real',
                units: '',
                'default': '0',
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
            activation_temp: {
                type: 'Real',
                units: '',
                'default': '0',
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
            activation_obscuration: {
                type: 'Real',
                units: '',
                'default': '0',
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
        mvent: {
            flow: {
                type: 'Real',
                units: '',
                'default': '0',
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
            begin_dropoff_pressure: {
                type: 'Real',
                units: '',
                'default': '0',
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
            zero_flow_pressure: {
                type: 'Real',
                units: '',
                'default': '0',
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
            initial_opening_fraction: {
                type: 'Real',
                units: '',
                'default': '0',
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
            filter_efficiency: {
                type: 'Real',
                units: '',
                'default': '0',
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
        materials: {
            thickness_wall: {
                type: 'Real',
                units: '',
                'default': '0',
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
            thickness_ceiling: {
                type: 'Real',
                units: '',
                'default': '0',
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
            thickness_floor: {
                type: 'Real',
                units: '',
                'default': '0',
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
        evacuation: {
            number_of_people: {
                type: 'Integer',
                units: '',
                'default': '0',
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
            vertical_speed: {
                type: 'Real',
                units: '',
                'default': '0',
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
            horizontal_speed: {
                type: 'Real',
                units: '',
                'default': '0',
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
        window_open: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.11',
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
        plain_door_open: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.5',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.5',
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
        door_with_closer: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.14',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.86',
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
        electric_release_door: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.04',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.96',
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
        origin_of_fire: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.9',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.1',
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
        fire_detectors_trigger_temp: {
            var1: {
                type: 'Real',
                units: '',
                'default': '337',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '2',
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
        fire_detectors_failure: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.96',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.04',
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
        sprinkler_trigger_temp: {
            var1: {
                type: 'Real',
                units: '',
                'default': '337',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '3',
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
        sprinkler_failure: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.96',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.04',
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
        outdoor_temp: {
            var1: {
                type: 'Real',
                units: '',
                'default': '10',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '7',
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
        vertical_speed: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.8',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.2',
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
        horizontal_speed: {
            var1: {
                type: 'Real',
                units: '',
                'default': '1.2',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.2',
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
        alarm_time: {
            var1: {
                type: 'Real',
                units: '',
                'default': '3.7',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.5',
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
        fire_location: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '12',
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
        fire_hrr: {
            var1: {
                type: 'Real',
                units: '',
                'default': '1200',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '9000',
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
        fire_alpha: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.01',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.05',
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
        fire_co: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.01',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.043',
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
        fire_soot: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.11',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.17',
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
        pre_movement: {
            var1: {
                type: 'Real',
                units: '',
                'default': '7.15',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.215',
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
        density_room: {
            var1: {
                type: 'Real',
                units: '',
                'default': '5',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '2',
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
        density_corridor: {
            var1: {
                type: 'Real',
                units: '',
                'default': '20',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '2',
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
        alpha_speed: {
            var1: {
                type: 'Real',
                units: '',
                'default': '0.706',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.069',
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
        beta_speed: {
            var1: {
                type: 'Real',
                units: '',
                'default': '-0.057',
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
            var2: {
                type: 'Real',
                units: '',
                'default': '0.015',
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
        }
    }
