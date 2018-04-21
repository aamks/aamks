import { FdsEntities } from '../../../enums/fds-entities';
import {IdGeneratorService} from '../../id-generator/id-generator.service';
import { FdsGuiEntities } from '../../../enums/fds-gui-entities';
import { FdsEnums } from '../../../enums/fds-enums';
import { Ramp } from '../ramp/ramp';
import { get, toNumber, clone, find, each, toString, toInteger } from 'lodash';

export interface PropObject {
    id:number,
    uuid:string,
    type:string,
    flow_type:number,
    activation_temperature:number,
    initial_temperature:number,
    rti:number,
    smoke_detector_model:string,
    smoke_detector_model_type:string,
    cleary_params:object,
    activation_obscuration:number,
    path_length:string,
    offset:number,
    flow_rate:number,
    mass_flow_rate:number,
    operating_pressure:number,
    k_factor:number,
    orifice_diameter:number,
    c_factor:number,
    particle_velocity:number,
    quantity:string,
    spray_angle:Array<object>,
    spray_pattern_shape:string,
    spray_pattern_mu:number,
    spray_pattern_beta:number,
    spray_angle1:number,
    spray_angle2:number,
    smokeview_id:string,
    pressure_ramp:Ramp,
    part_id:object
}

export class Prop {
    private _id:number;
    private _uuid:string;
    private _type:string;
    private _flow_type:string;
    private _activation_temperature:number;
    private _initial_temperature:number;
    private _rti:number;
    private _smoke_detector_model:string;
    private _smoke_detector_model_type:string;
    private _cleary_params:object;
    private _activation_obscuration:number;
    private _path_length:number;
    private _offset:number;
    private _flow_rate:number;
    private _mass_flow_rate:number;
    private _operating_pressure:number;
    private _k_factor:number;
    private _orifice_diameter:number;
    private _c_factor:number;
    private _particle_velocity:number;
    private _quantity:string;
    private _spray_angle:Array<object>;
    private _spray_pattern_shape:string;
    private _spray_pattern_mu:number;
    private _spray_pattern_beta:number;
    private _spray_angle1:number;
    private _spray_angle2:number;
    private _smokeview_id:string;
    private _pressure_ramp:object;
    private _part_id:object;

