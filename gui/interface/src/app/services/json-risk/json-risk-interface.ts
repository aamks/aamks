export interface JsonRiskInterface {
    general: {
        project_id: number,
        scenario_id: number,
        number_of_simulations: number,
        simulation_time: number,
        indoor_temperature: number[],
        outdoor_temperature: number[],
        indoor_pressure: number,
        auto_stircaser?: boolean
    },
    characteristic: {
        geometry_type: string,
        material_ceiling: string,
        ceiling_thickness: number,
        material_floor: string,
        floor_thickness: number,
        material_wall: string
        wall_thickness: number
    },
    infrastructure: {
        has_detectors: boolean,
        detectors: {
            comment: string,
            type: string,
            trigger_temperature_mean_and_sd: number[],
            trigger_obscuration_mean_and_sd: number[],
            not_broken_probability: number
        }
        has_sprinklers: boolean,
        sprinklers: {
            comment: string,
            trigger_temperature_mean_and_sd: number[],
            not_broken_probability: number,
            spray_density_mean_and_sd: number[],
            rti: number
        },
        has_nshevs: boolean,
        nshevs: {
            activation_time: number
        },
        cfast_static_records: string[]
    },
    settings: {
        heat_release_rate: {
            comment: string,
            hrrpua_min_mode_max: number[],
            alpha_min_mode_max: number[]
        },
        window_open: {
            comment: string,
            setup: any
        },
        door_open: {
            comment: string,
            electro_magnet_door_is_open_probability: number,
            door_closer_door_is_open_probability: number,
            standard_door_is_open_probability: number,
            vvents_no_failure_probability: number
        },
        c_const: number,
        pre_evacuation_time: {
            comment: string,
            mean_and_sd_room_of_fire_origin: number[],
            mean_and_sd_ordinary_room: number[]
        },
        evacuees_concentration: {
            comment: string,
            COR: number,
            STAI: number,
            ROOM: number,
            HALL: number
        },
        evacuees_speed_params: {
            comment: string,
            max_h_speed_mean_and_sd: number[],
            max_v_speed_mean_and_sd: number[],
            beta_v_mean_and_sd: number[],
            alpha_v_mean_and_sd: number[]
        },
        origin_of_fire: {
            comment: string,
            fire_starts_in_room_probability: number
        }
    },
    geometry: any
}
