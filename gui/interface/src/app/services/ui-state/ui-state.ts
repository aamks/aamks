export class UiState {

	private _general: object;
	private _geometry: object;
	private _ventilation: object;
	private _fires: object;
	private _output: object;
	private _species: object;
	private _parts: object;
	private _ramps: object;

	private _fdsMenu: object;
	
	private _listRange: number = 200;

	constructor() {
		this.fdsMenu = {
			geometry: false,
			ventilation: false,
			fire: true,
			output: true,
			species: true
		}

		this.general = { tab: 0, list: 0, elementIndex: 0 }

		this.geometry = {
			tab: 0,
			mesh: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			open: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			matl: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libMatl: { scrollPosition: 0, begin: 0, elementIndex: 0 },
			surf: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libSurf: { scrollPosition: 0, begin: 0, elementIndex: 0 },
			obst: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			hole: { scrollPosition: 0, begin: 0, elementIndex: 0 }
		}

		this.ventilation = {
			surf: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libSurf: { scrollPosition: 0, begin: 0, elementIndex: 0 },
			vent: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			jetfan: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libJetfan: { scrollPosition: 0, begin: 0, elementIndex: 0, }
		}

		this.fires = {
			tab: 0,
			fire: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libFire: { scrollPosition: 0, begin: 0, elementIndex: 0 },
			libFuel: { scrollPosition: 0, begin: 0, elementIndex: 0 },
			// Not needed for now below
			group: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			fuel: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
		}

		this.output = {
			tab: 0,
			slcf: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libSlcf: { scrollPosition: 0, begin: 0, elementIndex: 0, },
			isof: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			prop: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libProp: { scrollPosition: 0, begin: 0, elementIndex: 0 },
			devc: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libDevc: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			ctrl: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' }
		}

		this.species = {
			tab: 0,
			specie: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libSpecie: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			vent: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libVent: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
			surf: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libSurf: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' }
		}

		this.parts = {
			tab: 0,
			part: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libPart: { scrollPosition: 0, begin: 0, elementIndex: 0 }
		}

		this.ramps = {
			tab: 0,
			ramp: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libRamp: { scrollPosition: 0, begin: 0, elementIndex: 0 }
		}
	}

	public get general(): object {
		return this._general;
	}

	public set general(value: object) {
		this._general = value;
	}

	public get geometry(): object {
		return this._geometry;
	}

	public set geometry(value: object) {
		this._geometry = value;
	}

	public get ventilation(): object {
		return this._ventilation;
	}

	public set ventilation(value: object) {
		this._ventilation = value;
	}

	public get fires(): object {
		return this._fires;
	}

	public set fires(value: object) {
		this._fires = value;
	}

	public get output(): object {
		return this._output;
	}

	public set output(value: object) {
		this._output = value;
	}

	public get species(): object {
		return this._species;
	}

	public set species(value: object) {
		this._species = value;
	}

	public get parts(): object {
		return this._parts;
	}

	public set parts(value: object) {
		this._parts = value;
	}

	public get ramps(): object {
		return this._ramps;
	}

	public set ramps(value: object) {
		this._ramps = value;
	}

	public get fdsMenu(): object {
		return this._fdsMenu;
	}

	public set fdsMenu(value: object) {
		this._fdsMenu = value;
	}

	public get listRange(): number {
		return this._listRange;
	}

	public set listRange(value: number) {
		this._listRange = value;
	}

}
