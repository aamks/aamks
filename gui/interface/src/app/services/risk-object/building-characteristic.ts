import { RiskEntities } from "../../enums/risk-entities";
import { get } from "lodash";

export interface BuildingCharacteristicObject {
    type: any,
    complexity: string,
    managment: string,
    materials: {
        wall: any,
        ceiling: any,
        floor: any,
        thicknessWall: any,
        thicknessCeiling: any,
        thicknessFloor: any
    }
}

export class BuildingCharacteristic {

    private _type: any;
    private _complexity: string;
    private _managment: string;
    private _materials: any;

    constructor(jsonString: string) {

        let base: BuildingCharacteristicObject;
        base = <BuildingCharacteristicObject>JSON.parse(jsonString);

        let CHARACTERISTIC = RiskEntities.characteristic;

        this.type = get(base, 'type', CHARACTERISTIC.type.default);
        this.complexity = get(base, 'simulation_time', CHARACTERISTIC.complexity.default) as string;
        this.managment = get(base, 'number_of_simulations', CHARACTERISTIC.managment.default) as string;

        this.materials = {
            wall: get(base.materials, 'wall', 'brick'),
            ceiling: get(base.materials, 'ceiling', 'concrete'),
            floor: get(base.materials, 'floor', 'concrete'),
            thicknessWall: get(base, 'materials.thicknessWall', CHARACTERISTIC.materials.thicknessWall.default),
            thicknessCeiling: get(base, 'materials.thicknessCeiling', CHARACTERISTIC.materials.thicknessCeiling.default),
            thicknessFloor: get(base, 'materials.thicknessFloor', CHARACTERISTIC.materials.thicknessFloor.default),
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
     * @return {any}
     */
    public get materials(): any {
        return this._materials;
    }

    /**
     * Setter materials
     * @param {any} value
     */
    public set materials(value: any) {
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