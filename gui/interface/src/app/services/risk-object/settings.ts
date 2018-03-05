import { get, keyBy } from 'lodash';
import { RiskEntities } from '../../enums/risk-entities';
import { RiskEnums } from '../../enums/risk-enums';

export interface SettingsObject {
    project_name: string,
    simulation_time: number,
    number_of_simulations: number,
    indoor_temperature: number,
    elevation: number,
    indoor_pressure: number,
    humidity: number
}

export class Settings {

    private _window_open: object;
    private _plain_door_open: object;
    private _door_with_closer: object;
    private _electric_release_door: object;
    private _origin_of_fire: object;
    private _fire_detectors_trigger_temp: object;
    private _fire_detectors_failure: object;
    private _sprinkler_trigger_temp: object;
    private _sprinkler_failure: object;
    private _outdoor_temp: object;
    private _vertical_speed: object;
    private _horizontal_speed: object;
    private _alarm_time: object;
    private _fire_location: object;
    private _fire_hrr: object;
    private _fire_alpha: object;
    private _fire_co: object;
    private _fire_soot: object;
    private _pre_movement: object;
    private _density_room: object;
    private _density_corridor: object;
    private _alpha_speed: object;
    private _beta_speed: object;

    constructor(jsonString: string) {

        let base: SettingsObject;
        base = <SettingsObject>JSON.parse(jsonString);

        let RISK = RiskEntities;

        let distributions = keyBy(RiskEnums.distType, function(dist) {
			return dist.value;
		});

        this.window_open = {
            distribution: distributions.custom,
            var1: get(base, 'window_open.var1', RISK.window_open.var1.default),
            var2: get(base, 'window_open.var2', RISK.window_open.var2.default),
        };
        this.plain_door_open = {
            distribution: distributions.binomial,
            var1: get(base, 'plain_door_open.var1', RISK.plain_door_open.var1.default),
            var2: get(base, 'plain_door_open.var2', RISK.plain_door_open.var2.default),
        };
        this.door_with_closer = {
            distribution: distributions.binomial,
            var1: get(base, 'door_with_closer.var1', RISK.door_with_closer.var1.default),
            var2: get(base, 'door_with_closer.var2', RISK.door_with_closer.var2.default),
        };
        this.electric_release_door = {
            distribution: distributions.binomial,
            var1: get(base, 'electric_release_door.var1', RISK.electric_release_door.var1.default),
            var2: get(base, 'electric_release_door.var2', RISK.electric_release_door.var2.default),
        };
        this.origin_of_fire = {
            distribution: distributions.binomial,
            var1: get(base, 'origin_of_fire.var1', RISK.origin_of_fire.var1.default),
            var2: get(base, 'origin_of_fire.var2', RISK.origin_of_fire.var2.default),
        };
        this.fire_detectors_trigger_temp = {
            distribution: distributions.normal,
            var1: get(base, 'fire_detectors_trigger_temp.var1', RISK.fire_detectors_trigger_temp.var1.default),
            var2: get(base, 'fire_detectors_trigger_temp.var2', RISK.fire_detectors_trigger_temp.var2.default),
        };
        this.fire_detectors_failure = {
            distribution: distributions.binomial,
            var1: get(base, 'fire_detectors_failure.var1', RISK.fire_detectors_failure.var1.default),
            var2: get(base, 'fire_detectors_failure.var2', RISK.fire_detectors_failure.var2.default),
        };
        this.sprinkler_trigger_temp = {
            distribution: distributions.normal,
            var1: get(base, 'sprinkler_trigger_temp.var1', RISK.sprinkler_trigger_temp.var1.default),
            var2: get(base, 'sprinkler_trigger_temp.var2', RISK.sprinkler_trigger_temp.var2.default),
        };
        this.sprinkler_failure = {
            distribution: distributions.binomial,
            var1: get(base, 'sprinkler_failure.var1', RISK.sprinkler_failure.var1.default),
            var2: get(base, 'sprinkler_failure.var2', RISK.sprinkler_failure.var2.default),
        };
        this.outdoor_temp = {
            distribution: distributions.normal,
            var1: get(base, 'outdoor_temp.var1', RISK.outdoor_temp.var1.default),
            var2: get(base, 'outdoor_temp.var2', RISK.outdoor_temp.var2.default),
        };
        this.vertical_speed = {
            distribution: distributions.normal,
            var1: get(base, 'vertical_speed.var1', RISK.vertical_speed.var1.default),
            var2: get(base, 'vertical_speed.var2', RISK.vertical_speed.var2.default),
        };
        this.horizontal_speed = {
            distribution: distributions.normal,
            var1: get(base, 'horizontal_speed.var1', RISK.horizontal_speed.var1.default),
            var2: get(base, 'horizontal_speed.var2', RISK.horizontal_speed.var2.default),
        };
        this.alarm_time = {
            distribution: distributions.lognormal,
            var1: get(base, 'alarm_time.var1', RISK.alarm_time.var1.default),
            var2: get(base, 'alarm_time.var2', RISK.alarm_time.var2.default),
        };
        this.fire_location = {
            distribution: distributions.uniform,
            var1: get(base, 'fire_location.var1', RISK.fire_location.var1.default),
            var2: get(base, 'fire_location.var2', RISK.fire_location.var2.default),
        };
        this.fire_hrr = {
            distribution: distributions.uniform,
            var1: get(base, 'fire_hrr.var1', RISK.fire_hrr.var1.default),
            var2: get(base, 'fire_hrr.var2', RISK.fire_hrr.var2.default),
        };

        this.fire_alpha = {
            distribution: distributions.triangular,
            var1: get(base, 'fire_alpha.var1', RISK.fire_alpha.var1.default),
            var2: get(base, 'fire_alpha.var2', RISK.fire_alpha.var2.default),
        };
        this.fire_co = {
            distribution: distributions.uniform,
            var1: get(base, 'fire_co.var1', RISK.fire_co.var1.default),
            var2: get(base, 'fire_co.var2', RISK.fire_co.var2.default),
        };
        this.fire_soot = {
            distribution: distributions.uniform,
            var1: get(base, 'fire_soot.var1', RISK.fire_soot.var1.default),
            var2: get(base, 'fire_soot.var2', RISK.fire_soot.var2.default),
        };
        this.pre_movement = {
            distribution: distributions.lognormal,
            var1: get(base, 'pre_movement.var1', RISK.pre_movement.var1.default),
            var2: get(base, 'pre_movement.var2', RISK.pre_movement.var2.default),
        };
        this.density_room = {
            distribution: distributions.normal,
            var1: get(base, 'density_room.var1', RISK.density_room.var1.default),
            var2: get(base, 'density_room.var2', RISK.density_room.var2.default),
        };
        this.density_corridor = {
            distribution: distributions.normal,
            var1: get(base, 'density_corridor.var1', RISK.density_corridor.var1.default),
            var2: get(base, 'density_corridor.var2', RISK.density_corridor.var2.default),
        };
        this.alpha_speed = {
            distribution: distributions.normal,
            var1: get(base, 'alpha_speed.var1', RISK.alpha_speed.var1.default),
            var2: get(base, 'alpha_speed.var2', RISK.alpha_speed.var2.default),
        };
        this.beta_speed = {
            distribution: distributions.normal,
            var1: get(base, 'beta_speed.var1', RISK.beta_speed.var1.default),
            var2: get(base, 'beta_speed.var2', RISK.beta_speed.var2.default),
        };
    }

