import { get } from "lodash";

export interface XbObject {
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    z1: number,
    z2: number
    area?: number
}
export class Xb {
    private _x1: number;
    private _x2: number;
    private _y1: number;
    private _y2: number;
    private _z1: number;
    private _z2: number;
    private _area: number;

    constructor(jsonString: string, type?: string) {

        let base: XbObject;
        if (jsonString != undefined) base = <XbObject>JSON.parse(jsonString);

        this.x1 = get(base, 'x1', 0);
        this.x2 = get(base, 'x2', 1);
        this.y1 = get(base, 'y1', 0);
        this.y2 = get(base, 'y2', 1);

        if (type == 'vent' || type == 'open' || type == 'devc') {
            this.z1 = get(base, 'z1', 0);
            this.z2 = get(base, 'z2', 0);
        }
        else {
            this.z1 = get(base, 'z1', 0);
            this.z2 = get(base, 'z2', 1);
        }
        this.area = get(base, 'area', 1);
    }

    /** Recalculate area */
    public calcArea() {
        let area: number = 0;
        if (this.z1 == this.z2) {
            area = Math.abs((this.x2 - this.x1) * (this.y2 - this.y1));
        }
        else if (this.y1 == this.y2) {
            area = Math.abs((this.x2 - this.x1) * (this.z2 - this.z1));
        }
        else if (this.x1 == this.x2) {
            area = Math.abs((this.z2 - this.z1) * (this.z2 - this.z1));
        }
        this.area = area;
    }

    /**
     * Getter area
     * @return {number}
     */
	public get area(): number {
		return this._area;
	}

    /**
     * Setter area
     * @param {number} value
     */
	public set area(value: number) {
		this._area = value;
	}

    /**
     * Getter x1
     * @return {number}
     */
    public get x1(): number {
        return this._x1;
    }

    /**
     * Setter x1
     * @param {number} value
     */
    public set x1(value: number) {
        this._x1 = value;
        this.calcArea();
    }

    /**
     * Getter x2
     * @return {number}
     */
    public get x2(): number {
        return this._x2;
    }

    /**
     * Setter x2
     * @param {number} value
     */
    public set x2(value: number) {
        this._x2 = value;
        this.calcArea();
    }

    /**
     * Getter y1
     * @return {number}
     */
    public get y1(): number {
        return this._y1;
    }

    /**
     * Setter y1
     * @param {number} value
     */
    public set y1(value: number) {
        this._y1 = value;
        this.calcArea();
    }

    /**
     * Getter y2
     * @return {number}
     */
    public get y2(): number {
        return this._y2;
    }

    /**
     * Setter y2
     * @param {number} value
     */
    public set y2(value: number) {
        this._y2 = value;
        this.calcArea();
    }

    /**
     * Getter z1
     * @return {number}
     */
    public get z1(): number {
        return this._z1;
    }

    /**
     * Setter z1
     * @param {number} value
     */
    public set z1(value: number) {
        this._z1 = value;
        this.calcArea();
    }

    /**
     * Getter z2
     * @return {number}
     */
    public get z2(): number {
        return this._z2;
    }

    /**
     * Setter z2
     * @param {number} value
     */
    public set z2(value: number) {
        this._z2 = value;
        this.calcArea();
    }

    toJSON(): object {
        let xb: object = {
            x1: this.x1,
            x2: this.x2,
            y1: this.y1,
            y2: this.y2,
            z1: this.z1,
            z2: this.z2
        }
        return xb;
    }
}

export interface XyzObject {
    x: number,
    y: number,
    z: number
}
export class Xyz {
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(jsonString: string) {

        let base: XyzObject;
        if (jsonString != undefined) base = <XyzObject>JSON.parse(jsonString);

        this.x = get(base, 'x', 0);
        this.y = get(base, 'y', 0);
        this.z = get(base, 'z', 0);
    }

    /**
     * Getter x
     * @return {number}
     */
    public get x(): number {
        return this._x;
    }

    /**
     * Setter x
     * @param {number} value
     */
    public set x(value: number) {
        this._x = value;
    }

    /**
     * Getter y
     * @return {number}
     */
    public get y(): number {
        return this._y;
    }

    /**
     * Setter y
     * @param {number} value
     */
    public set y(value: number) {
        this._y = value;
    }

    /**
     * Getter z
     * @return {number}
     */
    public get z(): number {
        return this._z;
    }

    /**
     * Setter z
     * @param {number} value
     */
    public set z(value: number) {
        this._z = value;
    }

    toJSON(): object {
        let xyz: object = {
            x: this.x,
            y: this.y,
            z: this.z
        }
        return xyz;
    }

}

