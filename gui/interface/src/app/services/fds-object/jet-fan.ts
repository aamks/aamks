import { Xb } from './primitives';
import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import { Ramp } from './ramp';
import { find, get, toNumber, toArray, toString, round } from 'lodash';

export interface JetFanObject {
    id: string,
    uuid: string,
    idAC: number,
    color: string,
    transparency: number,
    elevation: number,
    xb: Xb,
    flow: {
        type: string,
        oldType: string,
        volume_flow: number,
        volume_flow_per_hour: number,
        mass_flow: number,
        velocity: number
    },
    heater: object,
    louver: object,
    ramp: any,
    ramp_id: any,
    direction: string
}

export class JetFan {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _color: string;
    private _transparency: number;
    private _elevation: number;
    private _xb: Xb;
    private _flow: any;
    private _heater: object;
    private _louver: object;
    private _ramp: object;
    private _direction: string;
    private _area: object;
    private _devc: object;

    constructor(jsonString: string, ramps: Ramp[]) {

        let base: JetFanObject;
        base = <JetFanObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SURF = FdsEntities.SURF;
        let VENT = FdsEntities.VENT;
        let HVAC = FdsEntities.HVAC;
        let DEVC = FdsEntities.DEVC;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.color = toString(get(base, 'color', SURF.COLOR.default[0]));
        this.transparency = toNumber(get(base, 'transparency', SURF.TRANSPARENCY.default));

        this.xb = new Xb(JSON.stringify(base.xb)) || new Xb(JSON.stringify({}));

        this.flow = {
            type: get(base, 'flow.type', 'volumeFlow'),
            oldType: 'volumeFlow',
            volume_flow: toNumber(get(base, 'flow.volume_flow', SURF.VOLUME_FLOW.default)),
            volume_flow_per_hour: toNumber(get(base, 'flow.volume_flow_per_hour', SURF.VOLUME_FLOW.default * 3600)),
            mass_flow: toNumber(get(base, 'flow.mass_flow', SURF.MASS_FLUX.default)),
            velocity: toNumber(get(base, 'flow.velocity', SURF.VEL.default))
        }

        this.heater = {
            active: (get(base, 'heater.active', false) == true),
            tmp_front: toNumber(get(base, 'heater.tmp_front', SURF.TMP_FRONT.default)),
        }

        this.direction = get(base, 'direction', '+x');

        this.louver = {
            active: (get(base, 'louver.active', false) == true),
            tangential1: toNumber(get(base, 'louver.tangential1', SURF.VEL_T.default[0])),
            tangential2: toNumber(get(base, 'louver.tangential2', SURF.VEL_T.default[1])),
            tangential3: toNumber(get(base, 'louver.tangential2', SURF.VEL_T.default[2]))
        }

        this.area = {
            type: get(base, 'area.type', 'area'),
            oldType: 'area',
            area: toNumber(get(base, 'area.area', HVAC.AREA.default[0])),
            diameter: toNumber(get(base, 'area.diameter', HVAC.DIAMETER.default[0])),
            perimeter: toNumber(get(base, 'area.perimeter', HVAC.PERIMETER.default[0]))
        }

        this.devc = {
            active: (get(base, 'devc.active', false) == true),
            setpoint: toNumber(get(base, 'devc.setpoint', DEVC.SETPOINT.default[0]))
        }

        ramps && base.ramp != undefined ? this.ramp = find(ramps, function (ramp) { return ramp.id == base.ramp_id; }) : this.ramp = undefined;

    }

    /** Desc ... */
    changeAreaType() {
        if (this.area['type'] == 'area') {
            this.area['area'] = 0;
        } else if (this.area['type'] == 'diameter') {
            this.area['diameter'] = 0;
        } else if (this.area['type'] == 'perimeter') {
            this.area['perimeter'] = 0;
        }
    }

    /** Desc ... */
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

    public get elevation(): number {
        return this._elevation;
    }

    public set elevation(value: number) {
        this._elevation = value;
    }

    public get xb(): Xb {
        return this._xb;
    }

    public set xb(value: Xb) {
        this._xb = value;
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

    public get direction(): string {
        return this._direction;
    }

    public set direction(value: string) {
        this._direction = value;
    }

    public get area(): object {
        return this._area;
    }

    public set area(value: object) {
        this._area = value;
    }

    public get devc(): object {
        return this._devc;
    }

    public set devc(value: object) {
        this._devc = value;
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

        var area = {};
        if (this.area['type'] == 'area') {
            area = {
                type: 'area',
                area: this.area['area']
            }
        } else if (this.area['type'] == 'diameter') {
            area = {
                type: 'diameter',
                diameter: this.area['diameter']
            }
        } else if (this.area['type'] == 'perimeter') {
            area = {
                type: 'perimeter',
                perimeter: this.area['perimeter']
            }
        } else {
            area = {};
        }

        let ramp_id;
        this.ramp == undefined ? ramp_id = '' : ramp_id = this.ramp['id'];

        let jetfan = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            direction: this.direction,
            elevation: this.elevation,
            flow: flow,
            area: area,
            ramp_id: ramp_id,
            louver: {
                active: this.louver['active'],
                tangential1: this.louver['tangential1'],
                tangential2: this.louver['tangential2'],
                tangential3: this.louver['tangential3']
            },
            xb: this.xb.toJSON(),
            devc: {
                active: this.devc['active'],
                setpoint: this.devc['setpoint'],
            },
        }
        return jetfan;
    }
}
