'use strict';

export const FdsEnums =
    {
        color: [
            { label: 'Aquamarine', value: 'AQUAMARINE' },
            { label: 'Antique white', value: 'ANTIQUE WHITE' },
            { label: 'Beige', value: 'BEIGE' },
            { label: 'Black', value: 'BLACK' },
            { label: 'Blue', value: 'BLUE' },
            { label: 'Blue violet', value: 'BLUE VIOLET' },
            { label: 'Brick', value: 'BRICK' },
            { label: 'Brown', value: 'BROWN' },
            { label: 'Burnt sienna', value: 'BURNT SIENNA' },
            { label: 'Burnt umber', value: 'BURNT UMBER' },
            { label: 'Cadet blue', value: 'CADET BLUE' },
            { label: 'Chocolate', value: 'CHOCOLATE' },
            { label: 'Cobalt', value: 'COBALT' },
            { label: 'Coral', value: 'CORAL' },
            { label: 'Cyan', value: 'CYAN' },
            { label: 'Dimgray', value: 'DIMGRAY' },
            { label: 'Emerald green', value: 'EMERALD GREEN' },
            { label: 'Firebrick', value: 'FIREBRICK' },
            { label: 'Flesh', value: 'FLESH' },
            { label: 'Forest green', value: 'FOREST GREEN' },
            { label: 'Gold', value: 'GOLD' },
            { label: 'Goldenrod', value: 'GOLDENROD' },
            { label: 'Gray', value: 'GRAY' },
            { label: 'Green', value: 'GREEN' },
            { label: 'Green yellow', value: 'GREEN YELLOW' },
            { label: 'Honeydew', value: 'HONEYDEW' },
            { label: 'Hot pink', value: 'HOT PINK' },
            { label: 'Indian red', value: 'INDIAN RED' },
            { label: 'Indigo', value: 'INDIGO' },
            { label: 'Ivory', value: 'IVORY' },
            { label: 'Ivory black', value: 'IVORY BLACK' },
            { label: 'Kelly green', value: 'KELLY GREEN' },
            { label: 'Khaki', value: 'KHAKI' },
            { label: 'Lavender', value: 'LAVENDER' },
            { label: 'Lime green', value: 'LIME GREEN' },
            { label: 'Magenta', value: 'MAGENTA' },
            { label: 'Maroon', value: 'MAROON' },
            { label: 'Melon', value: 'MELON' },
            { label: 'Midnight blue', value: 'MIDNIGHT BLUE' },
            { label: 'Mint', value: 'MINT' },
            { label: 'Navy', value: 'NAVY' },
            { label: 'Olive', value: 'OLIVE' },
            { label: 'Olive drab', value: 'OLIVE DRAB' },
            { label: 'Orange', value: 'ORANGE' },
            { label: 'Orange red', value: 'ORANGE RED' },
            { label: 'Orchid', value: 'ORCHID' },
            { label: 'Pink', value: 'PINK' },
            { label: 'Powder blue', value: 'POWDER BLUE' },
            { label: 'Purple', value: 'PURPLE' },
            { label: 'Raspberry', value: 'RASPBERRY' },
            { label: 'Red', value: 'RED' },
            { label: 'Royal blue', value: 'ROYAL BLUE' },
            { label: 'Salmon', value: 'SALMON' },
            { label: 'Sandy brown', value: 'SANDY BROWN' },
            { label: 'Sea green', value: 'SEA GREEN' },
            { label: 'Sepia', value: 'SEPIA' },
            { label: 'Sienna', value: 'SIENNA' },
            { label: 'Silver', value: 'SILVER' },
            { label: 'Sky blue', value: 'SKY BLUE' },
            { label: 'Slateblue', value: 'SLATEBLUE' },
            { label: 'Slate gray', value: 'SLATE GRAY' },
            { label: 'Spring green', value: 'SPRING GREEN' },
            { label: 'Steel blue', value: 'STEEL BLUE' },
            { label: 'Tan', value: 'TAN' },
            { label: 'Teal', value: 'TEAL' },
            { label: 'Thistle', value: 'THISTLE' },
            { label: 'Tomato', value: 'TOMATO' },
            { label: 'Turquoise', value: 'TURQUOISE' },
            { label: 'Violet', value: 'VIOLET' },
            { label: 'Violet red', value: 'VIOLET RED' },
            { label: 'White', value: 'WHITE' },
            { label: 'Yellow', value: 'YELLOW' }
        ],
        directions: [
            { label: 'X', value: 'x' },
            { label: 'Y', value: 'y' },
            { label: 'Z', value: 'z' }
        ],
        SURF: {
            surfaceBacking: [
                { label: 'Exposed', value: 'EXPOSED' },
                { label: 'Insulated', value: 'INSULATED' },
                { label: 'Void', value: 'VOID' }
            ],
            surfVentFlowType: [
                { label: 'Velocity', value: 'velocity' },
                { label: 'Volume flow', value: 'volumeFlow' },
                { label: 'Mass flow', value: 'massFlow' }
            ]
        },
        OBST: {
            obstSurfType: [
                { label: 'Surf ID', value: 'surf_id' },
                { label: 'Surf IDs', value: 'surf_ids' },
                { label: 'Surf ID(6)', value: 'surf_id6' }
            ]
        },
        JETFAN: {
            jetfanFlowType: [
                { label: 'Volume flow', value: 'volumeFlow' },
                { label: 'Mass flow', value: 'massFlow' }
            ],
            jetfanAreaType: [
                { label: 'Area', value: 'area' },
                { label: 'Diameter', value: 'diameter' },
                { label: 'Perimeter', value: 'perimeter' }
            ],
            jetfanDirection: [
                { label: '+x', value: '+x' },
                { label: '-x', value: '-x' },
                { label: '+y', value: '+y' },
                { label: '-y', value: '-y' },
                { label: '+z', value: '+z' },
                { label: '-z', value: '-z' }
            ]
        },
        BNDF: {

            bndfQuantity: [
                { label: 'Adiabatic surface temperature', quantity: 'adiabatic surface temperature', spec: 'false', part: 'false' },
                { label: 'Ampua', quantity: 'ampua', spec: 'false', part: 'true' },
                { label: 'Ampua_z', quantity: 'ampua_z', spec: 'false', part: 'false' },
                { label: 'Back wall temperature', quantity: 'back wall temperature', spec: 'false', part: 'false' },
                { label: 'Burning rate', quantity: 'burning rate', spec: 'false', part: 'false' },
                { label: 'Convective heat flux', quantity: 'convective heat flux', spec: 'false', part: 'false' },
                { label: 'Cpua', quantity: 'cpua', spec: 'false', part: 'false' },
                { label: 'Cpua_z', quantity: 'cpua_z', spec: 'false', part: 'false' },
                { label: 'Deposition velocity', quantity: 'deposition velocity', spec: 'false', part: 'false' },
                { label: 'Friction velocity', quantity: 'friction velocity', spec: 'false', part: 'false' },
                { label: 'Gauge heat flux', quantity: 'gauge heat flux', spec: 'false', part: 'false' },
                { label: 'Net heat flux', quantity: 'net heat flux', spec: 'false', part: 'false' },
                { label: 'Incident heat flux', quantity: 'incident heat flux', spec: 'false', part: 'false' },
                { label: 'Mass flux', quantity: 'mass flux', spec: 'false', part: 'false' },
                { label: 'Mpua', quantity: 'mpua', spec: 'false', part: 'false' },
                { label: 'Mpua_z', quantity: 'mpua_z', spec: 'false', part: 'false' },
                { label: 'Normal velocity', quantity: 'normal velocity', spec: 'false', part: 'false' },
                { label: 'Pressure coefficient', quantity: 'pressure coefficient', spec: 'false', part: 'false' },
                { label: 'Radiative heat flux', quantity: 'radiative heat flux', spec: 'false', part: 'false' },
                { label: 'Radiometer', quantity: 'radiometer', spec: 'false', part: 'false' },
                { label: 'Surface density', quantity: 'surface density', spec: 'false', part: 'false' },
                { label: 'Surface deposition', quantity: 'surface deposition', spec: 'true', part: 'false' },
                { label: 'Wall temperature', quantity: 'wall temperature', spec: 'false', part: 'false' },
                { label: 'Wall thickness', quantity: 'wall thickness', spec: 'false', part: 'false' }
            ]
        },
        SLCF: {
            slcfQuantity: [
                { label: 'Absorption coefficient', quantity: 'absorption coefficient', spec: 'false', part: 'false' },
                { label: 'Aerosol volume fraction', quantity: 'aerosol volume fraction', spec: 'false', part: 'false' },
                { label: 'Background pressure', quantity: 'background pressure', spec: 'false', part: 'false' },
                { label: 'CHI_R', quantity: 'chi_r', spec: 'false', part: 'false' },
                { label: 'Conductivity', quantity: 'conductivity', spec: 'false', part: 'false' },
                { label: 'Density', quantity: 'density', spec: 'false', part: 'false' },
                { label: 'Divergence', quantity: 'divergence', spec: 'false', part: 'false' },
                { label: 'Enthalpy', quantity: 'enthalpy', spec: 'false', part: 'false' },
                { label: 'Extinction coefficient', quantity: 'extinction coefficient', spec: 'false', part: 'false' },
                { label: 'FIC', quantity: 'fic', spec: 'false', part: 'false' },
                { label: 'HRRPUV', quantity: 'hrrpuv', spec: 'false', part: 'false' },
                { label: 'Mass flux x', quantity: 'mass flux x', spec: 'false', part: 'false' },
                { label: 'Mass flux y', quantity: 'mass flux y', spec: 'false', part: 'false' },
                { label: 'Mass flux z', quantity: 'mass flux z', spec: 'false', part: 'false' },
                { label: 'Mass fraction', quantity: 'mass fraction', spec: 'true', part: 'false' },
                { label: 'Mixture fraction', quantity: 'mixture fraction', spec: 'false', part: 'false' },
                { label: 'MPUV', quantity: 'mpuv', spec: 'false', part: 'true' },
                { label: 'MPUV_Z', quantity: 'mpuv_z', spec: 'false', part: 'false' },
                { label: 'Optical density', quantity: 'optical density', spec: 'false', part: 'false' },
                { label: 'Particle flux x', quantity: 'particle flux x', spec: 'false', part: 'false' },
                { label: 'Particle flux y', quantity: 'particle flux y', spec: 'false', part: 'false' },
                { label: 'Particle flux z', quantity: 'particle flux z', spec: 'false', part: 'false' },
                { label: 'Pressure', quantity: 'pressure', spec: 'false', part: 'false' },
                { label: 'Pressure zone', quantity: 'pressure zone', spec: 'false', part: 'false' },
                { label: 'Relative humidity', quantity: 'relative humidity', spec: 'false', part: 'false' },
                { label: 'Sensible enthalpy', quantity: 'sensible enthalpy', spec: 'false', part: 'false' },
                { label: 'Specific enthalpy', quantity: 'specific enthalpy', spec: 'false', part: 'false' },
                { label: 'Specific heat', quantity: 'specific heat', spec: 'false', part: 'false' },
                { label: 'Specific sensible enthalpy', quantity: 'specific sensible enthalpy', spec: 'false', part: 'false' },
                { label: 'Temperature', quantity: 'temperature', spec: 'false', part: 'false' },
                { label: 'U-velocity', quantity: 'u-velocity', spec: 'false', part: 'false' },
                { label: 'V-velocity', quantity: 'v-velocity', spec: 'false', part: 'false' },
                { label: 'W-velocity', quantity: 'w-velocity', spec: 'false', part: 'false' },
                { label: 'Velocity', quantity: 'velocity', spec: 'false', part: 'false' },
                { label: 'Viscosity', quantity: 'viscosity', spec: 'false', part: 'false' },
                { label: 'Visibility', quantity: 'visibility', spec: 'false', part: 'false' },
                { label: 'Volume fraction', quantity: 'volume fraction', spec: 'false', part: 'false' }
            ]
        },
        ISOF: {

            isofQuantity: [
                {
                    label: 'Absorption coefficient',
                    quantity: 'absorption coefficient',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Aerosol volume fraction',
                    quantity: 'aerosol volume fraction',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Background pressure',
                    quantity: 'background pressure',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'CHI_R',
                    quantity: 'chi_r',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Conductivity',
                    quantity: 'conductivity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Density',
                    quantity: 'density',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Divergence',
                    quantity: 'divergence',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Enthalpy',
                    quantity: 'enthalpy',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Extinction coefficient',
                    quantity: 'extinction coefficient',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'HRRPUV',
                    quantity: 'hrrpuv',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux x',
                    quantity: 'mass flux x',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux y',
                    quantity: 'mass flux y',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux z',
                    quantity: 'mass flux z',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass fraction',
                    quantity: 'mass fraction',
                    spec: 'true',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mixture fraction',
                    quantity: 'mixture fraction',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Optical density',
                    quantity: 'optical density',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Pressure',
                    quantity: 'pressure',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Relative humidity',
                    quantity: 'relative humidity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Sensible enthalpy',
                    quantity: 'sensible enthalpy',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Specific enthalpy',
                    quantity: 'specific enthalpy',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Specific heat',
                    quantity: 'specific heat',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Specific sensible enthalpy',
                    quantity: 'specific sensible enthalpy',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Temperature',
                    quantity: 'temperature',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'U-velocity',
                    quantity: 'u-velocity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'V-velocity',
                    quantity: 'v-velocity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'W-velocity',
                    quantity: 'w-velocity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Velocity',
                    quantity: 'velocity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Viscosity',
                    quantity: 'viscosity',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Visibility',
                    quantity: 'visibility',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Volume fraction',
                    quantity: 'volume fraction',
                    spec: 'false',
                    validator: {
                        type: 'Real',
                        value: '20',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                }
            ]
        },
        DEVC: {
            devcQuantity: [
                {
                    label: 'Absorption coefficient',
                    quantity: 'absorption coefficient',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Actuated sprinklers',
                    quantity: 'actuated sprinklers',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Adiabatic surface temperature',
                    quantity: 'adiabatic surface temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Aerosol volume fraction',
                    quantity: 'aerosol volume fraction',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'AMPUA',
                    quantity: 'ampua',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'AMPUA_Z',
                    quantity: 'ampua_z',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Aspiration',
                    quantity: 'aspiration',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Background pressure',
                    quantity: 'background pressure',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Back wall temperature',
                    quantity: 'back wall temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Burning rate',
                    quantity: 'burning rate',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Chamber obscuration',
                    quantity: 'chamber obscuration',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'CHI_R',
                    quantity: 'chi_r',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Conductivity',
                    quantity: 'conductivity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Control',
                    quantity: 'control',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Control value',
                    quantity: 'control value',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Convective heat flux',
                    quantity: 'convective heat flux',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'CPUA',
                    quantity: 'cpua',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'CPUA_Z',
                    quantity: 'cpua_z',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Cpu time',
                    quantity: 'cpu time',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Density',
                    quantity: 'density',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Deposition velocity',
                    quantity: 'deposition velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Divergence',
                    quantity: 'divergence',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Enthalpy',
                    quantity: 'enthalpy',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Extinction coefficient',
                    quantity: 'extinction coefficient',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'FED',
                    quantity: 'fed',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'FIC',
                    quantity: 'fic',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Friction velocity',
                    quantity: 'friction velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Gauge heat flux',
                    quantity: 'gauge heat flux',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Heat flow',
                    quantity: 'heat flow',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Heat flow wall',
                    quantity: 'heat flow wall',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Net heat flux',
                    quantity: 'net heat flux',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'HRR',
                    quantity: 'hrr',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'HRRPUA',
                    quantity: 'hrrpua',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'HRRPUV',
                    quantity: 'hrrpuv',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Incident heat flux',
                    quantity: 'incident heat flux',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Inside wall temperature',
                    quantity: 'inside wall temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Iteration',
                    quantity: 'iteration',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Layer height',
                    quantity: 'layer height',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Link temperature',
                    quantity: 'link temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Lower temperature',
                    quantity: 'lower temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flow',
                    quantity: 'mass flow',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flow wall',
                    quantity: 'mass flow wall',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux',
                    quantity: 'mass flux',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux x',
                    quantity: 'mass flux x',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux y',
                    quantity: 'mass flux y',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass flux z',
                    quantity: 'mass flux z',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mass fraction',
                    quantity: 'mass fraction',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mixture fraction',
                    quantity: 'mixture fraction',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'MPUA',
                    quantity: 'mpua',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'MPUA_Z',
                    quantity: 'mpua_z',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Mpuv',
                    quantity: 'mpuv',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'MPUV_Z',
                    quantity: 'mpuv_z',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Normal velocity',
                    quantity: 'normal velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Number of particles',
                    quantity: 'number of particles',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Open nozzles',
                    quantity: 'open nozzles',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Optical density',
                    quantity: 'optical density',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Path obscuration',
                    quantity: 'path obscuration',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Pressure',
                    quantity: 'pressure',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Pressure coefficient',
                    quantity: 'pressure coefficient',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Pressure zone',
                    quantity: 'pressure zone',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Radiative heat flux',
                    quantity: 'radiative heat flux',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Radiative heat flux gas',
                    quantity: 'radiative heat flux gas',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Radiometer',
                    quantity: 'radiometer',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Relative humidity',
                    quantity: 'relative humidity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Sensible enthalpy',
                    quantity: 'sensible enthalpy',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Solid conductivity',
                    quantity: 'solid conductivity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Solid density',
                    quantity: 'solid density',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Solid specific heat',
                    quantity: 'solid specific heat',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Specific enthalpy',
                    quantity: 'specific enthalpy',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Specific heat',
                    quantity: 'specific heat',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Specific sensible enthalpy',
                    quantity: 'specific sensible enthalpy',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Sprinkler link temperature',
                    quantity: 'sprinkler link temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Surface density',
                    quantity: 'surface density',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Surface deposition',
                    quantity: 'surface deposition',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Temperature',
                    quantity: 'temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Thermocouple',
                    quantity: 'thermocouple',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Time',
                    quantity: 'time',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Time step',
                    quantity: 'time step',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Transmission',
                    quantity: 'transmission',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'U-velocity',
                    quantity: 'u-velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'V-velocity',
                    quantity: 'v-velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'W-velocity',
                    quantity: 'w-velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Upper temperature',
                    quantity: 'upper temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Velocity',
                    quantity: 'velocity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Viscosity',
                    quantity: 'viscosity',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Visibility',
                    quantity: 'visibility',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Volume flow',
                    quantity: 'volume flow',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Volume flow wall',
                    quantity: 'volume flow wall',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Volume fraction',
                    quantity: 'volume fraction',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Wall clock time',
                    quantity: 'wall clock time',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Wall clock time iterations',
                    quantity: 'wall clock time iterations',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Wall temperature',
                    quantity: 'wall temperature',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                },
                {
                    label: 'Wall thickness',
                    quantity: 'wall thickness',
                    spec: 'false',
                    part: 'true',
                    validator: {
                        type: 'Real',
                        value: '0',
                        error_messages: {
                            pattern: ''
                        },
                        valid_ranges: [],
                        reasonable_ranges: []
                    }
                }
            ],
            devcType: [
                { label: 'Basic', value: 'basic' },
                { label: 'Complex', value: 'complex' },
                { label: 'Smoke detector', value: 'smoke_detector' },
                { label: 'Heat detector', value: 'heat_detector' },
                { label: 'Beam detector', value: 'beam_detector' },
                { label: 'Aspiration intake', value: 'aspiration_intake' },
                { label: 'Aspiration unit', value: 'aspiration_unit' },
                { label: 'Nozzle', value: 'nozzle' },
                { label: 'Sprinkler', value: 'sprinkler' }
            ],
            devcGeomType: [
                { label: 'Point', value: 'point' },
                { label: 'Plane', value: 'plane' },
                { label: 'Volume', value: 'volume' }
            ],
            devcQuantityType: [
                { label: 'Quantity', value: 'QUANTITY' },
                { label: 'Prop', value: 'PROP' }
            ],
            devcStatistics: [
                { label: 'Min', value: 'min' },
                { label: 'Max', value: 'max' },
                { label: 'Mean', value: 'mean' },
                { label: 'Volume mean', value: 'volume mean' },
                { label: 'Mass mean', value: 'mass mean' },
                { label: 'Volume integral', value: 'volume integral' },
                { label: 'Mass integral', value: 'mass integral' },
                { label: 'Area integral', value: 'area integral' },
                { label: 'Surface integral', value: 'surface integral' }
            ],
            devcInitialState: [
                { label: 'False', value: 'false' },
                { label: 'True', value: 'true' }
            ],
            devcLatch: [
                { label: 'True', value: 'true' },
                { label: 'False', value: 'false' }
            ],
            devcTripDirection: [
                { label: '+1', value: '1' },
                { label: '-1', value: '-1' }
            ]
        },
        PROP: {
            propSmokeviewId: [
                { label: 'Sensor', value: 'sensor' },
                { label: 'Smoke detector', value: 'smoke detector' },
                { label: 'Nozzle', value: 'nozzle' },
                { label: 'Sprinkler', value: 'sprinkler' }
            ],
            propFlowType: [
                { label: 'Flow rate', value: 'flowRate' },
                { label: 'Mass flow rate', value: 'massFlowRate' },
                { label: 'K factor', value: 'kFactor' }
            ],
            propSprayPattern: [
                { label: 'Gaussian', value: 'gaussian' },
                { label: 'Uniform', value: 'uniform' }
            ],
            propQuantity: [
                { label: 'Heat detector', value: 'heat_detector' },
                { label: 'Sprinkler', value: 'sprinkler' },
                { label: 'Nozzle', value: 'nozzle' },
                { label: 'Smoke detector', value: 'smoke_detector' }
            ],
        },
        FIRE: {
            fireType: [
                { label: 'Constant HRR', value: 'constant_hrr' },
                { label: 'Time dependent HRRPUA', value: 'time_dependent_hrrpua' },
                { label: 'Radially spreading fire', value: 'radially_spreading' }
            ],
            hrrType: [
                { label: 'HRRPUA', value: 'hrrpua' },
                { label: 'MLRPUA', value: 'mlrpua' }
            ],
            timeFunction: [
                { label: 'RAMP', value: 'ramp' },
                { label: 'TAU_Q', value: 'tauq' }
            ],

        },
        radcals: [
            { label: 'Methane', value: 'methane' },
            { label: 'Propane', value: 'propane' },
            { label: 'Ethylene', value: 'ethylene' },
            { label: 'Hydrogen', value: 'hydrogen' }
        ],
        ctrlFunctions: [
            { label: 'Any', value: 'any' },
            { label: 'All', value: 'all' },
            { label: 'At least', value: 'at least' }
        ],
        smokeDetectorModel: [
            { label: 'Heskestad model', value: 'heskestad' },
            { label: 'Cleary model', value: 'cleary' }
        ],
        rampType: [
            { label: 'Material', value: 'matl' },
            { label: 'Fire', value: 'fire' },
            { label: 'Ventilation', value: 'vent' },
            { label: 'Pressure', value: 'pres' }
        ],
        SPEC: {
            specieFlowType: [
                { label: 'Mass flux', value: 'massFlux' },
                { label: 'Mass fraction', value: 'massFraction' }
            ],
            specieMassFractionFlowType: [
                { label: 'Volume flow', value: 'volumeFlow' },
                { label: 'Velocity', value: 'velocity' },
                { label: 'Total mass flux', value: 'totalMassFlux' }
            ],
            species: [
                { label: 'Acetone', value: 'acetone', mw: 58.07914, formula: 'C3H6O', sigmalj: 4.6, epsilonklj: 560.2, liquid: 'Y', radcal: 'MMA' },
                { label: 'Acetylene', value: 'acetylene', mw: 26.03728, formula: 'C2H2', sigmalj: 4.033, epsilonklj: 231.8, liquid: 'N', radcal: 'PROPYLENE' },
                { label: 'Acrolein', value: 'acrolein', mw: 56.06326, formula: 'C3H4O', sigmalj: 4.549, epsilonklj: 576.7, liquid: 'Y', radcal: 'MMA' },
                { label: 'Ammonia', value: 'ammonia', mw: 17.03052, formula: 'NH3', sigmalj: 2.9, epsilonklj: 558.3, liquid: 'Y', radcal: '' },
                { label: 'Argon', value: 'argon', mw: 39.948, formula: 'Ar', sigmalj: 3.42, epsilonklj: 124, liquid: 'Y', radcal: '' },
                { label: 'Benzene', value: 'benzene', mw: 78.11184, formula: 'C6H6', sigmalj: 5.349, epsilonklj: 412.3, liquid: 'Y', radcal: 'TOLUENE' },
                { label: 'Butane', value: 'butane', mw: 58.1222, formula: 'C4H10', sigmalj: 4.687, epsilonklj: 531.4, liquid: 'Y', radcal: 'PROPANE' },
                { label: 'Carbon', value: 'carbon', mw: 12.0107, formula: 'C', sigmalj: 2.94, epsilonklj: 74.8, liquid: 'N', radcal: '' },
                { label: 'Carbon dioxide', value: 'carbon dioxide', mw: 44.0095, formula: 'CO2', sigmalj: 3.941, epsilonklj: 195.2, liquid: 'N', radcal: 'CARBON DIOXIDE' },
                { label: 'Carbon monoxide', value: 'carbon monoxide', mw: 28.0101, formula: 'CO', sigmalj: 3.69, epsilonklj: 91.7, liquid: 'Y', radcal: 'CARBON MONOXIDE' },
                { label: 'Chlorine', value: 'chlorine', mw: 70.906, formula: 'Cl2', sigmalj: 4.217, epsilonklj: 316, liquid: 'Y', radcal: '' },
                { label: 'Dodecane', value: 'dodecane', mw: 170.33484, formula: 'C12H26', sigmalj: 4.701, epsilonklj: 205.78, liquid: 'Y', radcal: 'N-HEPTANE' },
                { label: 'Ethane', value: 'ethane', mw: 30.06904, formula: 'C2H6', sigmalj: 4.443, epsilonklj: 215.7, liquid: 'Y', radcal: 'ETHANE' },
                { label: 'Ethanol', value: 'ethanol', mw: 46.06844, formula: 'C2H5OH', sigmalj: 4.53, epsilonklj: 362.6, liquid: 'Y', radcal: 'METHANOL' },
                { label: 'Ethylene', value: 'ethylene', mw: 28.05316, formula: 'C2H4', sigmalj: 4.163, epsilonklj: 224.7, liquid: 'Y', radcal: 'ETHYLENE' },
                { label: 'Formaldehyde', value: 'formaldehyde', mw: 30.02598, formula: 'CH2O', sigmalj: 3.626, epsilonklj: 481.8, liquid: 'Y', radcal: 'METHANOL' },
                { label: 'Helium', value: 'helium', mw: 4.002602, formula: 'He', sigmalj: 2.551, epsilonklj: 10.22, liquid: 'Y', radcal: '' },
                { label: 'Hydrogen', value: 'hydrogen', mw: 2.01588, formula: 'H2', sigmalj: 2.827, epsilonklj: 59.7, liquid: 'Y', radcal: '' },
                { label: 'Hydrogen atom', value: 'hydrogen atom', mw: 1.00794, formula: 'H', sigmalj: 2.31, epsilonklj: 123.6, liquid: 'N', radcal: '' },
                { label: 'Hydrogen bromide', value: 'hydrogen bromide', mw: 80.91194, formula: 'HBr', sigmalj: 3.353, epsilonklj: 449, liquid: 'Y', radcal: '' },
                { label: 'Hydrogen chloride', value: 'hydrogen chloride', mw: 36.46094, formula: 'HCl', sigmalj: 3.339, epsilonklj: 344.7, liquid: 'Y', radcal: '' },
                { label: 'Hydrogen cyanide', value: 'hydrogen cyanide', mw: 27.02534, formula: 'HCN', sigmalj: 3.63, epsilonklj: 569.1, liquid: 'Y', radcal: '' },
                { label: 'Hydrogen fluoride', value: 'hydrogen fluoride', mw: 20.006343, formula: 'HF', sigmalj: 3.148, epsilonklj: 330, liquid: 'Y', radcal: '' },
                { label: 'Hydrogen peroxide', value: 'hydrogen peroxide', mw: 34.01468, formula: 'H2O2', sigmalj: 3.02, epsilonklj: 106.5, liquid: 'Y', radcal: '' },
                { label: 'Hydroperoxy radical', value: 'hydroperoxy radical', mw: 33.00674, formula: 'HO2', sigmalj: 3.02, epsilonklj: 106.5, liquid: 'N', radcal: '' },
                { label: 'Hydroxyl radical', value: 'hydroxyl radical', mw: 17.00734, formula: 'OH', sigmalj: 2.66, epsilonklj: 92.1, liquid: 'N', radcal: '' },
                { label: 'Isopropanol', value: 'isopropanol', mw: 60.09502, formula: 'C3H7OH', sigmalj: 4.549, epsilonklj: 576.7, liquid: 'Y', radcal: 'METHANOL' },
                { label: 'Lj air', value: 'lj air', mw: 28.85476, formula: '', sigmalj: 3.711, epsilonklj: 78.6, liquid: 'N', radcal: '' },
                { label: 'Methane', value: 'methane', mw: 16.04246, formula: 'CH4', sigmalj: 3.758, epsilonklj: 148.6, liquid: 'Y', radcal: 'METHANE' },
                { label: 'Methanol', value: 'methanol', mw: 32.04186, formula: 'CH2OH', sigmalj: 3.626, epsilonklj: 481.8, liquid: 'Y', radcal: 'METHANOL' },
                { label: 'N-decane', value: 'n-decane', mw: 142.28168, formula: 'C10H22', sigmalj: 5.233, epsilonklj: 226.46, liquid: 'Y', radcal: 'N-HEPTANE' },
                { label: 'N-heptane', value: 'n-heptane', mw: 100.20194, formula: 'C7H16', sigmalj: 4.701, epsilonklj: 205.75, liquid: 'Y', radcal: 'N-HEPTANE' },
                { label: 'N-hexane', value: 'n-hexane', mw: 86.17536, formula: 'C6H12', sigmalj: 5.949, epsilonklj: 399.3, liquid: 'Y', radcal: 'N-HEPTANE' },
                { label: 'N-octane', value: 'n-octane', mw: 114.22852, formula: 'C8H18', sigmalj: 4.892, epsilonklj: 231.16, liquid: 'Y', radcal: 'N-HEPTANE' },
                { label: 'Nitric oxide', value: 'nitric oxide', mw: 30.0061, formula: 'NO', sigmalj: 3.492, epsilonklj: 116.7, liquid: 'Y', radcal: '' },
                { label: 'Nitrogen', value: 'nitrogen', mw: 28.0134, formula: 'N2', sigmalj: 3.798, epsilonklj: 71.4, liquid: 'Y', radcal: '' },
                { label: 'Nitrogen atom', value: 'nitrogen atom', mw: 14.0067, formula: 'N', sigmalj: 2.66, epsilonklj: 92.1, liquid: 'N', radcal: '' },
                { label: 'Nitrogen dioxide', value: 'nitrogen dioxide', mw: 46.055, formula: 'NO2', sigmalj: 3.992, epsilonklj: 204.88, liquid: 'Y', radcal: '' },
                { label: 'Nitrous oxide', value: 'nitrous oxide', mw: 44.0128, formula: 'N2O', sigmalj: 3.828, epsilonklj: 232.4, liquid: 'Y', radcal: '' },
                { label: 'Oxygen', value: 'oxygen', mw: 31.9988, formula: 'O2', sigmalj: 3.467, epsilonklj: 106.7, liquid: 'Y', radcal: '' },
                { label: 'Oxygen atom', value: 'oxygen atom', mw: 15.9994, formula: 'O', sigmalj: 2.66, epsilonklj: 92.1, liquid: 'N', radcal: '' },
                { label: 'Propane', value: 'propane', mw: 44.09562, formula: 'C3H8', sigmalj: 5.118, epsilonklj: 237.1, liquid: 'Y', radcal: 'PROPANE' },
                { label: 'Propylene', value: 'propylene', mw: 42.07974, formula: 'C3H6', sigmalj: 4.678, epsilonklj: 298.9, liquid: 'Y', radcal: 'PROPYLENE' },
                { label: 'Soot', value: 'soot', mw: 10.91042, formula: 'C0.9H0.1', sigmalj: 3.798, epsilonklj: 71.4, liquid: 'N', radcal: 'SOOT' },
                { label: 'Sulfur dioxide', value: 'sulfur dioxide', mw: 64.0638, formula: 'SO2', sigmalj: 4.112, epsilonklj: 335.4, liquid: 'Y', radcal: '' },
                { label: 'Sulfur hexafluoride', value: 'sulfur hexafluoride', mw: 146.055419, formula: 'SF6', sigmalj: 5.128, epsilonklj: 146, liquid: 'N', radcal: '' },
                { label: 'Toluene', value: 'toluene', mw: 92.13842, formula: 'C6H5CH3', sigmalj: 5.698, epsilonklj: 480, liquid: 'Y', radcal: 'TOLUENE' },
                { label: 'Water vapor', value: 'water vapor', mw: 18.01528, formula: 'H2O', sigmalj: 2.641, epsilonklj: 809.1, liquid: 'Y', radcal: 'WATER VAPOR' }
            ],
            cleary: [
                { label: 'Cleary Ionization I1', value: 'cleary_ionization_i1', alpha_e: '2.5', beta_e: '-0.7', alpha_c: '0.8', beta_c: '-0.9' },
                { label: 'Cleary Ionization I2', value: 'cleary_ionization_i2', alpha_e: '1.8', beta_e: '-1.1', alpha_c: '1.0', beta_c: '-0.8' },
                { label: 'Cleary Photoelectric P1', value: 'cleary_photoelectric_p1', alpha_e: '1.8', beta_e: '-1.0', alpha_c: '1.0', beta_c: '-0.8' },
                { label: 'Cleary Photoelectric P2', value: 'cleary_photoelectric_p2', alpha_e: '1.8', beta_e: '-0.8', alpha_c: '0.8', beta_c: '-0.8' }
            ]
        }

    }

