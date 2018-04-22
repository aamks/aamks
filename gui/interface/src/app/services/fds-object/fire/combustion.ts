import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Spec } from "../specie/spec";
import { Fuel } from './fuel';
import { FdsEnums } from '../../../enums/fds/enums/fds-enums';
import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { get, find } from 'lodash';

export interface CombustionObject {
    turnOnReaction: boolean,
    radiation: boolean,
    number_radiation_angles: number,
    time_step_increment: number
}

export class Combustion {
    private _turnOnReaction: boolean;
    private _radiation: boolean;
    private _number_radiation_angles: number;
    private _time_step_increment: number;

    constructor(jsonString: string) {

        let base: CombustionObject;
        base = <CombustionObject>JSON.parse(jsonString);

        let RADI = FdsEntities.RADI;

        let idGeneratorService = new IdGeneratorService;
        this.turnOnReaction = (get(base, 'turnOnReaction', true) == true);

        this.radiation = (get(base, 'radiation', true) == true);
        this.number_radiation_angles = get(base, 'radiation.number_radiation_angles', RADI.NUMBER_RADIATION_ANGLES.default[0]);
        this.time_step_increment = get(base, 'radiation.time_step_increment', RADI.TIME_STEP_INCREMENT.default[0])

    }

    /**
     * Getter turnOnReaction
     * @return {boolean}
     */
    public get turnOnReaction(): boolean {
        return this._turnOnReaction;
    }

    /**
     * Setter turnOnReaction
     * @param {boolean} value
     */
    public set turnOnReaction(value: boolean) {
        this._turnOnReaction = value;
    }

    /**
     * Getter radiation
     * @return {boolean}
     */
	public get radiation(): boolean {
		return this._radiation;
	}

    /**
     * Setter radiation
     * @param {boolean} value
     */
	public set radiation(value: boolean) {
		this._radiation = value;
	}

    /**
     * Getter number_radiation_angles
     * @return {number}
     */
    public get number_radiation_angles(): number {
        return this._number_radiation_angles;
    }

    /**
     * Setter number_radiation_angles
     * @param {number} value
     */
    public set number_radiation_angles(value: number) {
        this._number_radiation_angles = value;
    }

    /**
     * Getter time_step_increment
     * @return {number}
     */
    public get time_step_increment(): number {
        return this._time_step_increment;
    }

    /**
     * Setter time_step_increment
     * @param {number} value
     */
    public set time_step_increment(value: number) {
        this._time_step_increment = value;
    }

    /** Export to json */
    public toJSON(): object {
        var combustion = {
            turnOnReaction: this.turnOnReaction,
            radiation: this.radiation,
            number_radiation_angles: this.number_radiation_angles,
            time_step_increment: this.time_step_increment
        }
        return combustion;
    }
}
