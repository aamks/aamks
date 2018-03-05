import { get } from 'lodash';

export interface GeneralObject {
    project_name: string,
    simulation_time: number,
    number_of_simulations: number,
    indoor_temperature: number,
    elevation: number,
    indoor_pressure: number,
    humidity: number
}

export class General {

    private _project_name: string;
    private _simulation_time: number;
    private _number_of_simulations: number;
    private _indoor_temperature: number;
    private _elevation: number;
    private _indoor_pressure: number;
    private _humidity: number;

    constructor(jsonString: string) {

        let base: GeneralObject;
        base = <GeneralObject>JSON.parse(jsonString);

        //this.id = base.id || 0;
        //this.uuid = base.uuid || idGeneratorService.genUUID();
        //this.idAC = base.idAC || 0;

        //this.function_type = get(base, 'function_type', CTRL.FUNCTION_TYPE.default[0]);

        //this.n = toNumber(get(base, 'n', CTRL.N.default[0]));
        //this.latch = (get(base, 'latch', CTRL.LATCH.default[0]) == true);

        //this.inputs = toPlainObject(get(base, 'inputs', [{}]));
    }

//    this.general = {
//    project_name: lodash.get(base, 'general.project_name', def.general.project_name.value),
//    set_project_name: function (arg) {
//        return setter(this, 'project_name', def.general.project_name, arg);
//    },
//    simulation_time: lodash.get(base, 'general.simulation_time', def.general.simulation_time.value),
//    set_simulation_time: function (arg) {
//        return setter(this, 'simulation_time', def.general.simulation_time, arg);
//    },
//    number_of_simulations: lodash.get(base, 'general.number_of_simulations', def.general.number_of_simulations.value),
//    set_number_of_simulations: function (arg) {
//        return setter(this, 'number_of_simulations', def.general.number_of_simulations, arg);
//    },
//    indoor_temp: lodash.get(base, 'general.indoor_temp', def.general.indoor_temp.value),
//    set_indoor_temp: function (arg) {
//        return setter(this, 'indoor_temp', def.general.indoor_temp, arg);
//    },
//    elevation: lodash.get(base, 'general.elevation', def.general.elevation.value),
//    set_elevation: function (arg) {
//        return setter(this, 'elevation', def.general.elevation, arg);
//    },
//    indoor_pressure: lodash.get(base, 'general.indoor_pressure', def.general.indoor_pressure.value),
//    set_indoor_pressure: function (arg) {
//        return setter(this, 'indoor_pressure', def.general.indoor_pressure, arg);
//    },
//    humidity: lodash.get(base, 'general.humidity', def.general.humidity.value),
//    set_humidity: function (arg) {
//        return setter(this, 'humidity', def.general.humidity, arg);
//    }
//};
  
}
