export class UiState {

	private _active: string;
	private _riskMenu: any;
	private _listRange: number = 200;

	constructor() {
		this.active = "projects";
		this.riskMenu = {
            results: false
        }
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

    /**
     * Getter listRange
     * @return {number }
     */
	public get listRange(): number  {
		return this._listRange;
	}

    /**
     * Setter listRange
     * @param {number } value
     */
	public set listRange(value: number ) {
		this._listRange = value;
	}


}
