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
        activationTemperature: number,
        rti: number,
        sprayDensity: number
    },
    detectorType: string,
    detectors: {
        rti: number,
        activationTemperature: number,
        activationObscuration: number
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
    private _detectorType: string;
    private _detectors: any;
    private _nshevs: any;

    constructor(jsonString: string) {

        let base: BuildingInfrastructureObject;
        base = <BuildingInfrastructureObject>JSON.parse(jsonString);

        let SPRINKLERS = RiskEntities.sprinklers;
        let DETECTORS = RiskEntities.detectors;
        let NSHEVS = RiskEntities.nshevs;
        let INFRASTRUCTURE = RiskEntities.infrastructure;

        this.hasDetectors = get(base, 'hasDetectors', INFRASTRUCTURE.hasDetectors.default) as boolean;
        this.hasSprinklers = get(base, 'hasSprinklers', INFRASTRUCTURE.hasSprinklers.default) as boolean;
        this.hasNshevs = get(base, 'hasNshevs', INFRASTRUCTURE.hasNshevs.default) as boolean;
        
        this.alarming = get(base, 'alarming', 'a1');
        this.detectorType = get(base, 'detectorType', 'heat');

        this.sprinklers = {
            activationTemperature: get(base.sprinklers, 'activationTemperature', SPRINKLERS.activationTemperature.default),
            rti: get(base.sprinklers, 'rti', SPRINKLERS.rti.default),
            sprayDensity: get(base.sprinklers, 'sprayDensity', SPRINKLERS.sprayDensity.default)
        };
        this.detectors = {
            rti: get(base.detectors, 'rti', DETECTORS.rti.default),
            activationTemperature: get(base.detectors, 'activationTemperature', DETECTORS.activationTemperature.default),
            activationObscuration: get(base.detectors, 'activationObscuration', DETECTORS.activationObscuration.default)
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
     * Getter detectorType
     * @return {string}
     */
    public get detectorType(): string {
        return this._detectorType;
    }

    /**
     * Setter detectorType
     * @param {string} value
     */
    public set detectorType(value: string) {
        this._detectorType = value;
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

    public toJSON(): object {
        let buildingInfrastructure = {
            hasDetectors: this.hasDetectors,
            hasSprinklers: this.hasSprinklers,
            hasNshevs: this.hasNshevs,
            alarming: this.alarming,
            sprinklers: this.sprinklers,
            detectorType: this.detectorType,
            detectors: this.detectors,
            nshevs: this.nshevs
        }
        return buildingInfrastructure;
    }

}

/*


Settings

distribution.json

*/
