import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Xb, Quantity } from '../primitives';
import { Spec } from '../specie/spec';
import { Part } from './part';
import { FdsEnums } from '../../../enums/fds/enums/fds-enums';
import { map, toString, get, toNumber, find, filter, includes, forEach } from 'lodash';
import { quantities } from '../../../enums/fds/enums/fds-enums-quantities';


export interface SlcfObject {
    id: string,
    uuid: string,
    idAC: number,
    xb: Xb,
    direction: string,
    value: number,
    quantities: Quantity[],
}

export class Slcf {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _xb: Xb;
    private _direction: string;
    private _value: number;
    private _quantities: Quantity[];

    constructor(jsonString: string, specs?: Spec[], parts?: Part[]) {

        let base: SlcfObject;
        base = <SlcfObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        //let SLCF = FdsEntities.SLCF;
        //let GUI_DEVC = FdsGuiEntities.DEVC;
        //let QUANTITIES = filter(quantities, function(o) { return includes(o.type, 's') });

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.direction = toString(get(base, 'direction', 'x'));
        this.value = toNumber(get(base, 'value', 0));

        this.quantities = base.quantities != undefined && base.quantities.length > 0 ? base.quantities : [];

        forEach(this.quantities, function(o) {
            o.specs = o.specs != undefined && o.specs.length > 0 ? map(o.specs, function(e) { return new Spec(JSON.stringify(e)); }) : [];
            o.parts = o.parts != undefined && o.parts.length > 0 ? map(o.parts, function(e) { return new Part(JSON.stringify(e)); }) : [];
        });

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
     * Getter xb
     * @return {Xb}
     */
	public get xb(): Xb {
		return this._xb;
	}

    /**
     * Setter xb
     * @param {Xb} value
     */
	public set xb(value: Xb) {
		this._xb = value;
	}

    /**
     * Getter direction
     * @return {string}
     */
	public get direction(): string {
		return this._direction;
	}

    /**
     * Setter direction
     * @param {string} value
     */
	public set direction(value: string) {
		this._direction = value;
	}

    /**
     * Getter value
     * @return {number}
     */
	public get value(): number {
		return this._value;
	}

    /**
     * Setter value
     * @param {number} value
     */
	public set value(value: number) {
		this._value = value;
	}

    /**
     * Getter quantities
     * @return {Quantity[]}
     */
	public get quantities(): Quantity[] {
		return this._quantities;
	}

    /**
     * Setter quantities
     * @param {Quantity[]} value
     */
	public set quantities(value: Quantity[]) {
		this._quantities = value;
	}

    /** Export to json */
    public toJSON(): object {

        let quantities = this.quantities.length > 0 ? map(this.quantities, (o) => { return o.toJSON() }) : [];
        console.log(quantities);

        let slcf = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            direction: this.direction,
            value: this.value,
            quantities: quantities
        }
        return slcf;
    }
}