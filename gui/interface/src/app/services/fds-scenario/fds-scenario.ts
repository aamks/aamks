import { Fds, FdsObject } from '../fds-object/fds-object';

export interface FdsScenarioObject {
    id:number,
    projectId:number,
    name:string,
    description:string,
    fdsFile:string,
    fdsObject:Fds,
    acFile:string,
    acHash:string,
    //_ui_state=base['ui_state']|| {}; // make ui state object / service
}

export class FdsScenario {
    private _id:number;
    private _projectId:number;
    private _name:string;
    private _description:string;
    private _fdsFile:string;
    private _fdsObject:Fds;
    private _acFile:string;
    private _acHash:string;
    //_ui_state=base['ui_state']|| {}; // make ui state object / service

    constructor(jsonString:string) {

        let base:FdsScenarioObject;
        base = <FdsScenarioObject>JSON.parse(jsonString); 

        this.id = base.id || 0;
        this.projectId = base.projectId || 0;
        this.name = base.name || '';
        this.description = base.description || '';
        this.fdsFile = base.fdsFile || '';

        if (base.fdsObject) {
            this._fdsObject = new Fds(JSON.stringify(base.fdsObject));
        }
        else {
            this._fdsObject = new Fds('{}');
        }

        this._acFile = base.acFile || '';
        this._acHash = base.acHash || '';
    }

    public get id(){
        return this._id;
    }
    public set id(id:number){
        this._id = id;
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

	public get fdsFile(): string {
		return this._fdsFile;
	}

	public set fdsFile(value: string) {
		this._fdsFile = value;
	}

	public get fdsObject(): Fds {
		return this._fdsObject;
	}

	public set fdsObject(value: Fds) {
		this._fdsObject = value;
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

    public toJSON(): string {
        let fdsScenario:object = {
            id: this.id,
            projectId: this.projectId,
            name: this.name,
            description: this.description,
            fdsFile: this.fdsFile,
            fdsObject: this.fdsObject,
            acFile: this.acFile,
            acHash: this.acHash,
            uiState: {}
        }
        return JSON.stringify(fdsScenario);
    }

}
