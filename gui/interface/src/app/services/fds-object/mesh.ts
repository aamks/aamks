import { IdGeneratorService } from '../../services/id-generator/id-generator.service'
import { FdsEntities } from '../../enums/fds-entities'
import { Xb } from './primitives';
import { WebsocketService } from '../websocket/websocket.service';
import { Injector } from '@angular/core/src/di/injector';
import * as _ from 'lodash';

export interface MeshObject {
    id: string,
    uuid: string,
    idAC: number,
    isize: number,
    jsize: number,
    ksize: number,
    i: number,
    j: number,
    k: number,
    xb: Xb,
    cells: number,
    color: string
}

export class Mesh {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _isize: number;
    private _jsize: number;
    private _ksize: number;
    private _i: number;
    private _j: number;
    private _k: number;
    private _xb: Xb;
    private _cells: number;
    private _color: string;

    constructor(jsonString: string) {

        let base: MeshObject;
        base = <MeshObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let MESH = FdsEntities.MESH;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.xb = base.xb || new Xb(MESH.XB.default);

        (base.isize && base.xb) ? this._i = Math.round((base.xb.x2 - base.xb.x1) / base.isize) : this._i = base.i || MESH.IJK.default[0];
        (base.jsize && base.xb) ? this._j = Math.round((base.xb.y2 - base.xb.y1) / base.jsize) : this._j = base.j || MESH.IJK.default[1];
        (base.ksize && base.xb) ? this._k = Math.round((base.xb.z2 - base.xb.z1) / base.ksize) : this._k = base.k || MESH.IJK.default[2];

        this.isize = base.isize || 0.1;
        this.jsize = base.jsize || 0.1;
        this.ksize = base.ksize || 0.1;
        this.cells = this.calcCells();
        this.color = base.color || MESH.COLOR.default[0];
    }

    /** getter/setter id */
    public get id(): string {
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

    /** getter/setter isize */
    get isize() {
        return this._isize;
    }
    set isize(isize: number) {
        this._isize = _.round(isize, 6);
        this._i = _.round((this.xb.x2 - this.xb.x1) / isize, 6);
    }

    /** getter/setter jsize */
    get jsize() {
        return this._jsize;
    }
    set jsize(jsize: number) {
        this._jsize = _.round(jsize, 6);
        this._j = _.round((this.xb.y2 - this.xb.y1) / jsize, 6);
    }

    /** getter/setter ksize */
    get ksize() {
        return this._ksize;
    }
    set ksize(ksize: number) {
        this._ksize = _.round(ksize, 6);
        this._k = _.round((this.xb.z2 - this.xb.z1) / ksize, 6);
    }

    /** getter/setter i */
    get i() {
        return this._i;
    }
    set i(i: number) {
        this._i = _.round(i, 6);
        this._isize = _.round((this.xb.x2 - this.xb.x1) / i, 6);
    }

    /** getter/setter j */
    get j() {
        return this._j;
    }
    set j(j: number) {
        this._j = _.round(j, 6);
        this._jsize = _.round((this.xb.y2 - this.xb.y1) / j, 6);
    }

    /** getter/setter k */
    get k() {
        return this._k;
    }
    set k(k: number) {
        this._k = _.round(k, 6);
        this._ksize = _.round((this.xb.z2 - this.xb.z1) / k, 6);
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
        this._i = _.round((this.xb.x2 - this.xb.x1) / this.isize, 6);
    }

    /** getter/setter x2 */
    get x2() {
        return this.xb.x2;
    }
    set x2(x2: number) {
        this.xb.x2 = x2;
        this._i = _.round((this.xb.x2 - this.xb.x1) / this.isize, 6);
    }

    /** getter/setter x1 */
    get y1() {
        return this.xb.y1;
    }
    set y1(y1: number) {
        this.xb.y1 = y1;
        this._j = _.round((this.xb.y2 - this.xb.y1) / this.jsize, 6);
    }

    /** getter/setter x2 */
    get y2() {
        return this.xb.y2;
    }
    set y2(y2: number) {
        this.xb.y2 = y2;
        this._j = _.round((this.xb.y2 - this.xb.x1) / this.jsize, 6);
    }

    /** getter/setter x1 */
    get z1() {
        return this.xb.z1;
    }
    set z1(z1: number) {
        this.xb.z1 = z1;
        this._k = _.round((this.xb.z2 - this.xb.z1) / this.ksize, 6);
    }

    /** getter/setter x2 */
    get z2() {
        return this.xb.z2;
    }
    set z2(z2: number) {
        this.xb.z2 = z2;
        this._k = _.round((this.xb.z2 - this.xb.x1) / this.ksize, 6);
    }

    /** getter/setter z2 */
    get cells() {
        return this._cells;
    }
    set cells(cells: number) {
        this._cells = cells;
    }

    calcCells(): number {
        return this.i * this.j * this.k;
    }

    /** getter/setter color */
    get color() {
        return this._color;
    }
    set color(color: string) {
        this._color = color;
    }

    toJSON(): object {
        let mesh: object = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            i: this.i,
            j: this.j,
            k: this.k,
            isize: this.isize,
            jsize: this.jsize,
            ksize: this.ksize,
            xb: this._xb,
            color: this._color
        }
        return mesh;
    }

}
