import { IdGeneratorService } from '../../services/id-generator/id-generator.service'
import { FdsEntities } from '../../enums/fds-entities'
import { Xb } from './primitives';
import { WebsocketService } from '../websocket/websocket.service';
import { Injector } from '@angular/core/src/di/injector';
import { get, round, toNumber, toString } from 'lodash';

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

        this.xb = new Xb(JSON.stringify(base.xb)) || new Xb(JSON.stringify({}));

        this.i = toNumber(get(base, 'i', MESH.IJK.default[0]));
        this.j = toNumber(get(base, 'j', MESH.IJK.default[1]));
        this.i = toNumber(get(base, 'k', MESH.IJK.default[2]));

        this.isize = toNumber(get(base, 'isize', 0.1));
        this.jsize = toNumber(get(base, 'jsize', 0.1));
        this.ksize = toNumber(get(base, 'ksize', 0.1));

        this.cells = this.calcCells();
        this.color = toString(get(base, 'color', MESH.COLOR.default[0]));
    }

    /**
     * Getter id
     * @return {string}
     */
	public get id(): string {
		return this._id;
	}

    /**
     * Setter id
     * @param {string} value
     */
	public set id(value: string) {
		this._id = value;
	}

    /**
     * Getter uuid
     * @return {string}
     */
	public get uuid(): string {
		return this._uuid;
	}

    /**
     * Setter uuid
     * @param {string} value
     */
	public set uuid(value: string) {
		this._uuid = value;
	}

    /**
     * Getter idAC
     * @return {number}
     */
	public get idAC(): number {
		return this._idAC;
	}

    /**
     * Setter idAC
     * @param {number} value
     */
	public set idAC(value: number) {
		this._idAC = value;
	}

    /**
     * Getter isize
     * @return {number}
     */
	public get isize(): number {
		return this._isize;
	}

    /**
     * Setter isize
     * @param {number} value
     */
	public set isize(value: number) {
        this._isize = round(value, 6);
        this._i = round((this.xb.x2 - this.xb.x1) / value, 6);
	}

    /**
     * Getter jsize
     * @return {number}
     */
	public get jsize(): number {
		return this._jsize;
	}

    /**
     * Setter jsize
     * @param {number} value
     */
	public set jsize(value: number) {
        this._jsize = round(value, 6);
        this._j = round((this.xb.y2 - this.xb.y1) / value, 6);
	}

    /**
     * Getter ksize
     * @return {number}
     */
	public get ksize(): number {
		return this._ksize;
	}

    /**
     * Setter ksize
     * @param {number} value
     */
	public set ksize(value: number) {
        this._ksize = round(value, 6);
        this._k = round((this.xb.z2 - this.xb.z1) / value, 6);
	}

    /**
     * Getter i
     * @return {number}
     */
	public get i(): number {
		return this._i;
	}

    /**
     * Setter i
     * @param {number} value
     */
	public set i(value: number) {
        this._i = round(value, 6);
        this._isize = round((this.xb.x2 - this.xb.x1) / value, 6);
	}

    /**
     * Getter j
     * @return {number}
     */
	public get j(): number {
		return this._j;
	}

    /**
     * Setter j
     * @param {number} value
     */
	public set j(value: number) {
        this._j = round(value, 6);
        this._jsize = round((this.xb.y2 - this.xb.y1) / value, 6);
	}

    /**
     * Getter k
     * @return {number}
     */
	public get k(): number {
		return this._k;
	}

    /**
     * Setter k
     * @param {number} value
     */
	public set k(value: number) {
        this._k = round(value, 6);
        this._ksize = round((this.xb.z2 - this.xb.z1) / value, 6);
	}


    /**
     * Getter xb
     * @return {Xb}
     */
	public get xb(): Xb {
		return this._xb;
	}

    /**
     * Setter xb
     * @param {Xb} value
     */
	public set xb(value: Xb) {
		this._xb = value;
	}

    /**
     * Getter cells
     * @return {number}
     */
	public get cells(): number {
		return this._cells;
	}

    /**
     * Setter cells
     * @param {number} value
     */
	public set cells(value: number) {
		this._cells = value;
	}

    /**
     * Getter color
     * @return {string}
     */
	public get color(): string {
		return this._color;
	}

    /**
     * Setter color
     * @param {string} value
     */
	public set color(value: string) {
		this._color = value;
    }

    /** getter/setter x1 */
    get x1() {
        return this.xb.x1;
    }
    set x1(x1: number) {
        this.xb.x1 = x1;
        this._i = round((this.xb.x2 - this.xb.x1) / this.isize, 6);
    }

    /** getter/setter x2 */
    get x2() {
        return this.xb.x2;
    }
    set x2(x2: number) {
        this.xb.x2 = x2;
        this.i = round((this.xb.x2 - this.xb.x1) / this.isize, 6);
    }

    /** getter/setter x1 */
    get y1() {
        return this.xb.y1;
    }
    set y1(y1: number) {
        this.xb.y1 = y1;
        this.j = round((this.xb.y2 - this.xb.y1) / this.jsize, 6);
    }

    /** getter/setter x2 */
    get y2() {
        return this.xb.y2;
    }
    set y2(y2: number) {
        this.xb.y2 = y2;
        this.j = round((this.xb.y2 - this.xb.x1) / this.jsize, 6);
    }

    /** getter/setter x1 */
    get z1() {
        return this.xb.z1;
    }
    set z1(z1: number) {
        this.xb.z1 = z1;
        this.k = round((this.xb.z2 - this.xb.z1) / this.ksize, 6);
    }

    /** getter/setter x2 */
    get z2() {
        return this.xb.z2;
    }
    set z2(z2: number) {
        this.xb.z2 = z2;
        this.k = round((this.xb.z2 - this.xb.x1) / this.ksize, 6);
    }
    
    calcCells(): number {
        return this.i * this.j * this.k;
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
            xb: this.xb.toJSON(),
            color: this._color
        }
        return mesh;
    }

}
