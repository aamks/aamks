import { IdGeneratorService } from '../id-generator/id-generator.service';
import { Specie } from "./specie";
import { Fuel } from './fuel';
import * as _ from 'lodash';
import { FdsEnums } from '../../enums/fds-enums';
import { FdsEntities } from '../../enums/fds-entities';

export interface CombustionObject {
    id: number,
    uuid: string,
    idAC: number,
    turnOnReaction: boolean,
    fuel: object
}

export class Combustion {
    private _id: number;
    private _uuid: string;
    private _idAC: number;
    private _turnOnReaction: boolean;
    private _fuel: object;

    constructor(jsonString: string, species: Specie[] = undefined) {

        let base: CombustionObject;
        base = <CombustionObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.turnOnReaction = (_.get(base, 'turnOnReaction', true) == true);

        //this.fuel=(lodash.get(base, 'fuel')===undefined ? new Fuel(lodash.find(defSpec, function(spec) {
        //			return spec.value==defWiz.reac.spec.value;
        //		}), species) : lodash.map(base.fuel, function(fuel) {
        //			return new Fuel(fuel, species);
        //		}));
        this.fuel = _.get(base, 'fuel') === undefined ? new Fuel(JSON.stringify({})) : new Fuel(JSON.stringify(base.fuel), species);

    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public set uuid(value: string) {
        this._uuid = value;
    }

    public get idAC(): number {
        return this._idAC;
    }

    public set idAC(value: number) {
        this._idAC = value;
    }

    public get turnOnReaction(): boolean {
        return this._turnOnReaction;
    }

    public set turnOnReaction(value: boolean) {
        this._turnOnReaction = value;
    }

    public get fuel(): object {
        return this._fuel;
    }

    public set fuel(value: object) {
        this._fuel = value;
    }

    public changeFuel() {
        let SPECIES = FdsEnums.SPEC.species;
        let REAC = FdsEntities.REAC;

        if (this.fuel['spec']) {
            if (this.fuel['spec'].editable == false) {
                var spec = _.find(SPECIES, (spec) => {
                    return this.fuel['spec'].id == spec.value;
                })
                //this.fuel = new Fuel(JSON.stringify(spec), species);

            } else {
                //var spec = this.fuel['spec'];
                //this.fuel = new Fuel(JSON.stringify({ spec: spec }), species);
                //this.fuel=new Fuel({spec:spec, formula: spec.formula}, species);
                //this.fires.combustion.fuel.formula=this.fires.fuel['formula']\.spec.formula;
            }
        } else {
            this.fuel['formula'] = REAC.FORMULA.default[0];
            this.fuel['c'] = REAC.C.default[0];
            this.fuel['h'] = REAC.H.default[0];
            this.fuel['o'] = REAC.O.default[0];
            this.fuel['n'] = REAC.N.default[0];
            this.fuel['heat_of_combustion'] = REAC.HEAT_OF_COMBUSTION[0];
            this.fuel['id'] = '';
        }
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
