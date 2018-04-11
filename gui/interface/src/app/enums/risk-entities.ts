'use strict';

export const RiskEntities =
    {
        general: {
            projectName: {
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
            simulationTime: {
                type: 'Real',
                units: 's',
                default: 0,
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
            numberOfSimulations: {
                type: 'Integer',
                units: '',
                default: 5000,
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
            indoorTemperature: {
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
            indoorPressure: {
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
        characteristic: {
            type: {
                type: 'Character',
                units: '',
                default: 'office',
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
            complexity: {
                type: 'Character',
                units: '',
                default: 'b1',
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
            managment: {
                type: 'Character',
                units: '',
                default: 'm1',
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
        infrastructure: {
            hasDetectors: {
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
            hasSprinklers: {
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
            hasTrainedStaff: {
                type: 'Logical',
                units: '',
                'default': false,
                help: '',
                pattern: ''
            },
            hasVa: {
                type: 'Logical',
                units: '',
                'default': false,
                help: '',
                pattern: ''
            },
            has_nshevs: {
                type: 'Logical',
                units: '',
                'default': false,
                help: '',
                pattern: ''
            },
            alarming_level: {
                type: 'Character',
                units: '',
                'default': '1',
                help: '',
                pattern: ''
            }
        },
        sprinklers: {
            activationTemperature: {
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
            activationObscuration: {
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
            sprayDensity: {
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
            activationTemperature: {
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
            activationObscuration: {
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
        nshevs: {
            activationTime: {
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
            beginDropoffPressure: {
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
            zeroFlowPressure: {
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
            initialOpeningFraction: {
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
            filterEfficiency: {
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
            thicknessWall: {
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
            thicknessCeiling: {
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
            thicknessFloor: {
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
            numberOfPeople: {
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
            verticalSpeed: {
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
            horizontalSpeed: {
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
        windowOpen: {
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
        plainDoorOpen: {
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
        doorWithCloser: {
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
        electricReleaseDoor: {
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
        originOfFire: {
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
        fireDetectorsTriggerTemperature: {
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
        fireDetectorsFailure: {
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
        sprinklerTriggerTemperature: {
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
        sprinklerFailure: {
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
        outdoorTemp: {
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
        verticalSpeed: {
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
        horizontalSpeed: {
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
        alarmTime: {
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
        fireLocation: {
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
        fireHrr: {
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
        fireAlpha: {
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
        fireCo: {
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
        fireSoot: {
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
        preMovement: {
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
        densityRoom: {
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
        densityCorridor: {
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
        alphaSpeed: {
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
        betaSpeed: {
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
