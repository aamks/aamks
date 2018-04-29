import { BuildingCharacteristic } from "./building-characteristic";
import { BuildingInfrastructure } from "./building-infrastructure";
import { Settings } from "./settings";
import { General } from "./general";
import { get } from "lodash";

export interface RiskObject {
    general: General,
    geometry: any,
    buildingCharacteristic: BuildingCharacteristic,
    buildingInfrastructure: BuildingInfrastructure,
    settings: Settings
}

export class Risk {

    general: General;
    geometry: any;
    buildingCharacteristic: BuildingCharacteristic;
    buildingInfrastructure: BuildingInfrastructure;
    settings: Settings;

    constructor(jsonString: string) {

        let base: RiskObject;
        base = <RiskObject>JSON.parse(jsonString);

        // Create general
        this.general = get(base, 'general') === undefined ? new General("{}") : new General(JSON.stringify(base.general));
        this.geometry = get(base, 'geometry', {});
        this.buildingCharacteristic = get(base, 'buildingCharacteristic') === undefined ? new BuildingCharacteristic("{}") : new BuildingCharacteristic(JSON.stringify(base.buildingCharacteristic));
        this.buildingInfrastructure = get(base, 'buildingInfrastructure') === undefined ? new BuildingInfrastructure("{}") : new BuildingInfrastructure(JSON.stringify(base.buildingInfrastructure));
        this.settings = get(base, 'settings') === undefined ? new Settings("{}") : new Settings(JSON.stringify(base.settings));
    }

    public toJSON() : object {
        let risk = {
            general: this.general.toJSON(),
            geometry: this.geometry,
            buildingCharacteristic: this.buildingCharacteristic.toJSON(),
            buildingInfrastructure: this.buildingInfrastructure.toJSON(),
            settings: this.settings.toJSON()
        }
        return risk;
    }

}