	constructor(jsonString:string, ramps:Ramp[] = undefined, parts:object[] = undefined) {

        let base:PropObject;
        base = <PropObject>JSON.parse(jsonString); 

        let idGeneratorService = new IdGeneratorService;
        
        let PROP = FdsEntities.PROP;
        let GUI_PROP = FdsGuiEntities.PROP;
        let CLEARY_PARAMS = FdsEnums.SPEC.cleary;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID(); 

        this.type = toString(get(base, 'type', GUI_PROP.TYPE.default[0]));
        this.flow_type = toString(get(base, 'type', GUI_PROP.FLOW_TYPE.default[0]));
        this.activation_temperature = toNumber(get(base, 'activation_temperature', PROP.ACTIVATION_TEMPERATURE.default[0]));
        this.initial_temperature = toNumber(get(base, 'initial_temperature', PROP.INITIAL_TEMPERATURE.default[0]));
        this.rti = toNumber(get(base, 'rti', PROP.RTI.default[0]));
        /*
        this.path_length=base['path_length']||def.prop.path_length.value;
        this.set_path_length=function(arg){
            return accessor.setter(this, 'path_length', def.prop.path_length, arg);
        }
        */
        this.smoke_detector_model = toString(get(base, 'smoke_detector_model', GUI_PROP.SMOKE_DETECTOR_MODEL.default[0]));
        this.smoke_detector_model_type = toString(get(base, 'smoke_detector_model_type', GUI_PROP.SMOKE_DETECTOR_MODEL_TYPE.default[0]));

        this.cleary_params = clone(find(CLEARY_PARAMS, (model) => {
            return model.value == this.smoke_detector_model_type;
        }));

        this.activation_obscuration = toNumber(get(base, 'activation_obscuration', PROP.ACTIVATION_OBSCURATION.default[0]));
        this.path_length = toNumber(get(base, 'path_length', PROP.PATH_LENGTH.default[0]));
    
        this.offset = toNumber(get(base, 'offset', PROP.OFFSET.default[0]));
        this.flow_rate = toNumber(get(base, 'flow_rate', PROP.FLOW_RATE));
        this.mass_flow_rate = toNumber(get(base, 'mass_flow_rate', PROP.MASS_FLOW_RATE.default[0]));
        this.operating_pressure=toNumber(get(base, 'operating_pressure', PROP.OPERATING_PRESSURE.default[0]));
        this.k_factor=toNumber(get(base, 'k_factor', PROP.K_FACTOR.default[0]));
        this.orifice_diameter=toNumber(get(base, 'orifice_diameter', PROP.ORIFICE_DIAMETER.default[0]));
        this.c_factor=toNumber(get(base, 'c_factor', PROP.C_FACTOR.default[0]));
        this.particle_velocity=toNumber(get(base, 'particle_velocity', PROP.PARTICLE_VELOCITY.default[0]));

        if(base.spray_angle && base.spray_angle.length > 0) {
            this.spray_angle = [];
            each(base.spray_angle, (spray_angle) => {
                this.addAngle(spray_angle['sp1'], spray_angle['sp2']);	
            });
        } else {
            this.spray_angle = [];
            this.addAngle(PROP.SPRAY_ANGLE.default[0], PROP.SPRAY_ANGLE.default[1]);
        }

        this.spray_pattern_shape = toString(get(base, 'spray_pattern_shape', "gaussian"));
        this.spray_pattern_mu = toInteger(get(base, 'spray_pattern_mu', PROP.SPRAY_PATTERN_MU.default[0]));
        this.spray_pattern_beta = toInteger(get(base, 'spray_pattern_beta', PROP.SPRAY_PATTERN_BETA.default[0]));
        this.spray_angle1 = toNumber(get(base, 'spray_angle1', PROP.SPRAY_ANGLE.default[0]));
        this.spray_angle2 = toNumber(get(base, 'spray_angle1', PROP.SPRAY_ANGLE.default[1]));
        this.smokeview_id = toString(get(base, 'smokeview_id', PROP.SMOKEVIEW_ID.default[0]));
    
        if(!ramps) {
            this.pressure_ramp = base.pressure_ramp || {};
        } else {
            this.pressure_ramp = find(ramps, (ramp) => {
                //?? TODO check
                return ramp.id == base.pressure_ramp.id;
            })
        }

        if(!parts) {
            this.part_id = base.part_id || {};
        } else {
            this.part_id= find(parts, function(part) {
                return part['id'] == base.part_id['id'];
            });
        }

    }

    /** Change smoke detector model type */
    changeSmokeDetectorModelType() {
        let CLEARY_PARAMS = FdsEnums.SPEC.cleary;
        this.cleary_params= clone(find(CLEARY_PARAMS, function(model){
            return model.value == this.smoke_detector_model_type;
        }));
    }

    set_alpha_e() {
        //return accessor.setter(this, 'cleary_params.alpha_e', def.prop.alpha_e, arg);
    }
    
    set_beta_e() {
        //return accessor.setter(this, 'cleary_params.beta_e', def.prop.beta_e, arg);
    }
    
    set_alpha_c(){
        //return accessor.setter(this, 'cleary_params.alpha_c', def.prop.alpha_c, arg);
    }

    set_beta_c(){
        //return accessor.setter(this, 'cleary_params.beta_c', def.prop.beta_c, arg);
    }

    addAngle(sp1:number, sp2:number) {
        this.spray_angle.push({
            sp1: sp1 || 0,
            sp2: sp2 || 0
        });
    }

    removeAngle(index) {
        this.spray_angle.splice(index, 1);
    };

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

	public get type(): string {
		return this._type;
	}

	public set type(value: string) {
		this._type = value;
	}

	public get flow_type(): string {
		return this._flow_type;
	}

	public set flow_type(value: string) {
		this._flow_type = value;
	}

	public get activation_temperature(): number {
		return this._activation_temperature;
	}

	public set activation_temperature(value: number) {
		this._activation_temperature = value;
	}

	public get initial_temperature(): number {
		return this._initial_temperature;
	}

	public set initial_temperature(value: number) {
		this._initial_temperature = value;
	}

	public get rti(): number {
		return this._rti;
	}

	public set rti(value: number) {
		this._rti = value;
	}

	public get smoke_detector_model(): string {
		return this._smoke_detector_model;
	}

	public set smoke_detector_model(value: string) {
		this._smoke_detector_model = value;
	}

