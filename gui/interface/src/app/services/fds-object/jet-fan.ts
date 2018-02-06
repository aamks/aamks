import { Xb } from './primitives';
import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import * as _ from 'lodash';
import { Ramp } from './ramp';

export interface JetFanObject {
    id: string,
    uuid: string,
    idAC: number,
    color: string,
    transparency: number,
    elevation: number,
    xb: Xb,
    flow: any,
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
        this.color = _.toString(_.get(base, 'color', SURF.COLOR.default[0]));
        this.transparency = _.toNumber(_.get(base, 'transparency', SURF.TRANSPARENCY.default[0]));

        this.xb = new Xb(_.toArray(base.xb)) || new Xb(VENT.XB.default);

        this.flow = {
            type: _.get(base, 'flow.type', 'volumeFlow'),
            oldType: 'volumeFlow',
            volume_flow: _.toNumber(_.get(base, 'flow.volume_flow', SURF.VOLUME_FLOW.default[0])),
            volume_flow_per_hour: _.toNumber(_.get(base, 'flow.volume_flow_per_hour', SURF.VOLUME_FLOW.default[0] * 3600)),
            mass_flow: _.toNumber(_.get(base, 'flow.mass_flow', SURF.MASS_FLUX.default[0])),
            velocity: _.toNumber(_.get(base, 'flow.velocity', SURF.VEL.default[0]))
        }

        this.heater = {
            active: (_.get(base, 'heater.active', false) == true),
            tmp_front: _.toNumber(_.get(base, 'heater.tmp_front', SURF.TMP_FRONT.default[0])),
        }

        this.direction = _.get(base, 'direction', '+x');

        this.louver = {
            active: (_.get(base, 'louver.active', false) == true),
            tangential1: _.toNumber(_.get(base, 'louver.tangential1', SURF.VEL_T.default[0])),
            tangential2: _.toNumber(_.get(base, 'louver.tangential2', SURF.VEL_T.default[1])),
            tangential3: _.toNumber(_.get(base, 'louver.tangential2', SURF.VEL_T.default[2]))
        }

        this.area = {
            type: _.get(base, 'area.type', 'area'),
            oldType: 'area',
            area: _.toNumber(_.get(base, 'area.area', HVAC.AREA.default[0])),
            diameter: _.toNumber(_.get(base, 'area.diameter', HVAC.DIAMETER.default[0])),
            perimeter: _.toNumber(_.get(base, 'area.perimeter', HVAC.PERIMETER.default[0]))
        }

        this.devc = {
            active: (_.get(base, 'devc.active', false) == true),
            setpoint: _.toNumber(_.get(base, 'devc.setpoint', DEVC.SETPOINT.default[0]))
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

        let jetfan = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            direction: this.direction,
            elevation: this.elevation,
            flow: flow,
            area: area,
            ramp_id: this.ramp['id'],
            louver: {
                active: this.louver['active'],
                tangential1: this.louver['tangential1'],
                tangential2: this.louver['tangential2'],
                tangential3: this.louver['tangential3']
            },
            xb: {
                x1: this.xb.x1,
                x2: this.xb.x2,
                y1: this.xb.y1,
                y2: this.xb.y2,
                z1: this.xb.z1,
                z2: this.xb.z2
            },
            devc: {
                active: this.devc['active'],
                setpoint: this.devc['setpoint'],
            },
        }
        return jetfan;
    }
}
