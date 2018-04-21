import { FdsEntities } from '../../../enums/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Ramp } from "../ramp/ramp";
import { SurfFire } from './surf-fire';
import { VentFire } from './vent-fire';
import { Specie } from '../specie';
import { FdsEnums } from '../../../enums/fds-enums';
import { find, toNumber } from 'lodash';

export interface FuelObject {
    id: string,
    uuid: string,
    idAC: number,
    editable: boolean,
    fuel: any,
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
    fuel_radcal_id: any,
    value: any
}

export class Fuel {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _editable: boolean;
    private _fuel: any;
    private _spec: any;
    private _formula: string;
    private _c: number;
    private _o: number;
    private _h: number;
    private _n: number;
    private _co_yield: number;
    private _soot_yield: number;
    private _heat_of_combustion: number;
    private _radiative_fraction: number;
    private _fuel_radcal_id: any;

    constructor(jsonString: string, specs: Specie[] = undefined) {

        let base: FuelObject;
        base = <FuelObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let REAC = FdsEntities.REAC;
        let RADCALS = FdsEnums.radcals;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.fuel = base['fuel'];
        if (!specs) {
            this.spec = base['spec'] || undefined;
        } else {
            if (base.editable == false) {
                this.spec = find(specs, function (spec) {
                    return spec.id == base['value'];
                })

            } else {
                if (base) {
                    this.spec = find(specs, function (spec) {
                        return spec.id == base.value;
                    })
                } else {
                    this.spec = undefined;
                }
            }
        }

        this.formula = base['formula'] || REAC.FORMULA.default[0];
        // Michal wylaczylem w partialsu set_formula bo nie mozna przypisac pustej '' wartosci
        this.c = toNumber(base['c'] || REAC.C.default[0]);
        this.o = toNumber(base['o'] || REAC.O.default[0]);
        this.h = toNumber(base['h'] || REAC.H.default[0]);
        this.n = toNumber(base['n'] || REAC.N.default[0]);
        this.co_yield = toNumber(base['co_yield'] || REAC.CO_YIELD.default[0]);
        this.soot_yield = toNumber(base['soot_yield'] || REAC.SOOT_YIELD.default[0]);
        this.heat_of_combustion = toNumber(base['heat_of_combustion'] || REAC.HEAT_OF_COMBUSTION.default[0]);
        this.radiative_fraction = toNumber(base['radiative_fraction'] || REAC.RADIATIVE_FRACTION.default[0]);
        this.fuel_radcal_id = base['fuel_radcal_id'] || REAC.FUEL_RADCAL_ID.default[0];

        this.fuel_radcal_id = find(RADCALS, (element) => {
            var id;
            if (base['fuel_radcal_id'] != undefined) {
                id = base['fuel_radcal_id'];
            } else if (this.spec && this.spec.editable == false && find(RADCALS, (element) => { return element.value == this.spec.id })) {
                id = this.spec.id;
            } else {
                id = REAC.FUEL_RADCAL_ID.default[0];

            }
            return element.value == id;
        })['value'];

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

	public get fuel(): any {
		return this._fuel;
	}

	public set fuel(value: any) {
		this._fuel = value;
	}

	public get spec(): any {
		return this._spec;
	}

	public set spec(value: any) {
		this._spec = value;
	}

	public get formula(): string {
		return this._formula;
	}

	public set formula(value: string) {
		this._formula = value;
	}

	public get c(): number {
		return this._c;
	}

	public set c(value: number) {
		this._c = value;
	}

	public get o(): number {
		return this._o;
	}

	public set o(value: number) {
		this._o = value;
	}

	public get h(): number {
		return this._h;
	}

	public set h(value: number) {
		this._h = value;
	}

	public get n(): number {
		return this._n;
	}

	public set n(value: number) {
		this._n = value;
	}

	public get co_yield(): number {
		return this._co_yield;
	}

	public set co_yield(value: number) {
		this._co_yield = value;
	}

	public get soot_yield(): number {
		return this._soot_yield;
	}

	public set soot_yield(value: number) {
		this._soot_yield = value;
	}

	public get heat_of_combustion(): number {
		return this._heat_of_combustion;
	}

	public set heat_of_combustion(value: number) {
		this._heat_of_combustion = value;
	}

	public get radiative_fraction(): number {
		return this._radiative_fraction;
	}

	public set radiative_fraction(value: number) {
		this._radiative_fraction = value;
	}

	public get fuel_radcal_id(): any {
		return this._fuel_radcal_id;
	}

	public set fuel_radcal_id(value: any) {
		this._fuel_radcal_id = value;
	}

    public toJSON(): object {
        var spec_id;
        if (this.spec)
            spec_id = this.spec.id;
        else
            spec_id = "";

        var fuel = {
            fuel: this.id,
            uuid: this.uuid,
            formula: this.formula,
            spec: spec_id,
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
