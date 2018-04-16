import { Risk } from "../risk-object/risk-object";

export interface RiskScenarioObject {
    id: number,
    projectId: number,
    name: string,
    description: string,
    riskObject: Risk,
    acFile: string,
    acHash: string,
    //_ui_state=base['ui_state']|| {}; // make ui state object / service
}

export class RiskScenario {
    private _id: number;
    private _projectId: number;
    private _name: string;
    private _description: string;
    private _riskObject: Risk;
    private _acFile: string;
    private _acHash: string;

    constructor(jsonString: string) {

        let base: RiskScenarioObject;
        base = <RiskScenarioObject>JSON.parse(jsonString);

        this.id = base.id || 0;
        this.projectId = base.projectId || 0;
        this.name = base.name || '';
        this.description = base.description || '';

        if (base.riskObject) {
            this._riskObject = new Risk(JSON.stringify(base.riskObject));
        }
        else {
            this._riskObject = new Risk('{}');
        }

        this._acFile = base.acFile || '';
        this._acHash = base.acHash || '';

    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get projectId(): number {
        return this._projectId;
    }

    public set projectId(value: number) {
        this._projectId = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get riskObject(): Risk {
        return this._riskObject;
    }

    public set riskObject(value: Risk) {
        this._riskObject = value;
    }

    public get acFile(): string {
        return this._acFile;
    }

    public set acFile(value: string) {
        this._acFile = value;
    }

    public get acHash(): string {
        return this._acHash;
    }

    public set acHash(value: string) {
        this._acHash = value;
    }

    public toJSON(): object {
        let riskScenario: object = {
            id: this.id,
            projectId: this.projectId,
            name: this.name,
            description: this.description,
            riskObject: this.riskObject.toJSON(),
            acFile: this.acFile,
            acHash: this.acHash,
            uiState: {}
        }
        return riskScenario;
    }

}
