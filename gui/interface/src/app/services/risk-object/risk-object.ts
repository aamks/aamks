import { BuildingCharacteristic } from "./building-characteristic";
import { BuildingInfrastructure } from "./building-infrastructure";
import { Settings } from "./settings";
import { General } from "./general";
import { get } from "lodash";

export interface RiskObject {
    general: {},
    buildingCharacteristic: BuildingCharacteristic,
    buildingInfrastructure: BuildingInfrastructure,
    settings: Settings
}

export class Risk {

    general: General;
    buildingCharacteristic: BuildingCharacteristic;
    buildingInfrastructure: BuildingInfrastructure;
    settings: Settings;

    constructor(jsonString: string) {

        let base: RiskObject;
        base = <RiskObject>JSON.parse(jsonString);

        // Create general
        this.general = get(base, 'general') === undefined ? new General("{}") : new General(JSON.stringify(base.general));
        this.buildingCharacteristic = new BuildingCharacteristic();
        this.buildingInfrastructure = new BuildingInfrastructure();
        this.settings = new Settings('{}');

    }

    public toJSON() : object {
        let risk = {
            general: this.general,
            buildingCharacteristic: this.buildingCharacteristic,
            buildingInfrastructure: this.buildingInfrastructure
        }
        return risk;
    }


}
