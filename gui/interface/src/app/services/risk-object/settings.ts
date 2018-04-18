import { get, keyBy } from 'lodash';
import { RiskEntities } from '../../enums/risk-entities';
import { RiskEnums } from '../../enums/risk-enums';
import { SettingsObject, HeatReleaseRate, OriginOfFire, EvacueesConcentration, EvacueesSpeedParams, PreEvacuationTime, WindowOpen, OutdoorTemperature, DoorOpen, Sprinkler, FireDetector } from './settings-interface';

export class Settings {

    private _heat_release_rate: HeatReleaseRate;
    private _origin_of_fire: OriginOfFire;
    private _evacuees_concentration: EvacueesConcentration;
    private _evacuees_speed_params: EvacueesSpeedParams;
    private _pre_evacuation_time: PreEvacuationTime;
    private _window_open: WindowOpen;
    private _outdoor_temperature: OutdoorTemperature;
    private _door_open: DoorOpen;
    private _sprinkler: Sprinkler;
    private _fire_detector: FireDetector;

    constructor(jsonString: string) {

        let base: SettingsObject;
        base = <SettingsObject>JSON.parse(jsonString);

        let SETTINGS = RiskEntities.settings;

        this.heat_release_rate = {
            comment: get(base, 'comment', SETTINGS.heatReleaseRate.comment),
            max_hrr: get(base, 'max_hrr', SETTINGS.heatReleaseRate.maxHrr),
            alfa_min_mode_max: get(base, 'alfa_min_mode_max', SETTINGS.heatReleaseRate.alfaMinModeMax)
        }

        this.origin_of_fire = {
            comment: get(base, 'comment', SETTINGS.originOfFire.comment),
            fire_starts_in_room_probability: get(base, '', SETTINGS),
        }
        this.evacuees_concentration = {
            comment: get(base, 'comment', SETTINGS.evacueesConcentration.comment),
            cor: get(base, 'cor', SETTINGS.evacueesConcentration.cor),
            stai: get(base, 'stai', SETTINGS.evacueesConcentration.stai),
            room: get(base, 'room', SETTINGS.evacueesConcentration.room),
            hall: get(base, 'hall', SETTINGS.evacueesConcentration.hall)
        }
        this.evacuees_speed_params = {
            comment: get(base, 'comment', SETTINGS.evacueesSpeedParams.comment),
            max_h_speed_mean_and_sd: get(base, 'max_h_speed_mean_and_sd', SETTINGS.evacueesSpeedParams.maxHSpeedMeanAndSd),
            max_v_speed_mean_and_sd: get(base, 'max_v_speed_mean_and_sd', SETTINGS.evacueesSpeedParams.maxVSpeedMeanAndSd),
            beta_v_mean_and_sd: get(base, 'beta_v_mean_and_sd', SETTINGS.evacueesSpeedParams.betaVMeanAndSd),
            alpha_v_mean_and_sd: get(base, 'alpha_v_mean_and_sd', SETTINGS.evacueesSpeedParams.alphaVMeanAndSd),
        }
        this.pre_evacuation_time = {
            comment: get(base, 'comment', SETTINGS.preEvacuationTime.comment),
            mean_and_sd_ordinary_room: get(base, 'mean_and_sd_ordinary_room', SETTINGS.preEvacuationTime.meanAndSdOrdinaryRoom),
            mean_and_sd_room_of_fire_origin: get(base, 'mean_and_sd_room_of_fire_origin', SETTINGS.preEvacuationTime.meanAndSdRoomOfFireOrigin),
        }
        this.window_open = {
            comment: get(base, 'comment', SETTINGS.windowOpen.comment),
            setup: get(base, 'setup', SETTINGS.windowOpen.setup),
        }
        this.outdoor_temperature = {
            comment: get(base, 'comment', SETTINGS.outdoorTemperature.comment),
            mean_and_sd: get(base, 'mean_and_sd', SETTINGS.outdoorTemperature.meanAndSd),
        }
        this.door_open = {
            comment: get(base, 'comment', SETTINGS.doorOpen.comment),
            electro_magnet_door_is_open_probability: get(base, 'electro_magnet_door_is_open_probability', SETTINGS.doorOpen.electroMagnetDoorIsOpenProbability),
            door_closer_door_is_open_probability: get(base, 'door_closer_door_is_open_probability', SETTINGS.doorOpen.electroMagnetDoorIsOpenProbability),
            standard_door_is_open_probability: get(base, 'standard_door_is_open_probability', SETTINGS.doorOpen.standardDoorIsOpenProbability),
            vvents_no_failure_probability: get(base, 'vvents_no_failure_probability', SETTINGS.doorOpen.vventsNoFailureProbability),
        }
        this.sprinkler = {
            comment: get(base, 'comment', SETTINGS.sprinkler.comment),
            trigger_temperature_mean_and_sd: get(base, 'trigger_temperature_mean_and_sd', SETTINGS.sprinkler.triggerTemperatureMeanAndSd),
            not_broken_probability: get(base, 'not_broken_probability', SETTINGS.sprinkler.notBrokenProbability),
            spray_density_mean_and_sd: get(base, 'spray_density_mean_and_sd', SETTINGS.sprinkler.sprayDensityMeanAndSd),
        }
        this.fire_detector = {
            comment: get(base, 'comment', SETTINGS.fireDetector.comment),
            type: get(base, 'type', SETTINGS.fireDetector.type),
            mean_and_sd_trigger_temperature: get(base, 'mean_and_sd_trigger_temperature', SETTINGS.fireDetector.meanAndSdTriggerTemperature),
            not_broken_probability: get(base, 'not_broken_probability', SETTINGS.fireDetector.notBrokenProbability),
        }
        
    }

