import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import { Surf } from './surf';
import { Xb } from './primitives';
import * as _ from 'lodash';
import { Devc } from './devc';

export interface VentObject {
    id: number,
    uuid: string,
    idAC: number,
    elevation: number,
    xb: Xb,
    surf_id: any,
    surf: any
}

export class Vent {
    private _id: number;
    private _uuid: string;
    private _idAC: number;
    private _xb: Xb;
    private _elevation: number;
    private _surf: any;

    constructor(jsonString: string, surfs: Surf[] = undefined) {

        let base: VentObject;
        base = <VentObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let VENT = FdsEntities.VENT;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.elevation = base.elevation || 0;

        this.xb = new Xb(_.toArray(base.xb)) || new Xb(VENT.XB.default);

        if (!surfs) {
            this.surf = {
                surf_id: _.get(base, 'surf.surf_id', '')
            }
        } else {
            this.surf = _.find(surfs, function (surf) {
                return surf.id == base['surf_id'];
            });
        }

    }

    /** Desc ... */
    changeSurfId(id_old, list) {
        //return accessor.selectSetter(self, 'surf.surf_id', id_old, list);
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

    public get elevation(): number {
        return this._elevation;
    }

    public set elevation(value: number) {
        this._elevation = value;
    }

    public get surf(): any {
        return this._surf;
    }

    public set surf(value: any) {
        this._surf = value;
    }

    public toJSON(): object {
        var vent = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            elevation: this.elevation,
            surf_id: this.surf.id,
            xb: {
                x1: this.xb.x1,
                x2: this.xb.x2,
                y1: this.xb.y1,
                y2: this.xb.y2,
                z1: this.xb.z1,
                z2: this.xb.z2
            }
        }
        return vent;
    }



}
