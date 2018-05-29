import { Risk } from "../risk-object/risk-object";

export interface RiskScenarioObject {
    id: number,
    projectId: number,
    name: string,
    description: string,
    riskObject: Risk,
    acFile: string,
    acHash: string,
    uiState: string
}

export class RiskScenario {
    private _id: number;
    private _projectId: number;
    private _name: string;
    private _description: string;
    private _riskObject: Risk;
    private _acFile: string;
    private _acHash: string;
    private _uiState: string;

    constructor(jsonString: string) {

        let base: RiskScenarioObject;
        base = <RiskScenarioObject>JSON.parse(jsonString);

        this.id = base.id || 0;
        this.projectId = base.projectId || 0;
        this.name = base.name || '';
        this.description = base.description || '';
        this.riskObject = base.riskObject != undefined ? this._riskObject = new Risk(JSON.stringify(base.riskObject)) : this._riskObject = new Risk('{}');

        // Todo
        this.acFile = base.acFile || '';
        this.acHash = base.acHash || '';
        this.uiState = base.uiState || '';

    }


    /**
     * Getter id
     * @return {number}
     */
	public get id(): number {
		return this._id;
	}

    /**
     * Setter id
     * @param {number} value
     */
	public set id(value: number) {
		this._id = value;
	}

    /**
     * Getter projectId
     * @return {number}
     */
	public get projectId(): number {
		return this._projectId;
	}

    /**
     * Setter projectId
     * @param {number} value
     */
	public set projectId(value: number) {
		this._projectId = value;
	}

    /**
     * Getter name
     * @return {string}
     */
	public get name(): string {
		return this._name;
	}

    /**
     * Setter name
     * @param {string} value
     */
	public set name(value: string) {
		this._name = value;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

    /**
     * Getter riskObject
     * @return {Risk}
     */
	public get riskObject(): Risk {
		return this._riskObject;
	}

    /**
     * Setter riskObject
     * @param {Risk} value
     */
	public set riskObject(value: Risk) {
		this._riskObject = value;
	}

    /**
     * Getter acFile
     * @return {string}
     */
	public get acFile(): string {
		return this._acFile;
	}

    /**
     * Setter acFile
     * @param {string} value
     */
	public set acFile(value: string) {
		this._acFile = value;
	}

    /**
     * Getter acHash
     * @return {string}
     */
	public get acHash(): string {
		return this._acHash;
	}

    /**
     * Setter acHash
     * @param {string} value
     */
	public set acHash(value: string) {
		this._acHash = value;
	}

    /**
     * Getter uiState
     * @return {string}
     */
	public get uiState(): string {
		return this._uiState;
	}

    /**
     * Setter uiState
     * @param {string} value
     */
	public set uiState(value: string) {
		this._uiState = value;
	}

    /**
     * Export to json
     */
    public toJSON(): object {
        let riskScenario: object = {
            id: this.id,
            projectId: this.projectId,
            name: this.name,
            description: this.description,
            riskObject: this.riskObject.toJSON(),
            acFile: this.acFile,
            acHash: this.acHash,
            uiState: this.uiState
        }
        return riskScenario;
    }

}
