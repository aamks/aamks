import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import { Surf } from './surf';
import { Xb } from './primitives';
import { Devc } from './devc';
import { get, find, toArray } from 'lodash';

export interface ObstObject {
	id: string,
	uuid: string,
	idAC: number,
	elevation: number,
	xb: Xb,
	devc_id: string
}

export class Hole {
	private _id: string;
	private _uuid: string;
	private _idAC: number;
	private _xb: Xb;
	private _devc: Devc;
	private _elevation: number;

	constructor(jsonString: string, surfs: Surf[] = undefined, devcs: Devc[] = undefined) {

		let base: ObstObject;
		base = <ObstObject>JSON.parse(jsonString);

		let idGeneratorService = new IdGeneratorService;

		let HOLE = FdsEntities.HOLE;

		this.id = base.id || '';
		this.uuid = base.uuid || idGeneratorService.genUUID();
		this.idAC = base.idAC || 0;
		this.elevation = base.elevation || 0;

		this.xb = new Xb(toArray(base.xb)) || new Xb(HOLE.XB.default);

		// Create device based on devc_id
		this.devc = get(base, 'devc') === undefined ? undefined : find(devcs, (devc) => { return devc.id == base.devc_id; });
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

	public get devc(): Devc {
		return this._devc;
	}

	public set devc(value: Devc) {
		this._devc = value;
	}

	public get elevation(): number {
		return this._elevation;
	}

	public set elevation(value: number) {
		this._elevation = value;
	}

	public toJSON(): object {
		var obst = {
			id: this.id,
			uuid: this.uuid,
			idAC: this.idAC,
			elevation: this.elevation,
			xb: this.xb,
			devc_id: this.devc.id,
		}
		return obst;
	}
}
