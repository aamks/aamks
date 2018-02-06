import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import * as _ from 'lodash';
import { Ramp } from './ramp';

export interface SurfFireObject {
    id: string,
    uuid: string,
    idAC: number,
    color: string,
    fire_type: string,
    hrr: {
        hrr_type: string,
        value: number,
        spread_rate: number,
        alpha: number,
        time_function: string,
        tau_q: number,
        area: number
    },
    ramp_id: string,
}

export class SurfFire {

    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _color: string;
    private _fire_type: string;
    private _hrr: object;
    private _ramp: object;

    constructor(jsonString: string, ramps: Ramp[] = undefined) {

        let base: SurfFireObject;
        base = <SurfFireObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SURF = FdsEntities.SURF;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.color = _.toString(_.get(base, 'color', SURF.COLOR.default[0]));
        this.fire_type = base['fire_type'] || 'constant_hrr';

        this.hrr = {
            hrr_type: _.get(base, 'hrr.hrr_type', 'hrrpua'),
            value: _.toNumber(_.get(base, 'hrr.value', SURF.HRRPUA.default[0])),
            spread_rate: _.toNumber(_.get(base, 'hrr.spread_rate', 0)),
            alpha: _.toNumber(_.get(base, 'hrr.alpha', 0)),
            time_function: _.get(base, 'time_function', 'ramp'),
            tau_q: _.toNumber(_.get(base, 'hrr.tau_q', SURF.TAU_Q.default[0])),
        }
        if (base['hrr'])
            this.hrr['area'] = base.hrr.area || 0;
        else
            this.hrr['area'] = 0;

        if (base['ramp_id'] == '') {
            this.ramp = { id: '' };
        }
        // Jeeli kopiujemy z biblioteki
        else if (typeof base['ramp'] === 'object' && base['ramp'] != null) {
            this.ramp = base['ramp'];
        }
        // Jezeli jest nazwa
        else {
            if (!ramps) {
                this.ramp = { id: '' };
            } else {
                this.ramp = _.find(ramps, (ramp) => {
                    return ramp.id == base.ramp_id;
                });
                if (this.ramp === undefined)
                    this.ramp = { id: '' };
            }
        }

    }

    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public set uuid(value: string) {
        this._uuid = value;
    }

    public get idAC(): number {
        return this._idAC;
    }

    public set idAC(value: number) {
        this._idAC = value;
    }

    public get color(): string {
        return this._color;
    }

    public set color(value: string) {
        this._color = value;
    }

    public get fire_type(): string {
        return this._fire_type;
    }

    public set fire_type(value: string) {
        this._fire_type = value;
    }

    public get hrr(): object {
        return this._hrr;
    }

    public set hrr(value: object) {
        this._hrr = value;
    }

    public get ramp(): object {
        return this._ramp;
    }

    public set ramp(value: object) {
        this._ramp = value;
    }

    public toJSON(): object {
        var surf = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            color: this.color,
            fire_type: this.fire_type,
            hrr: {
                hrr_type: this.hrr['hrr_type'],
                time_function: this.hrr['time_function'],
                value: this.hrr['value'],
                spread_rate: this.hrr['spread_rate'],
                alpha: this.hrr['alpha'],
                tau_q: this.hrr['tau_q'],
            },
            ramp_id: this.ramp['id']
        }
        return surf;
    }

}