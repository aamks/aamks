import { FdsEntities } from '../../../enums/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Specie } from '../specie';
import { Part } from './part';
import { FdsEnums } from '../../../enums/fds-enums';
import { get, map, find } from 'lodash';

export interface IsofObject {
    id: number,
    uuid: string,
    quantity: object,
    values: number[],
    spec: boolean,
    spec_id: any,
    specs: object[],
    part: boolean,
    parts: object[]
}


export class Isof {
    private _id: number;
    private _uuid: string;
    private _quantity: object;
    private _values: number[];
    private _spec: boolean;
    private _spec_id: any;
    private _specs: object[];
    private _part: boolean;
    private _parts: object[];

    constructor(jsonString: string, specs: Specie[] = undefined, parts: Part[] = undefined) {

        let base: IsofObject;
        base = <IsofObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let ISOF = FdsEntities.ISOF;
        //let GUI_DEVC = FdsGuiEntities.DEVC;
        let ENUMS = FdsEnums.ISOF;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();

        // TODO refactor specs / quantity 
        if (!specs) {
            this.quantity = get(base, 'quantity', {});
        } else {
            this.quantity = find(ENUMS.isofQuantity, (elem) => {
                return elem.quantity == base.quantity['id'];
            });
        }

        if (base['quantity'] && (base.quantity['spec']) == true) {
            if (!specs) {
                this.spec_id = base['spec_id'] || {};
            } else {
                var specie = find(specs, function (elem) {
                    return elem.id == base.quantity['spec'];
                })

                this.spec_id = specie;
            }
        }

        this.values = base['values'] || [];

        if (base['values'] && base['values'].length > 0 && this.quantity && this.quantity != {}) {
            //var self = this;
            //each(base['values'], function (value) {
            //    self.values.push({
            //        value: self.quantity.validator.value, set_value: function (arg) {
            //            return accessor.setter(this, 'value', self.quantity.validator, arg);
            //        }
            //    })
            //}
        } else {
            this.values = [];
        }
    }

    public addValue() {
        //if (this.quantity && this.quantity != {}) {
        //    this.values.push({
        //        value: this.quantity.validator.value, set_value: function (arg) {
        //            return accessor.setter(this, 'value', self.quantity.validator, arg);
        //        }
        //    });
        //}
    }

    public removeValue(index) {
        this.values.splice(index, 1);
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

    public get quantity(): object {
        return this._quantity;
    }

    public set quantity(value: object) {
        this._quantity = value;
    }

    public get values(): number[] {
        return this._values;
    }

    public set values(value: number[]) {
        this._values = value;
    }

    public get spec(): boolean {
        return this._spec;
    }

    public set spec(value: boolean) {
        this._spec = value;
    }

    public get spec_id(): any {
        return this._spec_id;
    }

    public set spec_id(value: any) {
        this._spec_id = value;
    }

    public get specs(): object[] {
        return this._specs;
    }

    public set specs(value: object[]) {
        this._specs = value;
    }

    public get part(): boolean {
        return this._part;
    }

    public set part(value: boolean) {
        this._part = value;
    }

    public get parts(): object[] {
        return this._parts;
    }

    public set parts(value: object[]) {
        this._parts = value;
    }


    public toJSON(): object {
        var self = this;
        var values = map(this.values, function (value) {
            return value['value'];
        })

        var isof = {
            id: this.id,
            uuid: this.uuid,
            quantity: this.quantity['quantity'],
            values: values,
            spec_id: get(self, 'spec_id.id', undefined)
        }
        return isof;
    }





}
