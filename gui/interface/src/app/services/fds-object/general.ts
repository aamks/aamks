import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import * as _ from 'lodash';

export interface GeneralObject {
    head: {
        title: string,
        chid: string
    },
    time: {
        t_begin: number,
        t_end: number,
        dt: number,
        lock_time_step: boolean,
        restrict_time_step: boolean
    },
    misc: {
        tmpa: number,
        p_inf: number,
        humidity: number,
        gvec_x: number,
        gvec_y: number,
        gvec_z: number,
        restart: boolean,
        dns: boolean,
        noise: boolean,
        noise_velocity: number
    },
    init: {}
}

export class General {

    private _head: any;
    private _time: any;
    private _misc: any;
    private _init: any;

    constructor(jsonString: string) {

        let base: object;
        base = JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let HEAD = FdsEntities.HEAD;
        let TIME = FdsEntities.TIME;
        let MISC = FdsEntities.MISC;
        let INIT = FdsEntities.INIT;

        this.head = {
            title: _.get(base, 'head.title', HEAD.TITLE.default[0]),
            chid: _.get(base, 'head.chid', HEAD.CHID.default[0])
        }

        this.time = {
            t_begin: _.get(base, 'time.t_begin', TIME.T_BEGIN.default[0]),
            t_end: _.get(base, 'time.t_end', TIME.T_END.default[0]),
            dt: _.get(base, 'time.dt', ''),
            lock_time_step: _.get(base, 'time.lock_time_step', TIME.LOCK_TIME_STEP.default[0]),
            restrict_time_step: _.get(base, 'time.restrict_time_step', TIME.RESTRICT_TIME_STEP.default[0])
        };

        this.misc = {
            tmpa: _.get(base, 'misc.tmpa', MISC.TMPA.default[0]),
            p_inf: _.get(base, 'misc.p_inf', MISC.P_INF.default[0]),
            humidity: _.get(base, 'misc.humidity', MISC.HUMIDITY.default[0]),
            gvec_x: _.get(base, 'misc.gvec_x', MISC.GVEC.default[0]),
            gvec_y: _.get(base, 'misc.gvec_y', MISC.GVEC.default[1]),
            gvec_z: _.get(base, 'misc.gvec_z', MISC.GVEC.default[2]),
            restart: _.get(base, 'misc.restart', MISC.RESTART.default[0]),
            dns: _.get(base, 'misc.dns', MISC.DNS.default[0]),
            overwrite: _.get(base, 'misc.overwrite', MISC.OVERWRITE.default[0]),
            noise: _.get(base, 'misc.noise', MISC.NOISE.default[0]),
            noise_velocity: _.get(base, 'misc.noise_velocity', MISC.NOISE_VELOCITY.default[0])
        };

        this.init = {}

    }



    public get head(): any {
        return this._head;
    }

    public set head(value: any) {
        this._head = value;
    }

    public get time(): any {
        return this._time;
    }

    public set time(value: any) {
        this._time = value;
    }

    public get misc(): any {
        return this._misc;
    }

    public set misc(value: any) {
        this._misc = value;
    }

    public get init(): any {
        return this._init;
    }

    public set init(value: any) {
        this._init = value;
    }

    toJSON(): object {
        let general: object = {
            head: this.head,
            time: this.time,
            misc: this.misc,
            init: this.init
        }
        return general;
    }

}
