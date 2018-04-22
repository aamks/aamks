import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Xb, Xyz } from '../primitives';

export interface VentObject {
    id: number,
    uuid: string,
    idAC: number,
    elevation: number,
    xb: Xb,
    xyz: Xyz
}

export class VentFire {
    private _id: number;
    private _uuid: string;
    private _idAC: number;
    private _xb: Xb;
    private _xyz: Xyz;
    private _elevation: number;

    constructor(jsonString: string) {

        let base: VentObject;
        base = <VentObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let VENT = FdsEntities.VENT;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.elevation = base.elevation || 0;

		this.xb = new Xb(JSON.stringify(base.xb), 'vent') || new Xb(JSON.stringify({}), 'vent');
        this.xyz = new Xyz(JSON.stringify(base.xyz)) || new Xyz(JSON.stringify({}));
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

	public get xb(): Xb {
		return this._xb;
	}

	public set xb(value: Xb) {
		this._xb = value;
	}

	public get xyz(): Xyz {
		return this._xyz;
	}

	public set xyz(value: Xyz) {
		this._xyz = value;
	}

	public get elevation(): number {
		return this._elevation;
	}

	public set elevation(value: number) {
		this._elevation = value;
	}

    public toJSON(): object {
        var vent = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            xb: this.xb.toJSON(),
            xyz: {
                x: this.xyz.x,
                y: this.xyz.y,
                z: this.xyz.z
            }
        }
        return vent;
    }


}