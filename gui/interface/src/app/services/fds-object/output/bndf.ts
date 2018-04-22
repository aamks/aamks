import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Spec } from '../specie/spec';
import { Part } from './part';
import { FdsEnums } from '../../../enums/fds/enums/fds-enums';
import { get, map, find, filter, includes, merge } from 'lodash';
import { quantities } from '../../../enums/fds/enums/fds-enums-quantities';
import { species } from '../../../enums/fds/enums/fds-enums-species';

export interface BndfObject {
    id: string,
    uuid: string,
    idAC: number,
    label: string,
    quantity: object,
    spec: boolean,
    specs: object[],
    part: boolean,
    parts: object[]
}

export class Bndf {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _quantity: any;
    private _spec: boolean;
    private _specs: object[];
    private _part: boolean;
    private _parts: object[];

    constructor(jsonString: string, specs?: Spec[], parts?: Part[]) {

        let base: BndfObject;
        base = <BndfObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        //let QUANTITIES = filter(quantities, function(o) { return includes(o.type, 'b') });
        //let SPECIES = merge(map(species, function(o) { return new Spec(JSON.stringify(o)) }), specs);

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.quantity = get(base, 'quantity', undefined);

        this.spec = (get(base, 'spec', true) == true);
        this.part = (get(base, 'part', true) == true);

        this.specs = this.spec && base.specs != undefined && base.specs.length > 0 ? map(base.specs, function(o) { return new Spec(JSON.stringify(o)) }) : [];
        this.parts = this.part && base.parts != undefined && base.parts.length > 0 ? map(base.parts, function(o) { return new Part(JSON.stringify(o)) }) : [];
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
     * Getter quantity
     * @return {any}
     */
	public get quantity(): any {
		return this._quantity;
	}

    /**
     * Setter quantity
     * @param {any} value
     */
	public set quantity(value: any) {
		this._quantity = value;
	}

    /**
     * Getter spec
     * @return {boolean}
     */
	public get spec(): boolean {
		return this._spec;
	}

    /**
     * Setter spec
     * @param {boolean} value
     */
	public set spec(value: boolean) {
		this._spec = value;
	}

    /**
     * Getter specs
     * @return {object[]}
     */
	public get specs(): object[] {
		return this._specs;
	}

    /**
     * Setter specs
     * @param {object[]} value
     */
	public set specs(value: object[]) {
		this._specs = value;
	}

    /**
     * Getter part
     * @return {boolean}
     */
	public get part(): boolean {
		return this._part;
	}

    /**
     * Setter part
     * @param {boolean} value
     */
	public set part(value: boolean) {
		this._part = value;
	}

    /**
     * Getter parts
     * @return {object[]}
     */
	public get parts(): object[] {
		return this._parts;
	}

    /**
     * Setter parts
     * @param {object[]} value
     */
	public set parts(value: object[]) {
		this._parts = value;
	}

    /** Export to json */
    public toJSON(): object {

        let specs = this.spec && this.specs.length > 0 ? map(this.specs, function(o: Spec) { return o.toJSON() }) : [];
        let parts = this.part && this.parts.length > 0 ? map(this.parts, function(o: Part) { return o.toJSON() }) : [];

        var bndf = {
            id: this.id,
            uuid: this.uuid,
            quantity: this.quantity,
            spec: this.spec,
            part: this.part,
            specs: specs,
            parts: parts
        }
        return bndf;
    }
}
