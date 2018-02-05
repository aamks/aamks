export class Xb {
    private _x1: number;
    private _x2: number;
    private _y1: number;
    private _y2: number;
    private _z1: number;
    private _z2: number;

    constructor(xb: number[]) {
        this.x1 = xb[0];
        this.x2 = xb[1];
        this.y1 = xb[2];
        this.y2 = xb[3];
        this.z1 = xb[4];
        this.z2 = xb[5];
    }

    /** getter/setter x1 */
    public get x1() {
        return this._x1;
    }
    public set x1(x1: number) {
        this._x1 = x1;
    }

    /** getter/setter x2 */
    public get x2() {
        return this._x2;
    }
    public set x2(x2: number) {
        this._x2 = x2;
    }

    /** getter/setter y1 */
    public get y1() {
        return this._y1;
    }
    public set y1(y1: number) {
        this._y1 = y1;
    }

    /** getter/setter y2 */
    public get y2() {
        return this._y2;
    }
    public set y2(y2: number) {
        this._y2 = y2;
    }

    /** getter/setter z1 */
    public get z1() {
        return this._z1;
    }
    public set z1(z1: number) {
        this._z1 = z1;
    }

    /** getter/setter z2 */
    public get z2() {
        return this._z2;
    }
    public set z2(z2: number) {
        this._z2 = z2;
    }
}

export class Xyz {
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(xyz: number[]) {
        this.x = xyz[0];
        this.y = xyz[1];
        this.z = xyz[2];
    }

	public get x(): number {
		return this._x;
	}

	public set x(value: number) {
		this._x = value;
	}

	public get y(): number {
		return this._y;
	}

	public set y(value: number) {
		this._y = value;
	}

	public get z(): number {
		return this._z;
	}

	public set z(value: number) {
		this._z = value;
	}

}

