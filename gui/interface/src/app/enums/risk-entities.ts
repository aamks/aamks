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
                default: 0,
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
            outdoorTemperature: {
                type: 'Real',
                units: 'C',
                default: 20,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            outdoorTemperatureSd: {
                type: 'Real',
                units: 'C',
                default: 5,
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
                default: 'office',
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
                    units: '',
                    default: '0',
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                thicknessCeiling: {
                    type: 'Real',
                    units: '',
                    default: '0',
                    help: '',
                    pattern: '',
                    valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                    reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
                },
                thicknessFloor: {
                    type: 'Real',
                    units: '',
                    default: '0',
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
                units: '',
                default: false,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            hasSprinklers: {
                type: 'Logical',
                units: '',
                default: false,
                help: '',
                pattern: '',
                valid_ranges: [{ minInclusive: '__', maxExclusive: '__' }],
                reasonable_ranges: [{ minExclusive: '__', maxExclusive: '__' }]
            },
            hasTrainedStaff: {
                type: 'Logical',
                units: '',
                default: false,
                help: '',
                pattern: ''
            },
            hasVa: {
                type: 'Logical',
                units: '',
                default: false,
                help: '',
                pattern: ''
            },
            hasNshevs: {
                type: 'Logical',
                units: '',
                default: false,
                help: '',
                pattern: ''
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
                    default: 0,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                activationTemperatureSd: {
                    type: 'Real',
                    units: '',
                    default: 68,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                rti: {
                    type: 'Real',
                    units: '',
                    default: 0,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                sprayDensity: {
                    type: 'Real',
                    units: '',
                    default: 0,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                sprayDensitySd: {
                    type: 'Real',
                    units: '',
                    default: 5,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                notBrokenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
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
                    default: '0',
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                activationTemperature: {
                    type: 'Real',
                    units: '',
                    default: 0,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                activationTemperatureSd: {
                    type: 'Real',
                    units: '',
                    default: 5,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                activationObscuration: {
                    type: 'Real',
                    units: '',
                    default: '0',
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                activationObscurationSd: {
                    type: 'Real',
                    units: '',
                    default: 5,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                notBrokenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                }
            }
        },
        settings: {
            heatReleaseRate: {
                comment: { type: 'Character', units: '', default: 'desc', help: '' },
                maxHrr: {
                    type: 'Real',
                    units: '',
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                alphaMinModeMax: {
                    type: 'Real',
                    units: '',
                    default: [1, 3, 4],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
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
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                }
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
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                stai: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                room: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                hall: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
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
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                maxVSpeedMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                betaVMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                alphaVMeanAndSd: {
                    type: 'Real',
                    units: '',
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
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
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                meanAndSdOrdinaryRoom: {
                    type: 'Real',
                    units: '',
                    default: [500, 1200],
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                }
            },
            windowOpen: {
                comment: {
                    type: 'Character',
                    default: 'desc',
                    help: ''
                },
                setup: []
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
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                doorCloserDoorIsOpenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                standardDoorIsOpenProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
                vventsNoFailureProbability: {
                    type: 'Real',
                    units: '',
                    default: 0.4,
                    help: '',
                    pattern: '',
                    valid_ranges: [ { minInclusive: '__', maxExclusive: '__' } ],
                    reasonable_ranges: [ { minExclusive: '__', maxExclusive: '__' } ]
                },
            }
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