	public get smoke_detector_model_type(): string {
		return this._smoke_detector_model_type;
	}

	public set smoke_detector_model_type(value: string) {
		this._smoke_detector_model_type = value;
	}

	public get cleary_params(): object {
		return this._cleary_params;
	}

	public set cleary_params(value: object) {
		this._cleary_params = value;
	}

	public get activation_obscuration(): number {
		return this._activation_obscuration;
	}

	public set activation_obscuration(value: number) {
		this._activation_obscuration = value;
	}

	public get path_length(): number {
		return this._path_length;
	}

	public set path_length(value: number) {
		this._path_length = value;
	}

	public get offset(): number {
		return this._offset;
	}

	public set offset(value: number) {
		this._offset = value;
	}

	public get flow_rate(): number {
		return this._flow_rate;
	}

	public set flow_rate(value: number) {
		this._flow_rate = value;
	}

	public get mass_flow_rate(): number {
		return this._mass_flow_rate;
	}

	public set mass_flow_rate(value: number) {
		this._mass_flow_rate = value;
	}

	public get operating_pressure(): number {
		return this._operating_pressure;
	}

	public set operating_pressure(value: number) {
		this._operating_pressure = value;
	}

	public get k_factor(): number {
		return this._k_factor;
	}

	public set k_factor(value: number) {
		this._k_factor = value;
	}

	public get orifice_diameter(): number {
		return this._orifice_diameter;
	}

	public set orifice_diameter(value: number) {
		this._orifice_diameter = value;
	}

	public get c_factor(): number {
		return this._c_factor;
	}

	public set c_factor(value: number) {
		this._c_factor = value;
	}

	public get particle_velocity(): number {
		return this._particle_velocity;
	}

	public set particle_velocity(value: number) {
		this._particle_velocity = value;
	}

	public get quantity(): string {
		return this._quantity;
	}

	public set quantity(value: string) {
		this._quantity = value;
    }

	public get spray_angle(): Array<object> {
		return this._spray_angle;
	}

	public set spray_angle(value: Array<object>) {
		this._spray_angle = value;
	}

	public get spray_pattern_shape(): string {
		return this._spray_pattern_shape;
	}

	public set spray_pattern_shape(value: string) {
		this._spray_pattern_shape = value;
	}

	public get spray_pattern_mu(): number {
		return this._spray_pattern_mu;
	}

	public set spray_pattern_mu(value: number) {
		this._spray_pattern_mu = value;
	}


	public get spray_pattern_beta(): number {
		return this._spray_pattern_beta;
	}

	public set spray_pattern_beta(value: number) {
		this._spray_pattern_beta = value;
	}

	public get spray_angle1(): number {
		return this._spray_angle1;
	}

	public set spray_angle1(value: number) {
		this._spray_angle1 = value;
	}

	public get spray_angle2(): number {
		return this._spray_angle2;
	}

	public set spray_angle2(value: number) {
		this._spray_angle2 = value;
	}

	public get smokeview_id(): string {
		return this._smokeview_id;
	}

	public set smokeview_id(value: string) {
		this._smokeview_id = value;
	}

	public get pressure_ramp(): object {
		return this._pressure_ramp;
	}

	public set pressure_ramp(value: object) {
		this._pressure_ramp = value;
	}

	public get part_id(): object {
		return this._part_id;
	}

	public set part_id(value: object) {
		this._part_id = value;
	}

    public toJSON():object {
        var prop={
            id:this.id,
            uuid:this.uuid,
            quantity:this.quantity,
            activation_temperature:this.activation_temperature,
            initial_temperature:this.initial_temperature,
            rti:this.rti,
            activation_obscuration:this.activation_obscuration,
            offset:this.offset,
            flow_type:this.flow_type,
            flow_rate:this.flow_rate,
            mass_flow_rate:this.mass_flow_rate,
            operating_pressure:this.operating_pressure,
            orifice_diameter:this.orifice_diameter,
            c_factor:this.c_factor,
            k_factor:this.k_factor,
            particle_velocity:this.particle_velocity,
            spray_angle:this.spray_angle,
            spray_angle1:this.spray_angle1,
            spray_angle2:this.spray_angle2,
            pressure_ramp:this.pressure_ramp['id'],
            part_id:this.part_id['id'],
            smokeview_id:this.smokeview_id
        }
        return prop; 
    }

}
