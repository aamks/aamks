import { Surf } from '../fds-object/surf';
import { Matl } from '../fds-object/matl';
import { Ramp } from '../fds-object/ramp';
import { get, map } from 'lodash';

export interface LibraryObject {
	ramps: Ramp[],
	matls: Matl[],
	surfs: Surf[],
}

export class Library {

	private _ramps: Ramp[];
	private _matls: Matl[];
	private _surfs: Surf[];

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


}
