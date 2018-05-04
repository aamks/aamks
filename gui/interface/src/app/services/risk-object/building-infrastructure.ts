import { RiskEntities } from "../../enums/risk/entities/risk-entities";
import { get } from "lodash";
import { RiskEnums } from "../../enums/risk/enums/risk-enums";
/*
Infrastracutre

hasDetectors - pokazuje formularz
alarming
hasSprinklers - pokazuje formularz
hasNSHEVS - pokazuje formularz

wentylatory - mvent lista z prawej stronie
*/
export interface SprinklersInterface {
    comment: string,
    activationTemperature: number,
    activationTemperatureSd: number,
    rti: number,
    sprayDensity: number,
    sprayDensitySd: number,
    notBrokenProbability: number
}
export interface DetectorsInterface {
    comment: string,
    type: string,
    rti: number,
    activationTemperature: number,
    activationTemperatureSd: number,
    activationObscuration: number,
    activationObscurationSd: number,
    notBrokenProbability: number
}

export interface BuildingInfrastructureInterface {
    hasDetectors: boolean,
    hasSprinklers: boolean,
    hasNshevs: boolean,
    alarming: string,
    sprinklers: SprinklersInterface,
    detectors: DetectorsInterface,
    nshevs: {
        activationTime: number
    },
    cfastStaticRecords: string[]
}

export class BuildingInfrastructure {

    private _hasDetectors: boolean;
    private _hasSprinklers: boolean;
    private _hasNshevs: boolean;
    private _alarming: string;
    private _sprinklers: SprinklersInterface;
    private _detectors: DetectorsInterface;
    private _nshevs: any;
    private _cfastStaticRecords: string[];

    constructor(jsonString: string) {

        let base: BuildingInfrastructureInterface;
        base = <BuildingInfrastructureInterface>JSON.parse(jsonString);

        let NSHEVS = RiskEntities.nshevs;
        let INFRASTRUCTURE = RiskEntities.infrastructure;

        this.hasDetectors = get(base, 'hasDetectors', INFRASTRUCTURE.hasDetectors.default) as boolean;
        this.hasSprinklers = get(base, 'hasSprinklers', INFRASTRUCTURE.hasSprinklers.default) as boolean;
        this.hasNshevs = get(base, 'hasNshevs', INFRASTRUCTURE.hasNshevs.default) as boolean;

        this.alarming = get(base, 'alarming', 'a1') as string;

        this.sprinklers = {
            comment: get(base.sprinklers, 'comment', INFRASTRUCTURE.sprinklers.comment.default) as string,
            activationTemperature: get(base.sprinklers, 'activationTemperature', INFRASTRUCTURE.sprinklers.activationTemperature.default) as number,
            activationTemperatureSd: get(base.sprinklers, 'activationTemperatureSd', INFRASTRUCTURE.sprinklers.activationTemperatureSd.default) as number,
            rti: get(base.sprinklers, 'rti', INFRASTRUCTURE.sprinklers.rti.default) as number,
            sprayDensity: get(base.sprinklers, 'sprayDensity', INFRASTRUCTURE.sprinklers.sprayDensity.default) as number,
            sprayDensitySd: get(base.sprinklers, 'sprayDensitySd', INFRASTRUCTURE.sprinklers.sprayDensitySd.default) as number,
            notBrokenProbability: get(base.sprinklers, 'notBrokenProbability', INFRASTRUCTURE.sprinklers.notBrokenProbability.default) as number,
        };
        this.detectors = {
            comment: get(base.detectors, 'comment', INFRASTRUCTURE.detectors.comment.default) as string,
            type: get(base.detectors, 'type', INFRASTRUCTURE.detectors.type.default) as string,
            rti: get(base.detectors, 'rti', INFRASTRUCTURE.detectors.rti.default) as number,
            activationTemperature: get(base.detectors, 'activationTemperature', INFRASTRUCTURE.detectors.activationTemperature.default) as number,
            activationTemperatureSd: get(base.detectors, 'activationTemperatureSd', INFRASTRUCTURE.detectors.activationTemperatureSd.default) as number,
            activationObscuration: get(base.detectors, 'activationObscuration', INFRASTRUCTURE.detectors.activationObscuration.default) as number,
            activationObscurationSd: get(base.detectors, 'activationObscurationSd', INFRASTRUCTURE.detectors.activationObscurationSd.default) as number,
            notBrokenProbability: get(base.detectors, 'notBrokenProbability', INFRASTRUCTURE.detectors.notBrokenProbability.default) as number,
        };
        this.nshevs = {
            activationTime: get(base.nshevs, 'activationTime', NSHEVS.activationTime.default) as number,
        };
        this.cfastStaticRecords = get(base, 'cfastStaticRecords', []) as string[];
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
     * @return {SprinklersInterface}
     */
	public get sprinklers(): SprinklersInterface {
		return this._sprinklers;
	}

    /**
     * Setter sprinklers
     * @param {SprinklersInterface} value
     */
	public set sprinklers(value: SprinklersInterface) {
		this._sprinklers = value;
	}

    /**
     * Getter detectors
     * @return {DetectorsInterface}
     */
	public get detectors(): DetectorsInterface {
		return this._detectors;
	}

    /**
     * Setter detectors
     * @param {DetectorsInterface} value
     */
	public set detectors(value: DetectorsInterface) {
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

    /**
     * Getter cfastStaticRecords
     * @return {string[]}
     */
	public get cfastStaticRecords(): string[] {
		return this._cfastStaticRecords;
	}

    /**
     * Setter cfastStaticRecords
     * @param {string[]} value
     */
	public set cfastStaticRecords(value: string[]) {
		this._cfastStaticRecords = value;
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
            nshevs: this.nshevs,
            cfastStaticRecords: this.cfastStaticRecords
        }
        return buildingInfrastructure;
    }

}