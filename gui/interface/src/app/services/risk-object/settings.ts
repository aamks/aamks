import { get, keyBy } from 'lodash';
import { RiskEntities } from '../../enums/risk-entities';
import { RiskEnums } from '../../enums/risk-enums';

export interface SettingsObject {
    windowOpen: object,
    plainDoorOpen: object,
    doorWithCloser: object,
    electricReleaseDoor: object,
    originOfFire: object,
    fireDetectorsTriggerTemperature: object,
    fireDetectorsFailure: object,
    sprinklerTriggerTemperature: object,
    sprinklerFailure: object,
    outdoorTemperature: object,
    verticalSpeed: object,
    horizontalSpeed: object,
    alarmTime: object,
    fireLocation: object,
    fireHrr: object,
    fireAlpha: object,
    fireCo: object,
    fireSoot: object,
    preMovement: object,
    densityRoom: object,
    densityCorridor: object,
    alphaSpeed: object,
    betaSpeed: object
}

export class Settings {

    private _windowOpen: object;
    private _plainDoorOpen: object;
    private _doorWithCloser: object;
    private _electricReleaseDoor: object;
    private _originOfFire: object;
    private _fireDetectorsTriggerTemperature: object;
    private _fireDetectorsFailure: object;
    private _sprinklerTriggerTemperature: object;
    private _sprinklerFailure: object;
    private _outdoorTemperature: object;
    private _verticalSpeed: object;
    private _horizontalSpeed: object;
    private _alarmTime: object;
    private _fireLocation: object;
    private _fireHrr: object;
    private _fireAlpha: object;
    private _fireCo: object;
    private _fireSoot: object;
    private _preMovement: object;
    private _densityRoom: object;
    private _densityCorridor: object;
    private _alphaSpeed: object;
    private _betaSpeed: object;

    constructor(jsonString: string) {

        let base: SettingsObject;
        base = <SettingsObject>JSON.parse(jsonString);

        let RISK = RiskEntities;

        let distributions = keyBy(RiskEnums.distType, function(dist) {
			return dist.value;
		});

        this.windowOpen = {
            distribution: distributions.custom,
            var1: get(base, 'windowOpen.var1', RISK.windowOpen.var1.default),
            var2: get(base, 'windowOpen.var2', RISK.windowOpen.var2.default),
        };
        this.plainDoorOpen = {
            distribution: distributions.binomial,
            var1: get(base, 'plainDoorOpen.var1', RISK.plainDoorOpen.var1.default),
            var2: get(base, 'plainDoorOpen.var2', RISK.plainDoorOpen.var2.default),
        };
        this.doorWithCloser = {
            distribution: distributions.binomial,
            var1: get(base, 'door_withCloser.var1', RISK.doorWithCloser.var1.default),
            var2: get(base, 'door_withCloser.var2', RISK.doorWithCloser.var2.default),
        };
        this.electricReleaseDoor = {
            distribution: distributions.binomial,
            var1: get(base, 'electricReleaseDoor.var1', RISK.electricReleaseDoor.var1.default),
            var2: get(base, 'electricReleaseDoor.var2', RISK.electricReleaseDoor.var2.default),
        };
        this.originOfFire = {
            distribution: distributions.binomial,
            var1: get(base, 'originOfFire.var1', RISK.originOfFire.var1.default),
            var2: get(base, 'originOfFire.var2', RISK.originOfFire.var2.default),
        };
        this.fireDetectorsTriggerTemperature = {
            distribution: distributions.normal,
            var1: get(base, 'fireDetectorsTriggerTemperature.var1', RISK.fireDetectorsTriggerTemperature.var1.default),
            var2: get(base, 'fireDetectorsTriggerTemperature.var2', RISK.fireDetectorsTriggerTemperature.var2.default),
        };
        /*this.fire_detectors_failure = {
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
        */
    }

    /**
     * Getter windowOpen
     * @return {object}
     */
	public get windowOpen(): object {
		return this._windowOpen;
	}

    /**
     * Setter windowOpen
     * @param {object} value
     */
	public set windowOpen(value: object) {
		this._windowOpen = value;
	}

    /**
     * Getter plainDoorOpen
     * @return {object}
     */
	public get plainDoorOpen(): object {
		return this._plainDoorOpen;
	}

    /**
     * Setter plainDoorOpen
     * @param {object} value
     */
	public set plainDoorOpen(value: object) {
		this._plainDoorOpen = value;
	}

    /**
     * Getter doorWithCloser
     * @return {object}
     */
	public get doorWithCloser(): object {
		return this._doorWithCloser;
	}

    /**
     * Setter doorWithCloser
     * @param {object} value
     */
	public set doorWithCloser(value: object) {
		this._doorWithCloser = value;
	}

    /**
     * Getter electricReleaseDoor
     * @return {object}
     */
	public get electricReleaseDoor(): object {
		return this._electricReleaseDoor;
	}

    /**
     * Setter electricReleaseDoor
     * @param {object} value
     */
	public set electricReleaseDoor(value: object) {
		this._electricReleaseDoor = value;
	}

    /**
     * Getter originOfFire
     * @return {object}
     */
	public get originOfFire(): object {
		return this._originOfFire;
	}

    /**
     * Setter originOfFire
     * @param {object} value
     */
	public set originOfFire(value: object) {
		this._originOfFire = value;
	}