	public get window_open(): object {
		return this._window_open;
	}

	public set window_open(value: object) {
		this._window_open = value;
	}

	public get plain_door_open(): object {
		return this._plain_door_open;
	}

	public set plain_door_open(value: object) {
		this._plain_door_open = value;
	}

	public get door_with_closer(): object {
		return this._door_with_closer;
	}

	public set door_with_closer(value: object) {
		this._door_with_closer = value;
	}

	public get electric_release_door(): object {
		return this._electric_release_door;
	}

	public set electric_release_door(value: object) {
		this._electric_release_door = value;
	}

	public get origin_of_fire(): object {
		return this._origin_of_fire;
	}

	public set origin_of_fire(value: object) {
		this._origin_of_fire = value;
	}

	public get fire_detectors_trigger_temp(): object {
		return this._fire_detectors_trigger_temp;
	}

	public set fire_detectors_trigger_temp(value: object) {
		this._fire_detectors_trigger_temp = value;
	}

	public get fire_detectors_failure(): object {
		return this._fire_detectors_failure;
	}

	public set fire_detectors_failure(value: object) {
		this._fire_detectors_failure = value;
	}

	public get sprinkler_trigger_temp(): object {
		return this._sprinkler_trigger_temp;
	}

	public set sprinkler_trigger_temp(value: object) {
		this._sprinkler_trigger_temp = value;
	}

	public get sprinkler_failure(): object {
		return this._sprinkler_failure;
	}

	public set sprinkler_failure(value: object) {
		this._sprinkler_failure = value;
	}

	public get outdoor_temp(): object {
		return this._outdoor_temp;
	}

	public set outdoor_temp(value: object) {
		this._outdoor_temp = value;
	}

	public get vertical_speed(): object {
		return this._vertical_speed;
	}

	public set vertical_speed(value: object) {
		this._vertical_speed = value;
	}

	public get horizontal_speed(): object {
		return this._horizontal_speed;
	}

	public set horizontal_speed(value: object) {
		this._horizontal_speed = value;
	}

	public get alarm_time(): object {
		return this._alarm_time;
	}

	public set alarm_time(value: object) {
		this._alarm_time = value;
	}

	public get fire_location(): object {
		return this._fire_location;
	}

	public set fire_location(value: object) {
		this._fire_location = value;
	}

	public get fire_hrr(): object {
		return this._fire_hrr;
	}

	public set fire_hrr(value: object) {
		this._fire_hrr = value;
	}

	public get fire_alpha(): object {
		return this._fire_alpha;
	}

	public set fire_alpha(value: object) {
		this._fire_alpha = value;
	}

	public get fire_co(): object {
		return this._fire_co;
	}

	public set fire_co(value: object) {
		this._fire_co = value;
	}

	public get fire_soot(): object {
		return this._fire_soot;
	}

	public set fire_soot(value: object) {
		this._fire_soot = value;
	}

	public get pre_movement(): object {
		return this._pre_movement;
	}

	public set pre_movement(value: object) {
		this._pre_movement = value;
	}

	public get density_room(): object {
		return this._density_room;
	}

	public set density_room(value: object) {
		this._density_room = value;
	}

	public get density_corridor(): object {
		return this._density_corridor;
	}

	public set density_corridor(value: object) {
		this._density_corridor = value;
	}

	public get alpha_speed(): object {
		return this._alpha_speed;
	}

	public set alpha_speed(value: object) {
		this._alpha_speed = value;
	}

	public get beta_speed(): object {
		return this._beta_speed;
	}

	public set beta_speed(value: object) {
		this._beta_speed = value;
	}

}
