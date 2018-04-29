import { RiskEntities } from "../../enums/risk/entities/risk-entities";
import { get } from "lodash";

export interface MaterialsInterface {
    wall: string,
    ceiling: string,
    floor: string,
    thicknessWall: number,
    thicknessCeiling: number,
    thicknessFloor: number
}

export interface BuildingCharacteristicInterface {
    type: any,
    complexity: string,
    managment: string,
    materials: MaterialsInterface
}

export class BuildingCharacteristic {

    private _type: any;
    private _complexity: string;
    private _managment: string;
    private _materials: MaterialsInterface;

    constructor(jsonString: string) {

        let base: BuildingCharacteristicInterface;
        base = <BuildingCharacteristicInterface>JSON.parse(jsonString);

        let CHARACTERISTIC = RiskEntities.characteristic;

        this.type = get(base, 'type', CHARACTERISTIC.type.default);
        this.complexity = get(base, 'complexity', CHARACTERISTIC.complexity.default) as string;
        this.managment = get(base, 'managment', CHARACTERISTIC.managment.default) as string;

        this.materials = {
            wall: get(base.materials, 'wall', 'brick') as string,
            ceiling: get(base.materials, 'ceiling', 'concrete') as string,
            floor: get(base.materials, 'floor', 'concrete') as string,
            thicknessWall: get(base.materials, 'thicknessWall', CHARACTERISTIC.materials.thicknessWall.default) as number,
            thicknessCeiling: get(base.materials, 'thicknessCeiling', CHARACTERISTIC.materials.thicknessCeiling.default) as number,
            thicknessFloor: get(base.materials, 'thicknessFloor', CHARACTERISTIC.materials.thicknessFloor.default) as number,
        };
    }

    /**
     * Getter type
     * @return {any}
     */
    public get type(): any {
        return this._type;
    }

    /**
     * Setter type
     * @param {any} value
     */
    public set type(value: any) {
        this._type = value;
    }

    /**
     * Getter complexity
     * @return {string}
     */
    public get complexity(): string {
        return this._complexity;
    }

    /**
     * Setter complexity
     * @param {string} value
     */
    public set complexity(value: string) {
        this._complexity = value;
    }

    /**
     * Getter managment
     * @return {string}
     */
    public get managment(): string {
        return this._managment;
    }

    /**
     * Setter managment
     * @param {string} value
     */
    public set managment(value: string) {
        this._managment = value;
    }

    /**
     * Getter materials
     * @return {MaterialsInterface}
     */
	public get materials(): MaterialsInterface {
		return this._materials;
	}

    /**
     * Setter materials
     * @param {MaterialsInterface} value
     */
	public set materials(value: MaterialsInterface) {
		this._materials = value;
	}


    public toJSON(): object {
        let buildingCharacteristic = {
            type: this.type,
            complexity: this.complexity,
            managment: this.managment,
            materials: this.materials
        }
        return buildingCharacteristic;
    }

}

/*

wentylatory - mvent lista z prawej stronie

Settings

distribution.json

*/