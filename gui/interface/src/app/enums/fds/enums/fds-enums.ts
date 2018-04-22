'use strict';

export const FdsEnums =
    {
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
        DEVC: {
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
            ],
            smokeDetectorModel: [
                { label: 'Heskestad model', value: 'heskestad' },
                { label: 'Cleary model', value: 'cleary' }
            ],
            cleary: [
                { label: 'Cleary Ionization I1', value: 'cleary_ionization_i1', alpha_e: '2.5', beta_e: '-0.7', alpha_c: '0.8', beta_c: '-0.9' },
                { label: 'Cleary Ionization I2', value: 'cleary_ionization_i2', alpha_e: '1.8', beta_e: '-1.1', alpha_c: '1.0', beta_c: '-0.8' },
                { label: 'Cleary Photoelectric P1', value: 'cleary_photoelectric_p1', alpha_e: '1.8', beta_e: '-1.0', alpha_c: '1.0', beta_c: '-0.8' },
                { label: 'Cleary Photoelectric P2', value: 'cleary_photoelectric_p2', alpha_e: '1.8', beta_e: '-0.8', alpha_c: '0.8', beta_c: '-0.8' }
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
            radcals: [
                { label: 'Methane', value: 'methane' },
                { label: 'Propane', value: 'propane' },
                { label: 'Ethylene', value: 'ethylene' },
                { label: 'Hydrogen', value: 'hydrogen' }
            ],

        },
        RAMP: {
            rampType: [
                { label: 'Material', value: 'matl' },
                { label: 'Fire', value: 'fire' },
                { label: 'Ventilation', value: 'vent' },
                { label: 'Pressure', value: 'pres' }
            ],

        },
        CTRL: {
            ctrlFunctions: [
                { label: 'Any', value: 'any' },
                { label: 'All', value: 'all' },
                { label: 'At least', value: 'at least' }
            ],
        },
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
        },
    }
