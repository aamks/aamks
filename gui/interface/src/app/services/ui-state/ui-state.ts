export class UiState {

	private _general: any;
	private _geometry: any;
	private _ventilation: any;
	private _fires: any;
	private _output: any;
	private _specie: any;
	private _parts: any;
	private _ramps: any;

	private _active: string;

	private _fdsMenu: any;
	private _riskMenu: any;
	
	private _listRange: number = 200;

	constructor() {
		this.fdsMenu = {
			geometry: false,
			ventilation: false,
			fire: true,
			output: false,
			specie: false
		}

		this.active = "projects";

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
			fuel: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libFuel: { scrollPosition: 0, begin: 0, elementIndex: 0 },
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

		this.specie = {
			tab: 0,
			spec: { scrollPosition: 0, begin: 0, elementIndex: 0, lib: 'closed', help: 'closed' },
			libSpec: { scrollPosition: 0, begin: 0, elementIndex: 0, help: 'closed' },
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

	public get general(): any {
		return this._general;
	}

	public set general(value: any) {
		this._general = value;
	}

	public get geometry(): any {
		return this._geometry;
	}

	public set geometry(value: any) {
		this._geometry = value;
	}

	public get ventilation(): any {
		return this._ventilation;
	}

	public set ventilation(value: any) {
		this._ventilation = value;
	}

	public get fires(): any {
		return this._fires;
	}

	public set fires(value: any) {
		this._fires = value;
	}

	public get output(): any {
		return this._output;
	}

	public set output(value: any) {
		this._output = value;
	}

	public get specie(): any {
		return this._specie;
	}

	public set specie(value: any) {
		this._specie = value;
	}

	public get parts(): any {
		return this._parts;
	}

	public set parts(value: any) {
		this._parts = value;
	}

	public get ramps(): any {
		return this._ramps;
	}

	public set ramps(value: any) {
		this._ramps = value;
	}

	public get fdsMenu(): any {
		return this._fdsMenu;
	}

	public set fdsMenu(value: any) {
		this._fdsMenu = value;
	}

	public get listRange(): number {
		return this._listRange;
	}

	public set listRange(value: number) {
		this._listRange = value;
	}

    /**
     * Getter active
     * @return {string}
     */
	public get active(): string {
		return this._active;
	}

    /**
     * Setter active
     * @param {string} value
     */
	public set active(value: string) {
		this._active = value;
	}

    /**
     * Getter riskMenu
     * @return {any}
     */
	public get riskMenu(): any {
		return this._riskMenu;
	}

    /**
     * Setter riskMenu
     * @param {any} value
     */
	public set riskMenu(value: any) {
		this._riskMenu = value;
	}



}
