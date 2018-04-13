import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import { Ramp } from './ramp';
import { get, toString, toNumber, find, round } from 'lodash';

export interface SurfVentObject {
    id: string,
    uuid: string,
    idAC: number,
    color: string,
    transparency: number,
    flow: any,
    heater: object,
    louver: object,
    ramp: Ramp,
    ramp_id: any
}

export class SurfVent {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _color: string;
    private _transparency: number;
    private _flow: any;
    private _heater: object;
    private _louver: object;
    private _ramp: Ramp;

    constructor(jsonString: string, ramps: Ramp[]) {

        let base: SurfVentObject;
        base = <SurfVentObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SURF = FdsEntities.SURF;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.color = toString(get(base, 'color', SURF.COLOR.default[0]));
        this.transparency = toNumber(get(base, 'transparency', SURF.TRANSPARENCY.default[0]));

        this.flow = {
            type: get(base, 'flow.type', 'velocity'),
            oldType: 'velocity',
            volume_flow: toNumber(get(base, 'flow.volume_flow', SURF.VOLUME_FLOW.default)),
            volume_flow_per_hour: toNumber(get(base, 'flow.volume_flow_per_hour', SURF.VOLUME_FLOW.default * 3600)),
            mass_flow: toNumber(get(base, 'flow.mass_flow', SURF.MASS_FLUX.default)),
            velocity: toNumber(get(base, 'flow.velocity', SURF.VEL.default))
        }

        this.heater = {
            active: (get(base, 'heater.active', false) == true),
            tmp_front: toNumber(get(base, 'heater.tmp_front', SURF.TMP_FRONT.default)),
        }

        this.louver = {
            active: (get(base, 'louver.active', false) == true),
            tangential1: toNumber(get(base, 'louver.tangential1', SURF.VEL_T.default[0])),
            tangential2: toNumber(get(base, 'louver.tangential2', SURF.VEL_T.default[1]))
        }

        ramps && base.ramp_id != '' ? this.ramp = find(ramps, function (ramp) { return ramp.id == base.ramp_id; }) : this.ramp = undefined;

    }

    /** Change flow type */
    public changeFlowType() {

        if (this.flow.type == 'velocity') {
            if (this.flow.oldType == 'volumeFlow') {

            } else if (this.flow.oldType == 'massFlow') {

            }
            this.flow.volume_flow = 0;
            this.flow.mass_flow = 0;

        } else if (this.flow.type == 'volumeFlow') {
            if (this.flow.oldType == 'velocity') {

            } else if (this.flow.oldType == 'massFlow') {

            }
            this.flow.velocity = 0;
            this.flow.mass_flow = 0;

        } else if (this.flow.type == 'massFlow') {
            if (this.flow.oldType == 'velocity') {

            } else if (this.flow.oldType == 'massFlow') {

            }
            this.flow.volume_flow = 0;
            this.flow.mass_flow = 0;
        }
    }

    /** Recalculate volume flow */
    public calcVolumeFlow(event: any, perHour?: boolean) {
        if (perHour) {
            this.flow.volume_flow = event;
            this.flow.volume_flow_per_hour = this.flow.volume_flow * 3600
        }
        else {
            this.flow.volume_flow_per_hour = event;
            this.flow.volume_flow = round(this.flow.volume_flow_per_hour / 3600, 4);
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

    public get transparency(): number {
        return this._transparency;
    }

    public set transparency(value: number) {
        this._transparency = value;
    }

    public get flow(): any {
        return this._flow;
    }

    public set flow(value: any) {
        this._flow = value;
    }

    public get heater(): object {
        return this._heater;
    }

    public set heater(value: object) {
        this._heater = value;
    }

    public get louver(): object {
        return this._louver;
    }

    public set louver(value: object) {
        this._louver = value;
    }

    public get ramp(): Ramp {
        return this._ramp;
    }

    public set ramp(value: Ramp) {
        this._ramp = value;
    }

    public toJSON() {
        let flow = {};

        if (this.flow.type == 'velocity') {
            flow = {
                type: 'velocity',
                velocity: this.flow.velocity
            }
        } else if (this.flow.type == 'volumeFlow') {
            flow = {
                type: 'volumeFlow',
                volume_flow: this.flow.volume_flow,
                volume_flow_per_hour: this.flow.volume_flow_per_hour
            }
        } else if (this.flow.type == 'massFlow') {
            flow = {
                type: 'massFlow',
                mass_flow: this.flow.mass_flow
            }
        } else {
            flow = {};
        }

        let ramp_id;
        this.ramp == undefined ? ramp_id = '' : ramp_id = this.ramp['id'];

        var surf = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            color: this.color,
            flow: flow,
            heater: {
                active: this.heater['active'],
                tmp_front: this.heater['tmp_front']
            },
            louver: {
                active: this.louver['active'],
                tangential1: this.louver['tangential1'],
                tangential2: this.louver['tangential2']
            },
            ramp_id: ramp_id
        }
        return surf;
    }
}