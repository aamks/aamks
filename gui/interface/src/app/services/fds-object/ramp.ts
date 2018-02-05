import { IdGeneratorService } from '../../services/id-generator/id-generator.service';
import { FdsEntities } from '../../enums/fds-entities';
import { forEach, last } from 'lodash';

export interface RampObject {
    id: string,
    uuid: string,
    type: string,
    steps: {
        t: number,
        f: number
    }[]
}

export class Ramp {
    private _id: string;
    private _uuid: string;
    private _type: string;
    private _steps: any[];

    constructor(jsonString: string) {

        let base: RampObject;
        base = <RampObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;
        let RAMP = FdsEntities.RAMP;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.type = base.type || 'matl';

        this.steps = [];
        if (base.steps && base.steps.length > 0) {
            forEach(base.steps, (step) => {
                this.addStep(step.t * 1, step.f * 1);
            });
        } else {
            this.addStep(0,0);
            this.addStep(1,1);
        }
    }

    /** Add step to ramp */
    public addStep(time?: number, value?: number) {
        if(!time && !value) {
            last(this.steps) ? time = last(this.steps)['t'] + 1 : time = 0;
            last(this.steps) ? value = last(this.steps)['f'] + 1 : value = 0;
        }
        this.steps.push({ 
            t: time * 1, 
            f: value * 1
        });
    }

    /** Remove step from ramp */
    public removeStep(index: number) {
        this.steps.splice(index, 1);
    }

    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
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

    public get steps(): any[] {
        return this._steps;
    }

    public set steps(value: any[]) {
        this._steps = value;
    }

    toJSON(): object {
        let ramp: object = {
            id: this.id,
            uuid: this.uuid,
            type: this._type,
            steps: this._steps
        }
        return ramp;
    }

}
