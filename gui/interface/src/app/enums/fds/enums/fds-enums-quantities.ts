'use strict';

export const quantities =
    [
        {
            id: 'Absorption coefficient',
            quantity: 'absorption coefficient',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Actuated sprinklers',
            quantity: 'actuated sprinklers',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Adiabatic surface temperature',
            quantity: 'adiabatic surface temperature',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Aerosol volume fraction',
            quantity: 'aerosol volume fraction',
            type: ['d', 'i', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'AMPUA',
            quantity: 'ampua',
            type: ['b', 'd'],
            spec: false,
            part: true,
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
            id: 'AMPUA_Z',
            quantity: 'ampua_z',
            type: ['b', 'd'],
            spec: true,
            part: false,
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
            id: 'Aspiration',
            quantity: 'aspiration',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Background pressure',
            quantity: 'background pressure',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Back wall temperature',
            quantity: 'back wall temperature',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Burning rate',
            quantity: 'burning rate',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Chamber obscuration',
            quantity: 'chamber obscuration',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'CHI_R',
            quantity: 'chi_r',
            type: ['d', 'i', 's'],
            spec: false,
            part: false,
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
            id: 'Conductivity',
            quantity: 'conductivity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Control',
            quantity: 'control',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Control value',
            quantity: 'control value',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Convective heat flux',
            quantity: 'convective heat flux',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'CPUA',
            quantity: 'cpua',
            type: ['b', 'd'],
            spec: false,
            part: true,
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
            id: 'CPUA_Z',
            quantity: 'cpua_z',
            type: ['b', 'd'],
            spec: true,
            part: false,
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
            id: 'Cpu time',
            quantity: 'cpu time',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Density',
            quantity: 'density',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Deposition velocity',
            quantity: 'deposition velocity',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Divergence',
            quantity: 'divergence',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Enthalpy',
            quantity: 'enthalpy',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Extinction coefficient',
            quantity: 'extinction coefficient',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'FED',
            quantity: 'fed',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'FIC',
            quantity: 'fic',
            type: ['d', 's'],
            spec: false,
            part: false,
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
            id: 'Friction velocity',
            quantity: 'friction velocity',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Gauge heat flux',
            quantity: 'gauge heat flux',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Heat flow',
            quantity: 'heat flow',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Heat flow wall',
            quantity: 'heat flow wall',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Net heat flux',
            quantity: 'net heat flux',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'HRR',
            quantity: 'hrr',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'HRRPUA',
            quantity: 'hrrpua',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'HRRPUV',
            quantity: 'hrrpuv',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Incident heat flux',
            quantity: 'incident heat flux',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Inside wall temperature',
            quantity: 'inside wall temperature',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Iteration',
            quantity: 'iteration',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Layer height',
            quantity: 'layer height',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Link temperature',
            quantity: 'link temperature',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Lower temperature',
            quantity: 'lower temperature',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Mass flow',
            quantity: 'mass flow',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Mass flow wall',
            quantity: 'mass flow wall',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Mass flux',
            quantity: 'mass flux',
            type: ['b', 'd'],
            spec: true,
            part: false,
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
            id: 'Mass flux x',
            quantity: 'mass flux x',
            type: ['d', 'i', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'Mass flux y',
            quantity: 'mass flux y',
            type: ['d', 'i', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'Mass flux z',
            quantity: 'mass flux z',
            type: ['d', 'i', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'Mass fraction',
            quantity: 'mass fraction',
            type: ['d', 'i', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'Mixture fraction',
            quantity: 'mixture fraction',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'MPUA',
            quantity: 'mpua',
            type: ['b', 'd'],
            spec: false,
            part: true,
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
            id: 'MPUA_Z',
            quantity: 'mpua_z',
            type: ['b', 'd'],
            spec: true,
            part: false,
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
            id: 'Mpuv',
            quantity: 'mpuv',
            type: ['d', 'p', 's'],
            spec: false,
            part: true,
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
            id: 'MPUV_Z',
            quantity: 'mpuv_z',
            type: ['d', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'Normal velocity',
            quantity: 'normal velocity',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Number of particles',
            quantity: 'number of particles',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Open nozzles',
            quantity: 'open nozzles',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Optical density',
            quantity: 'optical density',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Path obscuration',
            quantity: 'path obscuration',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Pressure',
            quantity: 'pressure',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Pressure coefficient',
            quantity: 'pressure coefficient',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Pressure zone',
            quantity: 'pressure zone',
            type: ['d', 's'],
            spec: false,
            part: false,
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
            id: 'Radiative heat flux',
            quantity: 'radiative heat flux',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Radiative heat flux gas',
            quantity: 'radiative heat flux gas',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Radiometer',
            quantity: 'radiometer',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Relative humidity',
            quantity: 'relative humidity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Sensible enthalpy',
            quantity: 'sensible enthalpy',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Solid conductivity',
            quantity: 'solid conductivity',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Solid density',
            quantity: 'solid density',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Solid specific heat',
            quantity: 'solid specific heat',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Specific enthalpy',
            quantity: 'specific enthalpy',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Specific heat',
            quantity: 'specific heat',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Specific sensible enthalpy',
            quantity: 'specific sensible enthalpy',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Sprinkler link temperature',
            quantity: 'sprinkler link temperature',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Surface density',
            quantity: 'surface density',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Surface deposition',
            quantity: 'surface deposition',
            type: ['b', 'd'],
            spec: true,
            part: false,
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
            id: 'Temperature',
            quantity: 'temperature',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Thermocouple',
            quantity: 'thermocouple',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Time',
            quantity: 'time',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Time step',
            quantity: 'time step',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Transmission',
            quantity: 'transmission',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'U-velocity',
            quantity: 'u-velocity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'V-velocity',
            quantity: 'v-velocity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'W-velocity',
            quantity: 'w-velocity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Upper temperature',
            quantity: 'upper temperature',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Velocity',
            quantity: 'velocity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Viscosity',
            quantity: 'viscosity',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Visibility',
            quantity: 'visibility',
            type: ['d', 'i', 'p', 's'],
            spec: false,
            part: false,
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
            id: 'Volume flow',
            quantity: 'volume flow',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Volume flow wall',
            quantity: 'volume flow wall',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Volume fraction',
            quantity: 'volume fraction',
            type: ['d', 'i', 'p', 's'],
            spec: true,
            part: false,
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
            id: 'Wall clock time',
            quantity: 'wall clock time',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Wall clock time iterations',
            quantity: 'wall clock time iterations',
            type: ['d'],
            spec: false,
            part: false,
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
            id: 'Wall temperature',
            quantity: 'wall temperature',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
            id: 'Wall thickness',
            quantity: 'wall thickness',
            type: ['b', 'd'],
            spec: false,
            part: false,
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
    ];