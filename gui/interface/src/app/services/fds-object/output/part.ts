import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Xb } from '../primitives';
import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { get } from 'lodash';

export interface PartObject {
    id:number,
    uuid:string,
    idAC:number,
    diameter:number
}
export class Part {
    private _id:number;
    private _uuid:string;
    private _idAC:number;
    private _diameter:number;

    constructor(jsonString: string) {

        let base: PartObject;
        base = <PartObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let PART = FdsEntities.PART;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.diameter = get(base, 'diameter', PART.DIAMETER.default[0]);
    }

    public toJSON(): object {
        let part = {
            id: this.id,
            uuid: this.uuid,
            diameter: this.diameter
        }
        return part;
    }

	public get id(): number {
		return this._id;
	}

	public set id(value: number) {
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

	public get diameter(): number {
		return this._diameter;
	}

	public set diameter(value: number) {
		this._diameter = value;
	}


}
