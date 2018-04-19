import { RiskEntities } from "../../enums/risk-entities";
import { get } from "lodash";
import { RiskEnums } from "../../enums/risk-enums";
/*
Infrastracutre

hasDetectors - pokazuje formularz
alarming
hasSprinklers - pokazuje formularz
hasNSHEVS - pokazuje formularz

wentylatory - mvent lista z prawej stronie
*/

export interface BuildingInfrastructureObject {
    hasDetectors: boolean,
    hasSprinklers: boolean,
    hasNshevs: boolean,
    alarming: string,
    sprinklers: {
        comment: string,
        activationTemperature: number,
        activationTemperatureSd: number,
        rti: number,
        sprayDensity: number,
        sprayDensitySd: number,
        notBrokenProbability: number
    },
    detectors: {
        comment: string,
        type: string,
        rti: number,
        activationTemperature: number,
        activationTemperatureSd: number,
        activationObscuration: number,
        activationObscurationSd: number,
        notBrokenProbability: number
    }
    nshevs: {
        activationTime: number
    }
}

export class BuildingInfrastructure {

    private _hasDetectors: boolean;
    private _hasSprinklers: boolean;
    private _hasNshevs: boolean;
    private _alarming: string;
    private _sprinklers: any;
    private _detectors: any;
    private _nshevs: any;

    constructor(jsonString: string) {

        let base: BuildingInfrastructureObject;
        base = <BuildingInfrastructureObject>JSON.parse(jsonString);

        let NSHEVS = RiskEntities.nshevs;
        let INFRASTRUCTURE = RiskEntities.infrastructure;

        this.hasDetectors = get(base, 'hasDetectors', INFRASTRUCTURE.hasDetectors.default) as boolean;
        this.hasSprinklers = get(base, 'hasSprinklers', INFRASTRUCTURE.hasSprinklers.default) as boolean;
        this.hasNshevs = get(base, 'hasNshevs', INFRASTRUCTURE.hasNshevs.default) as boolean;
        
        this.alarming = get(base, 'alarming', 'a1') as string;

        this.sprinklers = {
            comment: get(base, 'comment', INFRASTRUCTURE.sprinklers.comment.default),
            activationTemperature: get(base.sprinklers, 'activationTemperature', INFRASTRUCTURE.sprinklers.activationTemperature.default),
            activationTemperatureSd: get(base, 'activationTemperatureSd', INFRASTRUCTURE.sprinklers.activationTemperatureSd.default),
            rti: get(base.sprinklers, 'rti', INFRASTRUCTURE.sprinklers.rti.default),
            sprayDensity: get(base.sprinklers, 'sprayDensity', INFRASTRUCTURE.sprinklers.sprayDensity.default),
            sprayDensitySd: get(base, 'sprayDensitySd', INFRASTRUCTURE.sprinklers.sprayDensitySd.default),
            notBrokenProbability: get(base, 'notBrokenProbability', INFRASTRUCTURE.sprinklers.notBrokenProbability.default),
        };
        this.detectors = {
            comment: get(base, 'comment', INFRASTRUCTURE.detectors.comment.default),
            type: get(base, 'type', INFRASTRUCTURE.detectors.type.default),
            rti: get(base.detectors, 'rti', INFRASTRUCTURE.detectors.rti.default),
            activationTemperature: get(base.detectors, 'activationTemperature', INFRASTRUCTURE.detectors.activationTemperature.default),
            activationTemperatureSd: get(base, 'activationTemperatureSd', INFRASTRUCTURE.detectors.activationTemperatureSd.default),
            activationObscuration: get(base.detectors, 'activationObscuration', INFRASTRUCTURE.detectors.activationObscuration.default),
            activationObscurationSd: get(base, 'activationObscurationSd', INFRASTRUCTURE.detectors.activationObscurationSd.default),
            notBrokenProbability: get(base, 'notBrokenProbability', INFRASTRUCTURE.detectors.notBrokenProbability.default),
        };
        this.nshevs = {
            activationTime: get(base.nshevs, 'activationTime', NSHEVS.activationTime.default),
        };
    }

    /**
     * Getter hasDetectors
     * @return {boolean}
     */
    public get hasDetectors(): boolean {
        return this._hasDetectors;
    }

    /**
     * Setter hasDetectors
     * @param {boolean} value
     */
    public set hasDetectors(value: boolean) {
        this._hasDetectors = value;
    }

    /**
     * Getter hasSprinklers
     * @return {boolean}
     */
    public get hasSprinklers(): boolean {
        return this._hasSprinklers;
    }

    /**
     * Setter hasSprinklers
     * @param {boolean} value
     */
    public set hasSprinklers(value: boolean) {
        this._hasSprinklers = value;
    }

    /**
     * Getter hasNshevs
     * @return {boolean}
     */
    public get hasNshevs(): boolean {
        return this._hasNshevs;
    }

    /**
     * Setter hasNshevs
     * @param {boolean} value
     */
    public set hasNshevs(value: boolean) {
        this._hasNshevs = value;
    }

    /**
     * Getter alarming
     * @return {string}
     */
    public get alarming(): string {
        return this._alarming;
    }

    /**
     * Setter alarming
     * @param {string} value
     */
    public set alarming(value: string) {
        this._alarming = value;
    }

    /**
     * Getter sprinklers
     * @return {any}
     */
    public get sprinklers(): any {
        return this._sprinklers;
    }

    /**
     * Setter sprinklers
     * @param {any} value
     */
    public set sprinklers(value: any) {
        this._sprinklers = value;
    }

    /**
     * Getter detectors
     * @return {any}
     */
    public get detectors(): any {
        return this._detectors;
    }

    /**
     * Setter detectors
     * @param {any} value
     */
    public set detectors(value: any) {
        this._detectors = value;
    }

    /**
     * Getter nshevs
     * @return {any}
     */
    public get nshevs(): any {
        return this._nshevs;
    }

    /**
     * Setter nshevs
     * @param {any} value
     */
    public set nshevs(value: any) {
        this._nshevs = value;
    }

    /** Export to json */
    public toJSON(): object {
        let buildingInfrastructure = {
            hasDetectors: this.hasDetectors,
            hasSprinklers: this.hasSprinklers,
            hasNshevs: this.hasNshevs,
            alarming: this.alarming,
            sprinklers: this.sprinklers,
            detectors: this.detectors,
            nshevs: this.nshevs
        }
        return buildingInfrastructure;
    }

}