import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Xb, Xyz } from '../primitives';
import { FdsEntities } from '../../../enums/fds-entities';
import { Prop } from './prop';
import { Specie } from '../specie';
import { Part } from './part';
import { FdsGuiEntities } from '../../../enums/fds-gui-entities';
import { FdsEnums } from '../../../enums/fds-enums';
import { get, toString, find, toNumber, toInteger } from 'lodash';

export interface DevcObject {
    id: string,
    uuid: string,
    idAC: number,
    xb: Xb,
    xyz: Xyz,
    type: string,
    geometrical_type: string,
    quantity_type: string,
    quantity: any,
    spec_id: object,
    part_id: object,
    prop_id: object,
    setpoint: number,
    initial_state: boolean,
    latch: boolean,
    trip_direction: number,
    smoothing_factor: number,
    statistics: object
}

export class Devc {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _xb: Xb;
    private _xyz: Xyz;
    private _type: string;
    private _geometrical_type: string;
    private _quantity_type: string;
    private _quantity: object;
    private _spec_id: object;
    private _part_id: object;
    private _prop_id: object;
    private _setpoint: number;
    private _initial_state: boolean;
    private _latch: boolean;
    private _trip_direction: number;
    private _smoothing_factor: number;
    private _statistics: object;

    constructor(jsonString: string, props: Prop[] = undefined, specs: Specie[] = undefined, parts: Part[] = undefined) {

        let base: DevcObject;
        base = <DevcObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let DEVC = FdsEntities.DEVC;
        let GUI_DEVC = FdsGuiEntities.DEVC;
        let ENUMS = FdsEnums.DEVC;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.type = toString(get(base, 'type', GUI_DEVC.TYPE.default[0]));
        this.geometrical_type = toString(get(base, 'geometrical_type', GUI_DEVC.GEOMETRICAL_TYPE.default[0]));
        this.quantity_type = toString(get(base, 'quantity_type'));

        // TODO check toJSON <-> fdsObject
        this.quantity = get(base, 'quantity') === undefined ? {} : find(ENUMS.devcQuantity, (devc) => {
            return devc.quantity == base.quantity;
        });

        if (base.quantity && base.quantity['spec']) {
            if (!specs) {
                this.spec_id = base.spec_id || {};
            } else {
                let specie = find(specs, (spec) => {
                    return spec.id == base.quantity['spec'];
                });
                this.spec_id = specie;
            }
        }
        if (base.quantity && base.quantity['part']) {
            if (!parts) {
                this.part_id = base['part_id'] || {};
            } else {
                let part = find(parts, function (elem) {
                    // TODO ??
                    return elem.id == part;
                });
                this.part_id = part;
            }
        }

        if (base.prop_id) {
            if (!props) {
                this.prop_id = base.prop_id || {};
            } else {
                var prop = find(props, function (elem) {
                    // TODO ??
                    return elem.id == prop;
                });
                this.prop_id = prop;
            }
        }

        this.xb = new Xb(JSON.stringify(base.xb), 'devc') || new Xb(JSON.stringify({}), 'devc');
        this.xyz = new Xyz(JSON.stringify(base.xyz)) || new Xyz(JSON.stringify({}));

        this.setpoint = toNumber(get(base, 'setpoint', DEVC.SETPOINT.default[0]));
        this.initial_state = (get(base, 'initial_state', DEVC.INITIAL_STATE.default[0]) == true);
        this.latch = (get(base, 'latch', DEVC.LATCH.default[0] == true));
        this.trip_direction = toInteger(get(base, 'trip_direction', DEVC.TRIP_DIRECTION.default[0]));
        this.smoothing_factor = toNumber(get(base, 'smoothing_factor', DEVC.SMOOTHING_FACTOR.default[0]));
        this.statistics = {
            integral_lower: toNumber(get(base, 'statistics.integral_lower', DEVC.QUANTITY_RANGE.default[0])),
            integral_upper: toNumber(get(base, 'statistics.integral_upper', DEVC.QUANTITY_RANGE.default[1])),
            statistics: toString(get(base, 'statistics.statistics', ""))
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

    public get xb(): Xb {
        return this._xb;
    }

    public set xb(value: Xb) {
        this._xb = value;
    }

    public get xyz(): Xyz {
        return this._xyz;
    }

    public set xyz(value: Xyz) {
        this._xyz = value;
    }

    public get type(): string {
        return this._type;
    }

    public set type(value: string) {
        this._type = value;
    }

    public get geometrical_type(): string {
        return this._geometrical_type;
    }

    public set geometrical_type(value: string) {
        this._geometrical_type = value;
    }

    public get quantity_type(): string {
        return this._quantity_type;
    }

    public set quantity_type(value: string) {
        this._quantity_type = value;
    }

    public get quantity(): object {
        return this._quantity;
    }

    public set quantity(value: object) {
        this._quantity = value;
    }

    public get spec_id(): object {
        return this._spec_id;
    }

    public set spec_id(value: object) {
        this._spec_id = value;
    }

    public get part_id(): object {
        return this._part_id;
    }

    public set part_id(value: object) {
        this._part_id = value;
    }

    public get prop_id(): object {
        return this._prop_id;
    }

    public set prop_id(value: object) {
        this._prop_id = value;
    }

    public get setpoint(): number {
        return this._setpoint;
    }

    public set setpoint(value: number) {
        this._setpoint = value;
    }

    public get initial_state(): boolean {
        return this._initial_state;
    }

    public set initial_state(value: boolean) {
        this._initial_state = value;
    }

    public get latch(): boolean {
        return this._latch;
    }

    public set latch(value: boolean) {
        this._latch = value;
    }

    public get trip_direction(): number {
        return this._trip_direction;
    }

    public set trip_direction(value: number) {
        this._trip_direction = value;
    }

    public get smoothing_factor(): number {
        return this._smoothing_factor;
    }

    public set smoothing_factor(value: number) {
        this._smoothing_factor = value;
    }

    public get statistics(): object {
        return this._statistics;
    }

    public set statistics(value: object) {
        this._statistics = value;
    }

    public toJSON(): object {
        let devc: object = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            type: this.type,
            geometrical_type: this.geometrical_type,
            quantity_type: this.quantity_type,
            quantity: this.quantity['quantity'],
            prop_id: get(this, 'prop_id.id', undefined),
            setpoint: this.setpoint,
            initial_state: this.initial_state,
            latch: this.latch,
            trip_direction: this.trip_direction,
            spec_id: get(self, 'spec_id.id', undefined),
            part_id: get(self, 'part_id.id', undefined),
            xb: this.xb.toJSON(),
            xyz: this.xyz.toJSON(),
            statistics: this.statistics
        }
        return devc;
    }

}