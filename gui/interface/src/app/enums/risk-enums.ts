'use strict';

export const RiskEnums =
    {
        alarmType: [
            {
                label: '1',
                value: '1'
            },
            {
                label: '2',
                value: '2'
            }
        ],
        distType: [
            {
                label: 'Custom',
                value: 'custom'
            },
            {
                label: 'Normal',
                value: 'normal'
            },
            {
                label: 'Uniform',
                value: 'uniform'
            },
            {
                label: 'Binomial',
                value: 'binomial'
            },
            {
                label: 'Triangular',
                value: 'triangular'
            },
            {
                label: 'Gamma',
                value: 'gamma'
            },
            {
                label: 'Lognormal',
                value: 'lognormal'
            }
        ],
        alarming: [
            {
                label: 'Level A1',
                value: 'a1'
            },
            {
                label: 'Level A2',
                value: 'a2'
            },
            {
                label: 'Level A3',
                value: 'a3'
            }
        ],
        complexity: [
            {
                label: 'Level B1',
                value: 'b1'
            },
            {
                label: 'Level B2',
                value: 'b2'
            },
            {
                label: 'Level B3',
                value: 'b3'
            }
        ],
        managment: [
            {
                label: 'Level M1',
                value: 'm1'
            },
            {
                label: 'Level M2',
                value: 'm2'
            },
            {
                label: 'Level M3',
                value: 'm3'
            }
        ],
        materials: [
            {
                label: 'Gypsum',
                value: 'gypsum'
            },
            {
                label: 'Brick',
                value: 'brick'
            },
            {
                label: 'Concrete',
                value: 'concrete'
            }
        ],
        detectorType: [
            {
                label: 'Heat detector',
                value: 'heat'
            },
            {
                label: 'Smoke detector',
                value: 'smoke'
            }
        ],
        buildingType: [
            {
                label: 'Hotel',
                value: 'hotel',
                type: 'c1',
                fireGrowthRate: 1
            },
            {
                label: 'Retail',
                value: 'retail',
                type: 'c1',
                fireGrowthRate: 1
            },
            {
                label: 'Office',
                value: 'office',
                type: 'c1',
                fireGrowthRate: 1
            },
            {
                label: 'Cinema',
                value: 'cinema',
                type: 'c1',
                fireGrowthRate: 1
            },
            {
                label: 'Residence',
                value: 'residence',
                type: 'c1',
                fireGrowthRate: 1
            }
        ],
        preTimes: [
            {
                type: 'a',
                pre: {
                    m1: {
                        b1: { a1: { pre1: 30, pre2: 31 }, a2: { pre1: 60, pre2: 61 } },
                        b2: { a1: { pre1: 40, pre2: 41 }, a2: { pre1: 70, pre2: 71 } },
                        b3: { a1: { pre1: 50, pre2: 51 }, a2: { pre1: 80, pre2: 82 } }
                    },
                    m2: {
                        b1: { a1: { pre1: 3, pre2: 6 }, a2: { pre1: 9, pre2: 12 } },
                        b2: { a1: { pre1: 4, pre2: 7 }, a2: { pre1: 10, pre2: 13 } },
                        b3: { a1: { pre1: 5, pre2: 8 }, a2: { pre1: 11, pre2: 14 }, a3: { pre1: 30, pre2: 60 } }
                    },
                    m3: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    }
                }
            },
            {
                type: 'b',
                pre: {
                    m1: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 60, pre2: 90 }, a2: { pre1: 60, pre2: 90 } }
                    },
                    m2: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    },
                    m3: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    }
                }
            },
            {
                type: 'c1',
                pre: {
                    m1: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 60, pre2: 90 }, a2: { pre1: 60, pre2: 90 } }
                    },
                    m2: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    },
                    m3: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    }
                }
            },
            {
                type: 'c2',
                pre: {
                    m1: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 60, pre2: 90 }, a2: { pre1: 60, pre2: 90 } }
                    },
                    m2: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    },
                    m3: {
                        b1: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b2: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 } },
                        b3: { a1: { pre1: 30, pre2: 60 }, a2: { pre1: 30, pre2: 60 }, a3: { pre1: 30, pre2: 60 } }
                    }
                }
            },

        ]
    };
