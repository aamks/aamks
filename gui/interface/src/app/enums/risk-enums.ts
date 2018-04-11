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
