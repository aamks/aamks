import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Surf } from './surf';
import { Xb } from '../primitives';
import { Devc } from '../output/devc';
import { get, find, toArray } from 'lodash';

export interface HoleObject {
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

		let base: HoleObject;
		base = <HoleObject>JSON.parse(jsonString);

		let idGeneratorService = new IdGeneratorService;

		let HOLE = FdsEntities.HOLE;

		this.id = base.id || '';
		this.uuid = base.uuid || idGeneratorService.genUUID();
		this.idAC = base.idAC || 0;
		this.elevation = base.elevation || 0;

		this.xb = new Xb(JSON.stringify(base.xb)) || new Xb(JSON.stringify({}));

		// Create device based on devc_id
		this.devc = get(base, 'devc') === undefined ? this.devc = undefined : this.devc = find(devcs, (devc) => { return devc.id == base.devc_id; });
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

        let devc_id;
		this.devc == undefined ? devc_id = '': devc_id = this.devc.id;

		var hole = {
			id: this.id,
			uuid: this.uuid,
			idAC: this.idAC,
			elevation: this.elevation,
			xb: this.xb.toJSON(),
			devc_id: devc_id,
		}
		return hole;
	}
}
