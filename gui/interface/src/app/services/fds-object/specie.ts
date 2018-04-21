import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import { toNumber, get, toString } from 'lodash';

export interface SpecieObject {
	id: number,
	uuid: string,
	editable: boolean,
	formula: string,
	mw: number,
}
export class Specie {

	private _id: number;
	private _uuid: string;
	private _editable: boolean;
	private _formula: string;
	private _mw: number;

	constructor(jsonString: string) {

		let base: SpecieObject;
		base = <SpecieObject>JSON.parse(jsonString);

		let idGeneratorService = new IdGeneratorService;

		let SPEC = FdsEntities.SPEC;

		this.id = base.id || 0;
		this.uuid = base.uuid || idGeneratorService.genUUID();

		this.editable = (get(base, 'editable', true) == true);
		this.formula = toString(get(base, 'formula', SPEC.FORMULA.default[0]));
		this.mw = toNumber(get(base, 'mw', SPEC.MW.default[0]));

	}

	public get id(): number {
		return this._id;
	}

	public set id(value: number) {
		this._id = value;
	}

	public get uuid(): string {
		return this._uuid;
	}

	public set uuid(value: string) {
		this._uuid = value;
	}

	public get editable(): boolean {
		return this._editable;
	}

	public set editable(value: boolean) {
		this._editable = value;
	}

	public get formula(): string {
		return this._formula;
	}

	public set formula(value: string) {
		this._formula = value;
	}

	public get mw(): number {
		return this._mw;
	}

	public set mw(value: number) {
		this._mw = value;
	}

	public toJSON(): object {
		let specie = {
			id: this.id,
			uuid: this.uuid,
			editable: this.editable,
			formula: this.formula,
			mw: this.mw
		}
		return specie;
	}
}