    /**
     * Getter fireDetectorsTriggerTemperature
     * @return {object}
     */
	public get fireDetectorsTriggerTemperature(): object {
		return this._fireDetectorsTriggerTemperature;
	}

    /**
     * Setter fireDetectorsTriggerTemperature
     * @param {object} value
     */
	public set fireDetectorsTriggerTemperature(value: object) {
		this._fireDetectorsTriggerTemperature = value;
	}

    /**
     * Getter fireDetectorsFailure
     * @return {object}
     */
	public get fireDetectorsFailure(): object {
		return this._fireDetectorsFailure;
	}

    /**
     * Setter fireDetectorsFailure
     * @param {object} value
     */
	public set fireDetectorsFailure(value: object) {
		this._fireDetectorsFailure = value;
	}

    /**
     * Getter sprinklerTriggerTemperature
     * @return {object}
     */
	public get sprinklerTriggerTemperature(): object {
		return this._sprinklerTriggerTemperature;
	}

    /**
     * Setter sprinklerTriggerTemperature
     * @param {object} value
     */
	public set sprinklerTriggerTemperature(value: object) {
		this._sprinklerTriggerTemperature = value;
	}

    /**
     * Getter sprinklerFailure
     * @return {object}
     */
	public get sprinklerFailure(): object {
		return this._sprinklerFailure;
	}

    /**
     * Setter sprinklerFailure
     * @param {object} value
     */
	public set sprinklerFailure(value: object) {
		this._sprinklerFailure = value;
	}

    /**
     * Getter outdoorTemperature
     * @return {object}
     */
	public get outdoorTemperature(): object {
		return this._outdoorTemperature;
	}

    /**
     * Setter outdoorTemperature
     * @param {object} value
     */
	public set outdoorTemperature(value: object) {
		this._outdoorTemperature = value;
	}

    /**
     * Getter verticalSpeed
     * @return {object}
     */
	public get verticalSpeed(): object {
		return this._verticalSpeed;
	}

    /**
     * Setter verticalSpeed
     * @param {object} value
     */
	public set verticalSpeed(value: object) {
		this._verticalSpeed = value;
	}

    /**
     * Getter horizontalSpeed
     * @return {object}
     */
	public get horizontalSpeed(): object {
		return this._horizontalSpeed;
	}

    /**
     * Setter horizontalSpeed
     * @param {object} value
     */
	public set horizontalSpeed(value: object) {
		this._horizontalSpeed = value;
	}

    /**
     * Getter alarmTime
     * @return {object}
     */
	public get alarmTime(): object {
		return this._alarmTime;
	}

    /**
     * Setter alarmTime
     * @param {object} value
     */
	public set alarmTime(value: object) {
		this._alarmTime = value;
	}

    /**
     * Getter fireLocation
     * @return {object}
     */
	public get fireLocation(): object {
		return this._fireLocation;
	}

    /**
     * Setter fireLocation
     * @param {object} value
     */
	public set fireLocation(value: object) {
		this._fireLocation = value;
	}

    /**
     * Getter fireHrr
     * @return {object}
     */
	public get fireHrr(): object {
		return this._fireHrr;
	}

    /**
     * Setter fireHrr
     * @param {object} value
     */
	public set fireHrr(value: object) {
		this._fireHrr = value;
	}

    /**
     * Getter fireAlpha
     * @return {object}
     */
	public get fireAlpha(): object {
		return this._fireAlpha;
	}

    /**
     * Setter fireAlpha
     * @param {object} value
     */
	public set fireAlpha(value: object) {
		this._fireAlpha = value;
	}

    /**
     * Getter fireCo
     * @return {object}
     */
	public get fireCo(): object {
		return this._fireCo;
	}

    /**
     * Setter fireCo
     * @param {object} value
     */
	public set fireCo(value: object) {
		this._fireCo = value;
	}

    /**
     * Getter fireSoot
     * @return {object}
     */
	public get fireSoot(): object {
		return this._fireSoot;
	}

    /**
     * Setter fireSoot
     * @param {object} value
     */
	public set fireSoot(value: object) {
		this._fireSoot = value;
	}

    /**
     * Getter preMovement
     * @return {object}
     */
	public get preMovement(): object {
		return this._preMovement;
	}

    /**
     * Setter preMovement
     * @param {object} value
     */
	public set preMovement(value: object) {
		this._preMovement = value;
	}

    /**
     * Getter densityRoom
     * @return {object}
     */
	public get densityRoom(): object {
		return this._densityRoom;
	}

    /**
     * Setter densityRoom
     * @param {object} value
     */
	public set densityRoom(value: object) {
		this._densityRoom = value;
	}

    /**
     * Getter densityCorridor
     * @return {object}
     */
	public get densityCorridor(): object {
		return this._densityCorridor;
	}

    /**
     * Setter densityCorridor
     * @param {object} value
     */
	public set densityCorridor(value: object) {
		this._densityCorridor = value;
	}

    /**
     * Getter alphaSpeed
     * @return {object}
     */
	public get alphaSpeed(): object {
		return this._alphaSpeed;
	}

    /**
     * Setter alphaSpeed
     * @param {object} value
     */
	public set alphaSpeed(value: object) {
		this._alphaSpeed = value;
	}

    /**
     * Getter betaSpeed
     * @return {object}
     */
	public get betaSpeed(): object {
		return this._betaSpeed;
	}

    /**
     * Setter betaSpeed
     * @param {object} value
     */
	public set betaSpeed(value: object) {
		this._betaSpeed = value;
	}


}
