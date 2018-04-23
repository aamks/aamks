import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Spec } from '../specie/spec';
import { Part } from './part';
import { FdsEnums } from '../../../enums/fds/enums/fds-enums';
import { get, map, find, filter, includes, forEach } from 'lodash';
import { quantities } from '../../../enums/fds/enums/fds-enums-quantities';
import { Quantity } from '../primitives';

export interface IsofObject {
    id: string,
    uuid: string,
    quantity: Quantity,
    values: number[],
}

export class Isof {
    private _id: string;
    private _uuid: string;
    private _quantity: Quantity;
    private _values: number[];

    constructor(jsonString: string, specs?: Spec[], parts?: Part[]) {

        let base: IsofObject;
        base = <IsofObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();

        this.values = base.values || [];

        this.quantity = base.quantity != undefined ? new Quantity(JSON.stringify(base.quantity)) : new Quantity(JSON.stringify({}));
        this.quantity.specs = this.quantity.specs != undefined && this.quantity.specs.length > 0 ? map(this.quantity.specs, function(o) { return new Spec(JSON.stringify(o)); }) : [];
        this.quantity.parts = this.quantity.parts != undefined && this.quantity.parts.length > 0 ? map(this.quantity.parts, function(o) { return new Part(JSON.stringify(o)); }) : [];
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
     * Getter quantity
     * @return {Quantity}
     */
	public get quantity(): Quantity {
		return this._quantity;
	}

    /**
     * Setter quantity
     * @param {Quantity} value
     */
	public set quantity(value: Quantity) {
		this._quantity = value;
	}

    /**
     * Getter values
     * @return {number[]}
     */
	public get values(): number[] {
		return this._values;
	}

    /**
     * Setter values
     * @param {number[]} value
     */
	public set values(value: number[]) {
		this._values = value;
	}

    /** Export to json */
    public toJSON(): object {
        var self = this;
        var values = map(this.values, function (value) {
            return value['value'];
        })

        var isof = {
            id: this.id,
            uuid: this.uuid,
            quantity: this.quantity['quantity'],
            values: values,
            spec_id: get(self, 'spec_id.id', undefined)
        }
        return isof;
    }
}
