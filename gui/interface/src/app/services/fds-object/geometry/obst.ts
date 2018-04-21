import { Surf } from './surf';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Xb } from "../primitives";
import { Devc } from '../output/devc';
import { find, get, set, toArray } from 'lodash';
import { Ctrl } from '../output/ctrl';
import { FdsEntities } from '../../../enums/fds-entities';

export interface SurfObject {
		type?: string,
		oldType?: string,
		surf_id?: string | Surf, // base object include only id to not export to db whole object of surf
		surf_idx?: string | Surf,
		surf_idy?: string | Surf,
		surf_idz?: string | Surf,
		surf_id1?: string | Surf,
		surf_id2?: string | Surf,
		surf_id3?: string | Surf,
		surf_id4?: string | Surf,
		surf_id5?: string | Surf,
		surf_id6?: string | Surf
}

export interface ObstObject {
	id: string,
	uuid: string,
	idAC: number,
	xb: Xb,
	surf: SurfObject,
	elevation: number,
	ctrl_id: string,
	devc_id: string
}

export class Obst {
	private _id: string;
	private _uuid: string;
	private _idAC: number;
	private _xb: Xb;
	private _surf: SurfObject;
	private _elevation: number;
	private _thicken: boolean;
	private _overlay: boolean;
	private _permit_hole: boolean;
	private _removable: boolean;
	private _ctrl: Ctrl;
	private _devc: Devc;

