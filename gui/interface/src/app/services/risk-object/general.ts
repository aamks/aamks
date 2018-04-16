import { get } from 'lodash';
import { RiskEntities } from '../../enums/risk-entities';

export interface GeneralObject {
	projectName: string,
	simulationTime: number,
	numberOfSimulations: number,
	indoorTemperature: number,
	elevation: number,
	indoorPressure: number,
	humidity: number
}

export class General {

	private _projectName: string;
	private _simulationTime: number;
	private _numberOfSimulations: number;
	private _indoorTemperature: number;
	private _elevation: number;
	private _indoorPressure: number;
	private _humidity: number;

	constructor(jsonString: string) {

		let base: GeneralObject;
		base = <GeneralObject>JSON.parse(jsonString);

		let GENERAL = RiskEntities.general;

		this.projectName = get(base, 'projectName', GENERAL.projectName.default) as string;
		this.simulationTime = get(base, 'simulationTime', GENERAL.simulationTime.default) as number;
		this.numberOfSimulations = get(base, 'numberOfSimulations', GENERAL.numberOfSimulations.default) as number;
		this.indoorTemperature = get(base, 'indoorTemperature', GENERAL.indoorTemperature.default) as number;
		this.elevation = get(base, 'elevation', GENERAL.elevation.default) as number;
		this.indoorPressure = get(base, 'indoorPressure', GENERAL.indoorPressure.default) as number;
		this.humidity = get(base, 'humidity', GENERAL.humidity.default) as number;
	}

	public get projectName(): string {
		return this._projectName;
	}

	public set projectName(value: string) {
		this._projectName = value;
	}

	public get simulationTime(): number {
		return this._simulationTime;
	}

	public set simulationTime(value: number) {
		this._simulationTime = value;
	}

	public get numberOfSimulations(): number {
		return this._numberOfSimulations;
	}

	public set numberOfSimulations(value: number) {
		this._numberOfSimulations = value;
	}

	public get indoorTemperature(): number {
		return this._indoorTemperature;
	}

	public set indoorTemperature(value: number) {
		this._indoorTemperature = value;
	}

	public get elevation(): number {
		return this._elevation;
	}

	public set elevation(value: number) {
		this._elevation = value;
	}

	public get indoorPressure(): number {
		return this._indoorPressure;
	}

	public set indoorPressure(value: number) {
		this._indoorPressure = value;
	}

	public get humidity(): number {
		return this._humidity;
	}

	public set humidity(value: number) {
		this._humidity = value;
	}

	public toJSON(): object {
		let general = {
			projectName: this.projectName,
			simulationTime: this.simulationTime,
			numberOfSimulations: this.numberOfSimulations,
			indoorTemperature: this.indoorTemperature,
			elevation: this.elevation,
			indoorPressure: this.indoorPressure,
			humidity: this.humidity
		}
		return general;
	}


}