    /**
     * Getter heat_release_rate
     * @return {HeatReleaseRate}
     */
	public get heat_release_rate(): HeatReleaseRate {
		return this._heat_release_rate;
	}

    /**
     * Setter heat_release_rate
     * @param {HeatReleaseRate} value
     */
	public set heat_release_rate(value: HeatReleaseRate) {
		this._heat_release_rate = value;
	}

    /**
     * Getter origin_of_fire
     * @return {OriginOfFire}
     */
	public get origin_of_fire(): OriginOfFire {
		return this._origin_of_fire;
	}

    /**
     * Setter origin_of_fire
     * @param {OriginOfFire} value
     */
	public set origin_of_fire(value: OriginOfFire) {
		this._origin_of_fire = value;
	}

    /**
     * Getter evacuees_concentration
     * @return {EvacueesConcentration}
     */
	public get evacuees_concentration(): EvacueesConcentration {
		return this._evacuees_concentration;
	}

    /**
     * Setter evacuees_concentration
     * @param {EvacueesConcentration} value
     */
	public set evacuees_concentration(value: EvacueesConcentration) {
		this._evacuees_concentration = value;
	}

    /**
     * Getter evacuees_speed_params
     * @return {EvacueesSpeedParams}
     */
	public get evacuees_speed_params(): EvacueesSpeedParams {
		return this._evacuees_speed_params;
	}

    /**
     * Setter evacuees_speed_params
     * @param {EvacueesSpeedParams} value
     */
	public set evacuees_speed_params(value: EvacueesSpeedParams) {
		this._evacuees_speed_params = value;
	}

    /**
     * Getter pre_evacuation_time
     * @return {PreEvacuationTime}
     */
	public get pre_evacuation_time(): PreEvacuationTime {
		return this._pre_evacuation_time;
	}

    /**
     * Setter pre_evacuation_time
     * @param {PreEvacuationTime} value
     */
	public set pre_evacuation_time(value: PreEvacuationTime) {
		this._pre_evacuation_time = value;
	}

    /**
     * Getter window_open
     * @return {WindowOpen}
     */
	public get window_open(): WindowOpen {
		return this._window_open;
	}

    /**
     * Setter window_open
     * @param {WindowOpen} value
     */
	public set window_open(value: WindowOpen) {
		this._window_open = value;
	}

    /**
     * Getter outdoor_temperature
     * @return {OutdoorTemperature}
     */
	public get outdoor_temperature(): OutdoorTemperature {
		return this._outdoor_temperature;
	}

    /**
     * Setter outdoor_temperature
     * @param {OutdoorTemperature} value
     */
	public set outdoor_temperature(value: OutdoorTemperature) {
		this._outdoor_temperature = value;
	}

    /**
     * Getter door_open
     * @return {DoorOpen}
     */
	public get door_open(): DoorOpen {
		return this._door_open;
	}

    /**
     * Setter door_open
     * @param {DoorOpen} value
     */
	public set door_open(value: DoorOpen) {
		this._door_open = value;
	}

    /**
     * Getter sprinkler
     * @return {Sprinkler}
     */
	public get sprinkler(): Sprinkler {
		return this._sprinkler;
	}

    /**
     * Setter sprinkler
     * @param {Sprinkler} value
     */
	public set sprinkler(value: Sprinkler) {
		this._sprinkler = value;
	}

    /**
     * Getter fire_detector
     * @return {FireDetector}
     */
	public get fire_detector(): FireDetector {
		return this._fire_detector;
	}

    /**
     * Setter fire_detector
     * @param {FireDetector} value
     */
	public set fire_detector(value: FireDetector) {
		this._fire_detector = value;
	}


}