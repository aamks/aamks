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
        this.buildingCharacteristic = get(base, 'buildingCharacteristic') === undefined ? new BuildingCharacteristic("{}") : new BuildingCharacteristic(JSON.stringify(base.buildingCharacteristic));
        this.buildingInfrastructure = get(base, 'buildingInfrastructure') === undefined ? new BuildingInfrastructure("{}") : new BuildingInfrastructure(JSON.stringify(base.buildingInfrastructure));
        this.settings = get(base, 'settings') === undefined ? new Settings("{}") : new Settings(JSON.stringify(base.buildingInfrastructure));
    }

    public toJSON() : object {
        let risk = {
            general: this.general,
            buildingCharacteristic: this.buildingCharacteristic,
            buildingInfrastructure: this.buildingInfrastructure,
            settings: this.settings
        }
        return risk;
    }


}
