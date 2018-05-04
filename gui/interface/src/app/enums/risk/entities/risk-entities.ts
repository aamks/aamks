'use strict';

export const RiskEntities =
    {
        general: {
            projectName: {
                type: 'Character',
                default: 'New Project',
                help: '',
            },
            simulationTime: {
                type: 'Real',
                units: 's',
                default: 1200,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: 0, maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            numberOfSimulations: {
                type: 'Integer',
                units: '',
                default: 5000,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: 1, maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '3000', maxExclusive: '20000' }]
            },
            indoorTemperature: {
                type: 'Real',
                units: 'C',
                default: 20,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            indoorTemperatureSd: {
                type: 'Real',
                units: 'C',
                default: 5,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            outdoorTemperature: {
                type: 'Real',
                units: 'C',
                default: 10.75,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            outdoorTemperatureSd: {
                type: 'Real',
                units: 'C',
                default: 6.5,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            elevation: {
                type: 'Real',
                units: 'm',
                default: 0,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            indoorPressure: {
                type: 'Real',
                units: 'Pa',
                default: 101325,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: 0, maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            humidity: {
                type: 'Real',
                units: '%',
                default: 40,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: 0, maxInclusive: 100 }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            }
        },
        characteristic: {
            type: {
                type: 'Character',
                default: 'office1',
                help: '',
            },
            complexity: {
                type: 'Character',
                default: 'b1',
                help: '',
            },
            managment: {
                type: 'Character',
                default: 'm1',
                help: '',
            },
            materials: {
                thicknessWall: {
                    type: 'Real',
                    units: 'm',
                    default: '0.2',
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                thicknessCeiling: {
                    type: 'Real',
                    units: 'm',
                    default: '0.3',
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                thicknessFloor: {
                    type: 'Real',
                    units: 'm',
                    default: '0.3',
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                }
            },
        },
        infrastructure: {
            hasDetectors: {
                type: 'Logical',
                default: false,
                help: '',
            },
            hasSprinklers: {
                type: 'Logical',
                default: false,
                help: '',
            },
            hasTrainedStaff: {
                type: 'Logical',
                default: false,
                help: '',
            },
            hasVa: {
                type: 'Logical',
                default: false,
                help: '',
                pattern: ''
            },
            hasNshevs: {
                type: 'Logical',
                default: false,
                help: '',
            },
            alarming_level: {
                type: 'Character',
                default: '1',
                help: '',
            },
            sprinklers: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                activationTemperature: {
                    type: 'Real',
                    units: 'C',
                    default: 68,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                activationTemperatureSd: {
                    type: 'Real',
                    units: '',
                    default: 3,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                rti: {
                    type: 'Real',
                    units: '',
                    default: 50,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                sprayDensity: {
                    type: 'Real',
                    units: '',
                    default: 0.0005,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                sprayDensitySd: {
                    type: 'Real',
                    units: '',
                    default: 0.0001,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                notBrokenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.96,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
            },
            detectors: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                type: {
                    type: 'Character',
                    default: 'heat',
                    help: ''
                },
                rti: {
                    type: 'Real',
                    units: '',
                    default: 50,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                activationTemperature: {
                    type: 'Real',
                    units: '',
                    default: 68,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                activationTemperatureSd: {
                    type: 'Real',
                    units: '',
                    default: 5,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                activationObscuration: {
                    type: 'Real',
                    units: '',
                    default: 0,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                activationObscurationSd: {
                    type: 'Real',
                    units: '',
                    default: 5,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                notBrokenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.96,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                }
            }
        },
        settings: {
            heatReleaseRate: {
                comment: { type: 'Character', units: '', default: 'desc', help: '' },
                hrrpuaMinModeMax: {
                    type: 'Real',
                    units: '',
                    default: [300, 1000, 1300],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                alphaMinModeMax: {
                    type: 'Real',
                    units: '',
                    default: [0.0029, 0.047, 0.188],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
            },
            originOfFire: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                fireStartsInRoomProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.8,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                }
            },
            cConst: {
                type: 'Real',
                units: '',
                default: 58,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            evacueesConcentration: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                cor: {
                    type: 'Real',
                    units: '',
                    default: 50,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                stai: {
                    type: 'Real',
                    units: '',
                    default: 50,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                room: {
                    type: 'Real',
                    units: '',
                    default: 7,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                hall: {
                    type: 'Real',
                    units: '',
                    default: 50,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                }
            },
            evacueesSpeedParams: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                maxHSpeedMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [120, 20],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                maxVSpeedMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [80, 20],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                betaVMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [-0.057, 0.015],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                alphaVMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [0.706, 0.069],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                }
            },
            preEvacuationTime: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                meanAndSdRoomOfFireOrigin: {
                    type: 'Real',
                    units: '',
                    default: [2.74, 0.58],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                meanAndSdOrdinaryRoom: {
                    type: 'Real',
                    units: '',
                    default: [5.246, 0.101],
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                }
            },
            windowOpen: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                setup: [
                    { "outside_temperature_range": [-99999, -5], "window_is_quarter_open_probability": 0, "window_is_full_open_probability": 0.11 },
                    { "outside_temperature_range": [-5, 15], "window_is_quarter_open_probability": 0, "window_is_full_open_probability": 0.5 },
                    { "outside_temperature_range": [15, 27], "window_is_quarter_open_probability": 0.45, "window_is_full_open_probability": 0.45 },
                    { "outside_temperature_range": [27, 99999], "window_is_quarter_open_probability": 0, "window_is_full_open_probability": 0.5 }
                ]
            },
            doorOpen: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                electroMagnetDoorIsOpenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.04,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                doorCloserDoorIsOpenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.14,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                standardDoorIsOpenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.5,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                vventsNoFailureProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.96,
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
            },
            cfastStaticRecords: []
        },





        // For futher development
        nshevs: {
            activationTime: {
                type: 'Real',
                units: '',
                default: '0',
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
                default: '0',
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
            beginDropoffPressure: {
                type: 'Real',
                units: '',
                default: '0',
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
            zeroFlowPressure: {
                type: 'Real',
                units: '',
                default: '0',
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
            initialOpeningFraction: {
                type: 'Real',
                units: '',
                default: '0',
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
            filterEfficiency: {
                type: 'Real',
                units: '',
                default: '0',
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
    }
