import { get, toNumber, round } from "lodash";
import { FdsEntities } from "../../../enums/fds-entities";

export interface HrrObject {
    hrr_type: string,
    value: number,
    spread_rate: number,
    alpha: number,
    time_function: string,
    tau_q: number,
    area: number
}

export class Hrr {
    private _hrr_type: string;
    private _value: number;
    private _spread_rate: number;
    private _alpha: number;
    private _time_function: string;
    private _tau_q: number;
    private _area: number;

    constructor(hrr: HrrObject) {

        let SURF = FdsEntities.SURF;

        this.hrr_type = get(hrr, 'hrr.hrr_type', 'hrrpua') as string;
        this._value = get(hrr, 'hrr.value', SURF.HRRPUA.default[0]) as number;
        this._spread_rate = get(hrr, 'hrr.spread_rate', 0) as number;
        this._alpha = get(hrr, 'hrr.alpha', 0) as number;
        this.time_function = get(hrr, 'time_function', 'ramp') as string;
        this._tau_q = get(hrr, 'hrr.tau_q', SURF.TAU_Q.default[0]) as number;
        this._area = get(hrr, 'area', 1) as number;
    }

    /**
     * Getter hrr_type
     * @return {string}
     */
    public get hrr_type(): string {
        return this._hrr_type;
    }

    /**
     * Setter hrr_type
     * @param {string} value
     */
    public set hrr_type(value: string) {
        this._hrr_type = value;
    }


    /**
     * Getter value
     * @return {number}
     */
    public get value(): number {
        return this._value;
    }

    /**
     * Setter value
     * @param {number} value
     */
    public set value(value: number) {
        this._value = value;
        this.alpha = this.alpha;
    }

    /**
     * Getter spread_rate
     * @return {number}
     */
    public get spread_rate(): number {
        return this._spread_rate;
    }

    /**
     * Setter spread_rate
     * @param {number} value
     */
    public set spread_rate(value: number) {

        let alpha = round(Math.pow(value, 2) * Math.PI * this.value, 6);
        let tauQ = round(Math.sqrt((this.value * this.area) / alpha) * (-1), 2);

        this._alpha = alpha;
        this._tau_q = tauQ;
        this._spread_rate = value;
    }

    /**
     * Getter alpha
     * @return {number}
     */
    public get alpha(): number {
        return this._alpha;
    }

    /**
     * Setter alpha
     * @param {number} value
     */
    public set alpha(value: number) {

        let radius1 = Math.sqrt(((value * Math.pow(10, 2)) / (Math.PI * this.value)));
        let radius2 = Math.sqrt(((value * Math.pow(11, 2)) / (Math.PI * this.value)));
        let spreadRate = round((radius2 - radius1), 6);
        let tauQ = round(Math.sqrt((this.value * this.area) / value), 2) * (-1);

        this._spread_rate = spreadRate;
        this._tau_q = tauQ
        this._alpha = value;
    }

    /**
     * Getter time_function
     * @return {string}
     */
    public get time_function(): string {
        return this._time_function;
    }

    /**
     * Setter time_function
     * @param {string} value
     */
    public set time_function(value: string) {
        this._time_function = value;
    }

    /**
     * Getter tau_q
     * @return {number}
     */
    public get tau_q(): number {
        return this._tau_q;
    }

    /**
     * Setter tau_q
     * @param {number} value
     */
    public set tau_q(value: number) {

        let alpha = round((this.value * this.area) / (Math.pow(value, 2)), 6);

        this._alpha = alpha;
        this._tau_q = value;
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
        // Recalculate tau_q
        this.alpha = this.alpha;
        this._area = value;
    }

}
