export interface HeatReleaseRate {
    comment?: string,
    max_hrr: number[],
    alfa_min_mode_max: number[]
}

export interface OriginOfFire {
    comment?: string,
    fire_starts_in_room_probability: number
}

export interface EvacueesConcentration {
    comment?: string,
    cor: number,
    stai: number,
    room: number,
    hall: number
}
export interface EvacueesSpeedParams {
    comment?: string,
    max_h_speed_mean_and_sd: number[],
    max_v_speed_mean_and_sd: number[],
    beta_v_mean_and_sd: number[],
    alpha_v_mean_and_sd: number[]
}
export interface PreEvacuationTime {
    comment?: string,
    mean_and_sd_room_of_fire_origin: number[],
    mean_and_sd_ordinary_room: number[]
}
export interface WindowOpen {
    comment?: string,
    setup: any[]
}
export interface OutdoorTemperature {
    comment?: string,
    mean_and_sd: number[]
}
export interface DoorOpen {
    comment?: string,
    electro_magnet_door_is_open_probability: number,
    door_closer_door_is_open_probability: number,
    standard_door_is_open_probability: number,
    vvents_no_failure_probability: number
}
export interface Sprinkler {
    comment?: string,
    trigger_temperature_mean_and_sd: number[],
    not_broken_probability: number,
    spray_density_mean_and_sd: number[]
}
export interface FireDetector {
    comment?: string,
    type: string,
    mean_and_sd_trigger_temperature: number[], // Jak dla tryskacza + obscuration
    not_broken_probability: number
}

export interface SettingsObject {
    heat_release_rate: HeatReleaseRate,
    origin_of_fire: OriginOfFire,
    evacuees_concentration: EvacueesConcentration,
    evacuees_speed_params: EvacueesSpeedParams,
    pre_evacuation_time: PreEvacuationTime,
    window_open: WindowOpen,
    outdoor_temperature: OutdoorTemperature,
    door_open: DoorOpen,
    sprinkler: Sprinkler,
    fire_detector: FireDetector
}
