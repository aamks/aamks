import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Ramp } from '../ramp/ramp';
import { get, toString, find } from 'lodash';
import { Hrr } from './hrr';

export interface SurfFireObject {
    id: string,
    uuid: string,
    idAC: number,
    color: string,
    fire_type: string,
    hrr: Hrr,
    ramp: Ramp,
    ramp_id: string
}

export class SurfFire {

    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _color: string;
    private _fire_type: string;
    private _hrr: Hrr;
    private _ramp: Ramp;

    constructor(jsonString: string, ramps: Ramp[] = undefined) {

        let base: SurfFireObject;
        base = <SurfFireObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SURF = FdsEntities.SURF;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.color = (get(base, 'color', SURF.COLOR.default[0])) as string;
        this.fire_type = get(base, 'fire_type', 'constant_hrr') as string;

        this.hrr = new Hrr(base.hrr)

        ramps && base.ramp_id != '' ? this.ramp = find(ramps, function (ramp) { return ramp.id == base.ramp_id; }) : this.ramp = undefined;
    }

    /**
     * Getter id
     * @return {string}
     */
	public get id(): string {
		return this._id;
	}

    /**
     * Setter id
     * @param {string} value
     */
	public set id(value: string) {
		this._id = value;
	}

    /**
     * Getter uuid
     * @return {string}
     */
	public get uuid(): string {
		return this._uuid;
	}

    /**
     * Setter uuid
     * @param {string} value
     */
	public set uuid(value: string) {
		this._uuid = value;
	}

    /**
     * Getter idAC
     * @return {number}
     */
	public get idAC(): number {
		return this._idAC;
	}

    /**
     * Setter idAC
     * @param {number} value
     */
	public set idAC(value: number) {
		this._idAC = value;
	}

    /**
     * Getter color
     * @return {string}
     */
	public get color(): string {
		return this._color;
	}

    /**
     * Setter color
     * @param {string} value
     */
	public set color(value: string) {
		this._color = value;
	}

    /**
     * Getter fire_type
     * @return {string}
     */
	public get fire_type(): string {
		return this._fire_type;
	}

    /**
     * Setter fire_type
     * @param {string} value
     */
	public set fire_type(value: string) {
		this._fire_type = value;
	}

    /**
     * Getter hrr
     * @return {Hrr}
     */
	public get hrr(): Hrr {
		return this._hrr;
	}

    /**
     * Setter hrr
     * @param {Hrr} value
     */
	public set hrr(value: Hrr) {
		this._hrr = value;
	}

    /**
     * Getter ramp
     * @return {Ramp}
     */
	public get ramp(): Ramp {
		return this._ramp;
	}

    /**
     * Setter ramp
     * @param {Ramp} value
     */
	public set ramp(value: Ramp) {
		this._ramp = value;
	}

    public toJSON(): object {

        let ramp_id;
        this.ramp == undefined ? ramp_id = '' : ramp_id = this.ramp.id;

        var surf = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            color: this.color,
            fire_type: this.fire_type,
            hrr: {
                hrr_type: this.hrr.hrr_type,
                time_function: this.hrr.time_function,
                value: this.hrr.value,
                spread_rate: this.hrr.spread_rate,
                alpha: this.hrr.alpha,
                tau_q: this.hrr.tau_q,
            },
            ramp_id: ramp_id
        }
        return surf;
    }
}