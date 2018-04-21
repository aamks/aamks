import { FdsEntities } from '../../../enums/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { toNumber, get, toString } from 'lodash';

export interface SpecObject {
	id: string,
	uuid: string,
	editable: boolean,
	formula: string,
	mw: number,
}
export class Spec {

	private _id: string;
	private _uuid: string;
	private _editable: boolean;
	private _formula: string;
	private _mw: number;

	constructor(jsonString: string) {

		let base: SpecObject;
		base = <SpecObject>JSON.parse(jsonString);

		let idGeneratorService = new IdGeneratorService;

		let SPEC = FdsEntities.SPEC;

		this.id = base.id || '';
		this.uuid = base.uuid || idGeneratorService.genUUID();

		this.editable = (get(base, 'editable', true) == true);
		this.formula = toString(get(base, 'formula', SPEC.FORMULA.default[0]));
		this.mw = toNumber(get(base, 'mw', SPEC.MW.default[0]));
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
     * Getter editable
     * @return {boolean}
     */
	public get editable(): boolean {
		return this._editable;
	}

    /**
     * Setter editable
     * @param {boolean} value
     */
	public set editable(value: boolean) {
		this._editable = value;
	}

    /**
     * Getter formula
     * @return {string}
     */
	public get formula(): string {
		return this._formula;
	}

    /**
     * Setter formula
     * @param {string} value
     */
	public set formula(value: string) {
		this._formula = value;
	}

    /**
     * Getter mw
     * @return {number}
     */
	public get mw(): number {
		return this._mw;
	}

    /**
     * Setter mw
     * @param {number} value
     */
	public set mw(value: number) {
		this._mw = value;
	}


	/** Export to json */
	public toJSON(): object {
		let spec = {
			id: this.id,
			uuid: this.uuid,
			editable: this.editable,
			formula: this.formula,
			mw: this.mw
		}
		return spec;
	}
}
