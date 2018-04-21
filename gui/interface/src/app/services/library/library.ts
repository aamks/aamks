import { Fire } from '../fds-object/fire/fire';
import { JetFan } from '../fds-object/ventilation/jet-fan';
import { Surf } from '../fds-object/geometry/surf';
import { Matl } from '../fds-object/geometry/matl';
import { Ramp } from '../fds-object/ramp/ramp';
import { get, map } from 'lodash';
import { SurfVent } from '../fds-object/ventilation/surf-vent';
import { Fuel } from '../fds-object/fire/fuel';
import { Spec } from '../fds-object/specie/spec';

export interface LibraryObject {
	ramps: Ramp[],
	matls: Matl[],
	surfs: Surf[],
	ventsurfs: Surf[],
	jetfans: JetFan[],
	fires: Fire[],
	fuels: Fuel[],
	specs: Spec[]
}

export class Library {

	private _ramps: Ramp[];
	private _matls: Matl[];
	private _surfs: Surf[];
	private _ventsurfs: SurfVent[];
	private _jetfans: JetFan[];
	private _fires: Fire[];
	private _fuels: Fuel[];
	private _specs: Spec[];

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

		this.fuels = get(base, 'fuels') === undefined ? [] : map(base.fuels, (fuel) => {
			return new Fuel(JSON.stringify(fuel));
		});

		this.specs = get(base, 'specs') === undefined ? [] : map(base.specs, (spec) => {
			return new Spec(JSON.stringify(spec));
		});

	}


    /**
     * Getter ramps
     * @return {Ramp[]}
     */
	public get ramps(): Ramp[] {
		return this._ramps;
	}

    /**
     * Setter ramps
     * @param {Ramp[]} value
     */
	public set ramps(value: Ramp[]) {
		this._ramps = value;
	}

    /**
     * Getter matls
     * @return {Matl[]}
     */
	public get matls(): Matl[] {
		return this._matls;
	}

    /**
     * Setter matls
     * @param {Matl[]} value
     */
	public set matls(value: Matl[]) {
		this._matls = value;
	}

    /**
     * Getter surfs
     * @return {Surf[]}
     */
	public get surfs(): Surf[] {
		return this._surfs;
	}

    /**
     * Setter surfs
     * @param {Surf[]} value
     */
	public set surfs(value: Surf[]) {
		this._surfs = value;
	}

    /**
     * Getter ventsurfs
     * @return {SurfVent[]}
     */
	public get ventsurfs(): SurfVent[] {
		return this._ventsurfs;
	}

    /**
     * Setter ventsurfs
     * @param {SurfVent[]} value
     */
	public set ventsurfs(value: SurfVent[]) {
		this._ventsurfs = value;
	}

    /**
     * Getter jetfans
     * @return {JetFan[]}
     */
	public get jetfans(): JetFan[] {
		return this._jetfans;
	}

    /**
     * Setter jetfans
     * @param {JetFan[]} value
     */
	public set jetfans(value: JetFan[]) {
		this._jetfans = value;
	}

    /**
     * Getter fires
     * @return {Fire[]}
     */
	public get fires(): Fire[] {
		return this._fires;
	}

    /**
     * Setter fires
     * @param {Fire[]} value
     */
	public set fires(value: Fire[]) {
		this._fires = value;
	}

    /**
     * Getter fuels
     * @return {Fuel[]}
     */
	public get fuels(): Fuel[] {
		return this._fuels;
	}

    /**
     * Setter fuels
     * @param {Fuel[]} value
     */
	public set fuels(value: Fuel[]) {
		this._fuels = value;
	}

    /**
     * Getter specs
     * @return {Spec[]}
     */
	public get specs(): Spec[] {
		return this._specs;
	}

    /**
     * Setter specs
     * @param {Spec[]} value
     */
	public set specs(value: Spec[]) {
		this._specs = value;
	}

	public toJSON(): object {
		let library = {
			ramps: this.ramps,
			matls: this.matls,
			surfs: this.surfs,
			ventsurfs: this.ventsurfs,
			jetfans: this.jetfans,
			fires: this.fires,
			fuels: this.fuels,
			specs: this.specs
		}
		return library;
	}
}
