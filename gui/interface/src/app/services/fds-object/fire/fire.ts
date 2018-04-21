import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Ramp } from "../ramp/ramp";
import { SurfFire } from './surf-fire';
import { VentFire } from './vent-fire';

export interface FireObject {
    id: string,
    uuid: string,
    idAC: number,
    editable: boolean,
    surf: SurfFire,
    vent: VentFire,
}

export class Fire {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _editable: boolean;
    private _surf: SurfFire;
    private _vent: VentFire;

    constructor(jsonString: string, ramps: Ramp[] = undefined) {

        let base: FireObject;
        base = <FireObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.editable = (base.editable == true);

        if (base.surf) {
            if (!ramps) {
                this.surf = new SurfFire(JSON.stringify(base.surf));
                this.surf.id = this.id;
            } else {
                this.surf = new SurfFire(JSON.stringify(base.surf), ramps);
                this.surf.id = this.id;
            }
        } else {
            this.surf = new SurfFire(JSON.stringify({}));
            this.surf.id = this.id;
        }

        if (base.vent != undefined) {
            this.vent = new VentFire(JSON.stringify(base.vent));
            this.surf.hrr.area = this.vent.xb.area;

        } else {
            this.vent = new VentFire(JSON.stringify({}));
            this.surf.hrr.area = this.vent.xb.area;
        }

    }

    /** Calculate total heat release rate */
    public totalHrr() {
        var area = Math.abs(this.vent.xb.x2 - this.vent.xb.x1) * Math.abs(this.vent.xb.y2 - this.vent.xb.y1);
        var hrrpua = 0;
        if (this.surf.hrr['hrr_type'] == 'hrrpua') {
            hrrpua = this.surf.hrr.value;
            this.surf.hrr['area'] = area;
        }
        return 1 * area * hrrpua;
    }

    /** Calculate total time of fire spreading */
    public totalTime() {
        var time = (Math.sqrt(this.totalHrr() / this.surf.hrr['alpha'])).toFixed(0);
        return time;
    }

    /** Recalculate vent area and fire params */
    public calcArea() {
        setTimeout(() => {
            this.surf.hrr.area = this.vent.xb.area;
        }, 100);
    }

	public get id(): string {
		return this._id;
	}

	public set id(value: string) {
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

	public get editable(): boolean {
		return this._editable;
	}

	public set editable(value: boolean) {
		this._editable = value;
	}

	public get surf(): SurfFire {
		return this._surf;
	}

	public set surf(value: SurfFire) {
		this._surf = value;
	}

	public get vent(): VentFire {
		return this._vent;
	}

	public set vent(value: VentFire) {
		this._vent = value;
	}

    public toJSON(): object {
        var fire = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            editable: this.editable,
            surf: this.surf,
            vent: this.vent
        }
        return fire;
    }

}
