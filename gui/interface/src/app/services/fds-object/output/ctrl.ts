import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { FdsEntities } from '../../../enums/fds-entities';
import { toPlainObject, get, toNumber, map } from 'lodash';

export interface CtrlObject {
    id: number,
    uuid: string,
    idAC: number,
    function_type: string,
    n: number,
    latch: boolean,
    inputs: object[]
}


export class Ctrl {
    private _id: number;
    private _uuid: string;
    private _idAC: number;
    private _function_type: string;
    private _n: number;
    private _latch: boolean;
    private _inputs: object[];

    constructor(jsonString: string) {

        let base: CtrlObject;
        base = <CtrlObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let CTRL = FdsEntities.CTRL;
        //let GUI_DEVC = FdsGuiEntities.DEVC;
        //let ENUMS = FdsEnums.SLCF;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.function_type = get(base, 'function_type', CTRL.FUNCTION_TYPE.default[0]);

        this.n = toNumber(get(base, 'n', CTRL.N.default[0]));
        this.latch = (get(base, 'latch', CTRL.LATCH.default[0]) == true);

        this.inputs = toPlainObject(get(base, 'inputs', [{}]));
    }

    public addInput() {
        this.inputs.push({ id: {} });
    }

    public removeInput(index) {
        this.inputs.splice(index, 1);
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

    public get function_type(): string {
        return this._function_type;
    }

    public set function_type(value: string) {
        this._function_type = value;
    }

    public get n(): number {
        return this._n;
    }

    public set n(value: number) {
        this._n = value;
    }

    public get latch(): boolean {
        return this._latch;
    }

    public set latch(value: boolean) {
        this._latch = value;
    }

    public get inputs(): object[] {
        return this._inputs;
    }

    public set inputs(value: object[]) {
        this._inputs = value;
    }

    public toJSON(): object {
        var inputs = map(this.inputs, function (input) {
            return input['id'];
        });

        var ctrl = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            function_type: this.function_type,
            latch: this.latch,
            n: this.n,
            inputs: inputs
        }
        return ctrl;
    }
}
