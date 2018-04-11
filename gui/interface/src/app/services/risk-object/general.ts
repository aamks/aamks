import { get } from 'lodash';
import { RiskEntities } from '../../enums/risk-entities';

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
    private _indoor_temp: number;
    private _elevation: number;
    private _indoor_pressure: number;
    private _humidity: number;

    constructor(jsonString: string) {

        let base: GeneralObject;
        base = <GeneralObject>JSON.parse(jsonString);

        let GENERAL = RiskEntities.general;

        this.project_name = get(base, 'project_name', GENERAL.projectName.default) as string;
        this.simulation_time = get(base, 'simulation_time', GENERAL.simulationTime.default) as number;
        this.number_of_simulations = get(base, 'number_of_simulations', GENERAL.numberOfSimulations.default) as number;
        this.indoor_temp = get(base, 'indoor_temp', GENERAL.indoorTemperature.default) as number;
        this.elevation = get(base, 'elevation', GENERAL.elevation.default) as number;
        this.indoor_pressure = get(base, 'indoor_pressure', GENERAL.indoorPressure.default) as number;
        this.humidity = get(base, 'humidity', GENERAL.humidity.default) as number;
    }

	public get project_name(): string {
		return this._project_name;
	}

	public set project_name(value: string) {
		this._project_name = value;
	}

	public get simulation_time(): number {
		return this._simulation_time;
	}

	public set simulation_time(value: number) {
		this._simulation_time = value;
	}

	public get number_of_simulations(): number {
		return this._number_of_simulations;
	}

	public set number_of_simulations(value: number) {
		this._number_of_simulations = value;
	}

	public get indoor_temp(): number {
		return this._indoor_temp;
	}

	public set indoor_temp(value: number) {
		this._indoor_temp = value;
	}

	public get elevation(): number {
		return this._elevation;
	}

	public set elevation(value: number) {
		this._elevation = value;
	}

	public get indoor_pressure(): number {
		return this._indoor_pressure;
	}

	public set indoor_pressure(value: number) {
		this._indoor_pressure = value;
	}

	public get humidity(): number {
		return this._humidity;
	}

	public set humidity(value: number) {
		this._humidity = value;
	}

}