	constructor(jsonString: string, surfs: Surf[] = undefined, devcs: Devc[] = undefined) {

		let base: ObstObject;
		base = <ObstObject>JSON.parse(jsonString);

		let idGeneratorService = new IdGeneratorService;

		let OBST = FdsEntities.OBST;

		this.id = base.id || '';
		this.uuid = base.uuid || idGeneratorService.genUUID();
		this.idAC = base.idAC || 0;

		this.xb = new Xb(JSON.stringify(base.xb)) || new Xb(JSON.stringify({}));

		this.elevation = base.elevation || 0;

		// If base.surf isset
		if (base.surf) {
			// Depending on surf type assign surf object
			switch (base.surf.type) {
				case 'surf_id':
					this.surf = {
						type: 'surf_id',
						oldType: 'surf_id',
						// Compare JSON surf_id to surf.id (object)
						surf_id: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id;
						})
					};
					break;
				case 'surf_ids':
					this.surf = {
						type: 'surf_ids',
						oldType: 'surf_id',
						surf_idx: find(surfs, function (surf) {
							return surf.id == base.surf.surf_idx;
						}),
						surf_idy: find(surfs, function (surf) {
							return surf.id == base.surf.surf_idy;
						}),
						surf_idz: find(surfs, function (surf) {
							return surf.id == base.surf.surf_idz;
						})
					};
					break;
				case 'surf_id6':
					this.surf = {
						type: 'surf_id6',
						oldType: 'surf_id',
						surf_id1: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id1;
						}),
						surf_id2: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id2;
						}),
						surf_id3: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id3;
						}),
						surf_id4: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id4;
						}),
						surf_id5: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id5;
						}),
						surf_id6: find(surfs, function (surf) {
							return surf.id == base.surf.surf_id6;
						})
					};
					break;
				default:
					this.surf = {
						type: 'surf_id',
						surf_id: undefined, // Create empty object with id = ''
						oldType: 'surf_id'
					}
			}
		} else {
			this.surf = {
				type: 'surf_id',
				surf_id: undefined,
				oldType: 'surf_id'
			}
		}

		this.thicken = get(base, 'thicken', OBST.THICKEN.default[0]);
		this.overlay = get(base, 'overlay', OBST.OVERLAY.default[0]);
		this.permit_hole = get(base, 'permit_hole', OBST.PERMIT_HOLE.default[0]);
		this.removable = get(base, 'removable', OBST.REMOVABLE.default[0]);

		// TODO check
		this.ctrl = get(base, 'ctrl') === undefined ? this.ctrl = undefined : new Ctrl(JSON.stringify({}));

		// Create device based on devc_id
		this.devc = get(base, 'devc') === undefined ? this.devc = undefined : this.devc = find(devcs, (devc) => { return devc.id == base.devc_id; });
	}

	/** Change surf type and assign surfs */
	public changeSurfType(): void {
		if (this.surf['type'] == 'surf_id') {
			if (this.surf['oldType'] == 'surf_ids') {
				this.surf = {
					type: this.surf['type'],
					surf_id: this.surf['surf_idx']
				}
			} else if (this.surf['oldType'] == 'surf_id6') {
				this.surf = {
					type: this.surf['type'],
					surf_id: this.surf['surf_id1']
				}
			}
		} else if (this.surf['type'] == 'surf_ids') {
			if (this.surf['oldType'] == 'surf_id') {
				this.surf = {
					type: this.surf['type'],
					surf_idx: this.surf['surf_id'],
					surf_idy: this.surf['surf_id'],
					surf_idz: this.surf['surf_id']
				}
			} else if (this.surf['oldType'] == 'surf_id6') {
				this.surf = {
					type: this.surf['type'],
					surf_idx: this.surf['surf_id1'],
					surf_idy: this.surf['surf_id3'],
					surf_idz: this.surf['surf_id5']
				}
			}
		} else if (this.surf['type'] == 'surf_id6') {
			if (this.surf['oldType'] == 'surf_id') {
				this.surf = {
					type: this.surf['type'],
					surf_id1: this.surf['surf_id'],
					surf_id2: this.surf['surf_id'],
					surf_id3: this.surf['surf_id'],
					surf_id4: this.surf['surf_id'],
					surf_id5: this.surf['surf_id'],
					surf_id6: this.surf['surf_id']
				}
			} else if (this.surf['oldType'] == 'surf_ids') {
				this.surf = {
					type: this.surf['type'],
					surf_id1: this.surf['surf_idx'],
					surf_id2: this.surf['surf_idx'],
					surf_id3: this.surf['surf_idy'],
					surf_id4: this.surf['surf_idy'],
					surf_id5: this.surf['surf_idz'],
					surf_id6: this.surf['surf_idz']
				}
			}
		}
		this.surf['oldType'] = this.surf['type'];
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

	public get surf(): SurfObject {
		return this._surf;
	}

	public set surf(value: SurfObject) {
		this._surf = value;
	}

	public get elevation(): number {
		return this._elevation;
	}

	public set elevation(value: number) {
		this._elevation = value;
	}

	public get thicken(): boolean {
		return this._thicken;
	}

	public set thicken(value: boolean) {
		this._thicken = value;
	}

	public get overlay(): boolean {
		return this._overlay;
	}

	public set overlay(value: boolean) {
		this._overlay = value;
	}

	public get permit_hole(): boolean {
		return this._permit_hole;
	}

	public set permit_hole(value: boolean) {
		this._permit_hole = value;
	}

	public get removable(): boolean {
		return this._removable;
	}

	public set removable(value: boolean) {
		this._removable = value;
	}

	public get ctrl(): Ctrl {
		return this._ctrl;
	}

	public set ctrl(value: Ctrl) {
		this._ctrl = value;
	}

	public get devc(): Devc {
		return this._devc;
	}

	public set devc(value: Devc) {
		this._devc = value;
	}

	public toJSON(): object {
		let surf = {};
		if (this.surf['type'] == 'surf_id') {
			surf = {
				type: 'surf_id',
				surf_id: get(this, 'surf.surf_id.id', undefined)
			}
		} else if (this.surf['type'] == 'surf_ids') {
			surf = {
				type: 'surf_ids',
				surf_idx: get(this, 'surf.surf_idx.id', undefined),
				surf_idy: get(this, 'surf.surf_idy.id', undefined),
				surf_idz: get(this, 'surf.surf_idz.id', undefined),
			}

		} else if (this.surf['type'] == 'surf_id6') {
			surf = {
				type: 'surf_id6',
				surf_id1: get(this, 'surf.surf_id1.id', undefined),
				surf_id2: get(this, 'surf.surf_id2.id', undefined),
				surf_id3: get(this, 'surf.surf_id3.id', undefined),
				surf_id4: get(this, 'surf.surf_id4.id', undefined),
				surf_id5: get(this, 'surf.surf_id5.id', undefined),
				surf_id6: get(this, 'surf.surf_id6.id', undefined)
			}
		} else {
			surf = undefined;
		}

        let devc_id;
		this.devc == undefined ? devc_id = '': devc_id = this.devc.id;

        let ctrl_id;
		this.ctrl == undefined ? ctrl_id = '': ctrl_id = this.ctrl.id;

		var obst = {
			id: this.id,
			uuid: this.uuid,
			idAC: this.idAC,
			elevation: this.elevation,
			thicken: this.thicken,
			permit_hole: this.permit_hole,
			overlay: this.overlay,
			removable: this.removable,
			xb: this.xb,
			ctrl_id: ctrl_id,
			devc_id: devc_id,
			surf: surf
		}
		return obst;
	}

}
