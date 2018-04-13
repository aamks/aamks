import { Fire } from '../fds-object/fire';
import { JetFan } from '../fds-object/jet-fan';
import { Surf } from '../fds-object/surf';
import { Matl } from '../fds-object/matl';
import { Ramp } from '../fds-object/ramp';
import { get, map } from 'lodash';
import { SurfVent } from '../fds-object/surf-vent';

export interface LibraryObject {
	ramps: Ramp[],
	matls: Matl[],
	surfs: Surf[],
	ventsurfs: Surf[],
	jetfans: JetFan[],
	fires: Fire[],
}

export class Library {

	private _ramps: Ramp[];
	private _matls: Matl[];
	private _surfs: Surf[];
	private _ventsurfs: SurfVent[];
	private _jetfans: JetFan[];
	private _fires: Fire[];

	constructor(jsonString: string) {

		let base: LibraryObject;
		base = <LibraryObject>JSON.parse(jsonString);

		this.ramps = get(base, 'ramps') === undefined ? [] : map(base.ramps, (ramp) => {
			return new Ramp(JSON.stringify(ramp));
		});

		this.matls = get(base, 'matls') === undefined ? [] : map(base.matls, (matl) => {
			return new Matl(JSON.stringify(matl), this.ramps);
		});

		this.surfs = get(base, 'surfs') === undefined ? [] : map(base.surfs, (surf) => {
			return new Surf(JSON.stringify(surf), this.matls);
		});

		this.ventsurfs = get(base, 'ventsurfs') === undefined ? [] : map(base.ventsurfs, (ventsurf) => {
			return new SurfVent(JSON.stringify(ventsurf), this.ramps);
		});

		this.jetfans = get(base, 'jetfans') === undefined ? [] : map(base.jetfans, (jetfan) => {
			return new JetFan(JSON.stringify(jetfan), this.ramps);

		});

		this.fires = get(base, 'fires') === undefined ? [] : map(base.fires, (fire) => {
			return new Fire(JSON.stringify(fire), this.ramps);
		});

	}

	public get ramps(): Ramp[] {
		return this._ramps;
	}

	public set ramps(value: Ramp[]) {
		this._ramps = value;
	}

	public get matls(): Matl[] {
		return this._matls;
	}

	public set matls(value: Matl[]) {
		this._matls = value;
	}

	public get surfs(): Surf[] {
		return this._surfs;
	}

	public set surfs(value: Surf[]) {
		this._surfs = value;
	}

	public get ventsurfs(): SurfVent[] {
		return this._ventsurfs;
	}

	public set ventsurfs(value: SurfVent[]) {
		this._ventsurfs = value;
	}

	public get jetfans(): JetFan[] {
		return this._jetfans;
	}

	public set jetfans(value: JetFan[]) {
		this._jetfans = value;
	}

	public get fires(): Fire[] {
		return this._fires;
	}

	public set fires(value: Fire[]) {
		this._fires = value;
	}

	public toJSON(): object {
		let library = {
			ramps: this.ramps,
			matls: this.matls,
			surfs: this.surfs,
			ventsurfs: this.ventsurfs,
			jetfans: this.jetfans,
			fires: this.fires
		}
		return library;
	}
}
