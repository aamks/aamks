import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Ramp } from "../ramp/ramp";
import { SurfFire } from './surf-fire';
import { VentFire } from './vent-fire';
import { Spec } from '../specie/spec';
import { FdsEnums } from '../../../enums/fds/enums/fds-enums';
import { find, toNumber, get } from 'lodash';

export interface FuelObject {
    id: string,
    uuid: string,
    editable: boolean,
    spec: any,
    formula: string,
    c: number,
    o: number,
    h: number,
    n: number,
    co_yield: number,
    soot_yield: number,
    heat_of_combustion: number,
    radiative_fraction: number,
    fuel_radcal_id: string,
}

export class Fuel {
    private _id: string;
    private _uuid: string;
    private _editable: boolean;
    private _spec: any;
    private _formula: string;
    private _c: number;
    private _o: number;
    private _h: number;
    private _n: number;
    private _co_yield: number;
    private _soot_yield: number;
    private _heat_of_combustion: number;
    private _radiation: boolean;
    private _radiative_fraction: number;
    private _fuel_radcal_id: string;

    constructor(jsonString: string, specs?: Spec[]) {

        let base: FuelObject;
        base = <FuelObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let REAC = FdsEntities.REAC;
        let RADCALS = FdsEnums.FIRE.radcals;

        this.id = base.id || 'FUEL1';
        this.uuid = base.uuid || idGeneratorService.genUUID();

        // Get from specs
        this.spec = (base.spec != '' && base.spec != undefined && specs != undefined && specs.length > 0) ? find(specs, function(o) { return o.id == base.spec }) : undefined;

        this.formula = get(base, 'formula', REAC.FORMULA.default[0]) as string;
        this.c = get(base, 'c', REAC.C.default[0]) as number;
        this.o = get(base, 'o', REAC.O.default[0]) as number;
        this.h = get(base, 'h', REAC.H.default[0]) as number;
        this.n = get(base, 'n', REAC.N.default[0]) as number;
        this.co_yield = get(base, 'co_yield', REAC.CO_YIELD.default[0]) as number;
        this.soot_yield = get(base, 'soot_yield', REAC.SOOT_YIELD.default[0]);
        this.heat_of_combustion = get(base, 'heat_of_combustion', REAC.HEAT_OF_COMBUSTION.default[0]);
        this.radiative_fraction = get(base, 'radiative_fraction', REAC.RADIATIVE_FRACTION.default[0]);

        if (base.fuel_radcal_id != '') {
            let fuelRadcal = find(RADCALS, function (o) { 
                return o.value == base.fuel_radcal_id; 
            });
            this.fuel_radcal_id = fuelRadcal != undefined ? fuelRadcal.value : REAC.FUEL_RADCAL_ID.default[0];
        } 
        else {
            this.fuel_radcal_id = REAC.FUEL_RADCAL_ID.default[0];
        }

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
     * Getter editable
     * @return {boolean}
     */
    public get editable(): boolean {
        return this._editable;
    }

    /**
     * Setter editable
     * @param {boolean} value
     */
    public set editable(value: boolean) {
        this._editable = value;
    }

    /**
     * Getter spec
     * @return {any}
     */
    public get spec(): any {
        return this._spec;
    }

    /**
     * Setter spec
     * @param {any} value
     */
    public set spec(value: any) {
        this._spec = value;
    }

    /**
     * Getter formula
     * @return {string}
     */
    public get formula(): string {
        return this._formula;
    }

    /**
     * Setter formula
     * @param {string} value
     */
    public set formula(value: string) {
        this._formula = value;
    }

    /**
     * Getter c
     * @return {number}
     */
    public get c(): number {
        return this._c;
    }

    /**
     * Setter c
     * @param {number} value
     */
    public set c(value: number) {
        this._c = value;
    }

    /**
     * Getter o
     * @return {number}
     */
    public get o(): number {
        return this._o;
    }

    /**
     * Setter o
     * @param {number} value
     */
    public set o(value: number) {
        this._o = value;
    }

    /**
     * Getter h
     * @return {number}
     */
    public get h(): number {
        return this._h;
    }

    /**
     * Setter h
     * @param {number} value
     */
    public set h(value: number) {
        this._h = value;
    }

    /**
     * Getter n
     * @return {number}
     */
    public get n(): number {
        return this._n;
    }

    /**
     * Setter n
     * @param {number} value
     */
    public set n(value: number) {
        this._n = value;
    }

    /**
     * Getter co_yield
     * @return {number}
     */
    public get co_yield(): number {
        return this._co_yield;
    }

    /**
     * Setter co_yield
     * @param {number} value
     */
    public set co_yield(value: number) {
        this._co_yield = value;
    }

    /**
     * Getter soot_yield
     * @return {number}
     */
    public get soot_yield(): number {
        return this._soot_yield;
    }

    /**
     * Setter soot_yield
     * @param {number} value
     */
    public set soot_yield(value: number) {
        this._soot_yield = value;
    }

    /**
     * Getter heat_of_combustion
     * @return {number}
     */
    public get heat_of_combustion(): number {
        return this._heat_of_combustion;
    }

    /**
     * Setter heat_of_combustion
     * @param {number} value
     */
    public set heat_of_combustion(value: number) {
        this._heat_of_combustion = value;
    }

    /**
     * Getter radiation
     * @return {boolean}
     */
    public get radiation(): boolean {
        return this._radiation;
    }

    /**
     * Setter radiation
     * @param {boolean} value
     */
    public set radiation(value: boolean) {
        this._radiation = value;
    }

    /**
     * Getter radiative_fraction
     * @return {number}
     */
    public get radiative_fraction(): number {
        return this._radiative_fraction;
    }

    /**
     * Setter radiative_fraction
     * @param {number} value
     */
    public set radiative_fraction(value: number) {
        this._radiative_fraction = value;
    }


    /**
     * Getter fuel_radcal_id
     * @return {string}
     */
	public get fuel_radcal_id(): string {
		return this._fuel_radcal_id;
	}

    /**
     * Setter fuel_radcal_id
     * @param {string} value
     */
	public set fuel_radcal_id(value: string) {
		this._fuel_radcal_id = value;
	}

    public toJSON(): object {
        let spec = this.spec != undefined ? this.spec.id : '';

        var fuel = {
            id: this.id,
            uuid: this.uuid,
            formula: this.formula,
            spec: spec,
            c: this.c,
            o: this.o,
            h: this.h,
            n: this.n,
            radiative_fraction: this.radiative_fraction,
            soot_yield: this.soot_yield,
            co_yield: this.co_yield,
            heat_of_combustion: this.heat_of_combustion,
            fuel_radcal_id: this.fuel_radcal_id
        }
        return fuel;
    }

}
