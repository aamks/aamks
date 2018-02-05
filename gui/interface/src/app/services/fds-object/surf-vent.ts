import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import * as _ from 'lodash';
import { Ramp } from './ramp';

export interface SurfVentObject {
    id: string,
    uuid: string,
    idAC: number,
    color: string,
    transparency: number,
    flow: any,
    heater: object,
    louver: object,
    ramp: any,
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
    private _ramp: object;

    constructor(jsonString: string, ramps: Ramp[]) {

        let base: SurfVentObject;
        base = <SurfVentObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SURF = FdsEntities.SURF;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.color = _.toString(_.get(base, 'color', SURF.COLOR.default[0]));
        this.transparency = _.toNumber(_.get(base, 'transparency', SURF.TRANSPARENCY.default[0]));

        this.flow = {
            type: _.get(base, 'flow.type', 'velocity'),
            oldType: 'velocity',
            volume_flow: _.toNumber(_.get(base, 'flow.volume_flow', SURF.VOLUME_FLOW.default[0])),
            volume_flow_per_hour: _.toNumber(_.get(base, 'flow.volume_flow_per_hour', SURF.VOLUME_FLOW.default[0] * 3600)),
            mass_flow: _.toNumber(_.get(base, 'flow.mass_flow', SURF.MASS_FLUX.default[0])),
            velocity: _.toNumber(_.get(base, 'flow.velocity', SURF.VEL.default[0]))
        }

        this.heater = {
            active: (_.get(base, 'heater.active', false) == true),
            tmp_front: _.toNumber(_.get(base, 'heater.tmp_front', SURF.TMP_FRONT.default[0])),
        }

        this.louver = {
            active: (_.get(base, 'louver.active', false) == true),
            tangential1: _.toNumber(_.get(base, 'louver.tangential1', SURF.VEL_T.default[0])),
            tangential2: _.toNumber(_.get(base, 'louver.tangential2', SURF.VEL_T.default[1]))
        }

        this.ramp = {};
        if (typeof base.ramp === 'object' && base.ramp != null) {
            this.ramp = base.ramp;
        }
        // Jezeli jest nazwa
        else {
            if (ramps) {
                this.ramp = _.find(ramps, function (ramp) {
                    return ramp.id == base.ramp_id;
                });
            }
        }

    }

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

    public get ramp(): object {
        return this._ramp;
    }

    public set ramp(value: object) {
        this._ramp = value;
    }

    public toJSON() {
        var flow = {};

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
            ramp_id: this.ramp['id']
        }
        return surf;
    }
}