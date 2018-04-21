import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Spec } from "../specie/spec";
import { Fuel } from './fuel';
import { FdsEnums } from '../../../enums/fds-enums';
import { FdsEntities } from '../../../enums/fds-entities';
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

        //this.fuel=(lodash.get(base, 'fuel')===undefined ? new Fuel(lodash.find(defSpec, function(spec) {
        //			return spec.value==defWiz.reac.spec.value;
        //		}), species) : lodash.map(base.fuel, function(fuel) {
        //			return new Fuel(fuel, species);
        //		}));
        //this.fuel = get(base, 'fuel') === undefined ? new Fuel(JSON.stringify({})) : new Fuel(JSON.stringify(base.fuel), species);

        this.radiation = (get(base, 'radiation', true) == true);
        this.number_radiation_angles = get(base, 'radiation.number_radiation_angles', RADI.NUMBER_RADIATION_ANGLES.default[0]);
        this.time_step_increment = get(base, 'radiation.time_step_increment', RADI.TIME_STEP_INCREMENT.default[0])

    }

    //public changeFuel() {
    //    let SPECIES = FdsEnums.SPEC.species;
    //    let REAC = FdsEntities.REAC;

    //    if (this.fuel['spec']) {
    //        if (this.fuel['spec'].editable == false) {
    //            var spec = find(SPECIES, (spec) => {
    //                return this.fuel['spec'].id == spec.value;
    //            })
    //            //this.fuel = new Fuel(JSON.stringify(spec), species);

    //        } else {
    //            //var spec = this.fuel['spec'];
    //            //this.fuel = new Fuel(JSON.stringify({ spec: spec }), species);
    //            //this.fuel=new Fuel({spec:spec, formula: spec.formula}, species);
    //            //this.fires.combustion.fuel.formula=this.fires.fuel['formula']\.spec.formula;
    //        }
    //    } else {
    //        this.fuel['formula'] = REAC.FORMULA.default[0];
    //        this.fuel['c'] = REAC.C.default[0];
    //        this.fuel['h'] = REAC.H.default[0];
    //        this.fuel['o'] = REAC.O.default[0];
    //        this.fuel['n'] = REAC.N.default[0];
    //        this.fuel['heat_of_combustion'] = REAC.HEAT_OF_COMBUSTION[0];
    //        this.fuel['id'] = '';
    //    }
    //}


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

    public toJSON(): object {
        var combustion = {
            turnOnReaction: this.turnOnReaction,
            radiation: this.radiation,
            number_radiation_angles: this.number_radiation_angles,
            time_step_increment: this.time_step_increment
        }
        return combustion;
    }

    //if(!fires) {
    //	this.fires=base['fires']||[];
    //} else {
    //	this.fires=lodash.map(base['fires'], function(elem) {
    //		var fire=lodash.find(fires, function(fire) {
    //			return fire.id==elem;
    //		})

    //		return fire;

    //	})
    //
    //}
    //this.addFire=function() {
    //	this.fires.push({fire:{}});
    //};	
    //this.removeFire=function(index) {
    //	this.fires.splice(index,1);
    //}

    //this.toJSON=function(arg) {
    //	
    //	var fires=lodash.map(this.fires, function(fire) {
    //		return fire.fire.id;
    //	})
    //	var group={
    //		id:this.id,
    //		uuid:this.uuid,
    //		fires:fires
    //	}
    //	return group; 
    //}

}
