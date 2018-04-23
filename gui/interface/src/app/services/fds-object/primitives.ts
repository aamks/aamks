import { get, map, toString } from "lodash";
import { Spec } from "./specie/spec";
import { Part } from "./output/part";

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

export interface QuantityObject {
    id: string,
    quantity: string,
    spec: boolean,
    specs: Spec[],
    part: boolean,
    parts: Part[]
}
export class Quantity {
    private _id: string;
    private _quantity: string;
    private _spec: boolean;
    private _specs: Spec[];
    private _part: boolean;
    private _parts: Part[];

    constructor(jsonString: string) {

        let base: QuantityObject;
        base = <QuantityObject>JSON.parse(jsonString);

        this.id = toString(get(base, 'id', ''));
        this.quantity = toString(get(base, 'quantity', ''));

        this.spec = (get(base, 'spec', true) == true);
        this.part = (get(base, 'part', true) == true);

        this.specs = base.specs != undefined && base.specs.length > 0 ? map(base.specs, function (o) { return new Spec(JSON.stringify(o)) }) : [];
        this.parts = base.parts != undefined && base.parts.length > 0 ? map(base.parts, function (o) { return new Part(JSON.stringify(o)) }) : [];

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
     * Getter quantity
     * @return {string}
     */
    public get quantity(): string {
        return this._quantity;
    }

    /**
     * Setter quantity
     * @param {string} value
     */
    public set quantity(value: string) {
        this._quantity = value;
    }

    /**
     * Getter spec
     * @return {boolean}
     */
    public get spec(): boolean {
        return this._spec;
    }

    /**
     * Setter spec
     * @param {boolean} value
     */
    public set spec(value: boolean) {
        this._spec = value;
    }

    /**
     * Getter specs
     * @return {Spec[]}
     */
    public get specs(): Spec[] {
        return this._specs;
    }

    /**
     * Setter specs
     * @param {Spec[]} value
     */
    public set specs(value: Spec[]) {
        this._specs = value;
    }

    /**
     * Getter part
     * @return {boolean}
     */
    public get part(): boolean {
        return this._part;
    }

    /**
     * Setter part
     * @param {boolean} value
     */
    public set part(value: boolean) {
        this._part = value;
    }

    /**
     * Getter parts
     * @return {Part[]}
     */
    public get parts(): Part[] {
        return this._parts;
    }

    /**
     * Setter parts
     * @param {Part[]} value
     */
    public set parts(value: Part[]) {
        this._parts = value;
    }

    toJSON(): object {
        let specs = this.specs.length > 0 ? map(this.specs, function (o) { return o.toJSON() }) : [];
        let parts = this.parts.length > 0 ? map(this.parts, function (o) { return o.toJSON() }) : [];

        let quantity: object = {
            id: this.id,
            quantity: this.quantity,
            spec: this.spec,
            specs: specs,
            part: this.part,
            parts: parts
        }
        return quantity;
    }
}
