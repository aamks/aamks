import { Xb } from './primitives';
import { IdGeneratorService } from '../../services/id-generator/id-generator.service'
import { FdsEntities } from '../../enums/fds-entities'

export interface OpenObject {
    id: string,
    uuid: string,
    idAC: number,
    xb: Xb,
    surf_id: string
}

export class Open {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _xb: Xb;
    private _surf_id: string;

    constructor(jsonString: string) {

        let base: OpenObject;
        base = <OpenObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;
        let VENT = FdsEntities.VENT;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.xb = base.xb || new Xb(VENT.XB.default);
        this.surfId = base.surf_id || 'OPEN';
    }

    /** getter/setter id */
    public get id() {
        return this._id;
    }
    public set id(id: string) {
        this._id = id;
    }

    /** getter/setter uuid */
    get uuid() {
        return this._uuid;
    }
    set uuid(uuid: string) {
        this._uuid = uuid;
    }

    /** getter/setter idAC */
    get idAC() {
        return this._idAC;
    }
    set idAC(idAC: number) {
        this._idAC = idAC;
    }

    /** getter/setter xb */
    get xb() {
        return this._xb;
    }
    set xb(xb: Xb) {
        this._xb = xb;
    }

    /** getter/setter x1 */
    get x1() {
        return this.xb.x1;
    }
    set x1(x1: number) {
        this.xb.x1 = x1;
    }

    /** getter/setter x2 */
    get x2() {
        return this.xb.x2;
    }
    set x2(x2: number) {
        this.xb.x2 = x2;
    }

    /** getter/setter x1 */
    get y1() {
        return this.xb.y1;
    }
    set y1(y1: number) {
        this.xb.y1 = y1;
    }

    /** getter/setter x2 */
    get y2() {
        return this.xb.y2;
    }
    set y2(y2: number) {
        this.xb.y2 = y2;
    }

    /** getter/setter x1 */
    get z1() {
        return this.xb.z1;
    }
    set z1(z1: number) {
        this.xb.z1 = z1;
    }

    /** getter/setter x2 */
    get z2() {
        return this.xb.z2;
    }
    set z2(z2: number) {
        this.xb.z2 = z2;
    }

    /** getter/setter color */
    get surf_id() {
        return this._surf_id;
    }
    set surfId(surf_id: string) {
        this._surf_id = surf_id;
    }

    toJSON(): object {
        let open: object = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            xb: this._xb,
            surf_id: this._surf_id
        };
        return open;
    }
}
