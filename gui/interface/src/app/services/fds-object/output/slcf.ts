import { FdsEntities } from '../../../enums/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Xb } from '../primitives';
import { Specie } from '../specie';
import { Part } from './part';
import { FdsEnums } from '../../../enums/fds-enums';
import { map, toString, get, toNumber, find } from 'lodash';

export interface DevcObject {
    id: number,
    uuid: string,
    idAC: number,
    xb: Xb,
    direction: string,
    value: number,
    quantities: object
}

export class Slcf {
    private _id: number;
    private _uuid: string;
    private _idAC: number;
    private _xb: Xb;
    private _direction: string;
    private _value: number;
    private _quantities: object[];
    private _spec: boolean;
    private _part: boolean;

    constructor(jsonString: string, specs: Specie[] = undefined, parts: Part[] = undefined) {

        let base: DevcObject;
        base = <DevcObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        //let SLCF = FdsEntities.SLCF;
        //let GUI_DEVC = FdsGuiEntities.DEVC;
        let ENUMS = FdsEnums.SLCF;

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.direction = toString(get(base, 'direction', 'x'));
        this.value = toNumber(get(base, 'value', 0));

        if (base['quantities']) {
            this.quantities = map(ENUMS.slcfQuantity, (value) => {
                var baseQuantity = find(base.quantities, (quantity) => {
                    return value.quantity == quantity.name;
                });
                var quantity = { label: value.label, name: value.quantity, marked: (baseQuantity.marked == true) };
                if (baseQuantity['spec']) {
                    this.spec = true;
                    if (specs) {
                        quantity['specs'] = map(baseQuantity['specs'], (spec) => {
                            var specie = find(specs, function (elem) {
                                return elem.id == spec;
                            })
                            return specie;
                        });
                    } else {

                    }
                }
                if (baseQuantity['part']) {
                    this.part = true;
                    if (parts) {
                        quantity['parts'] = map(baseQuantity['parts'], (part) => {
                            var particle = find(parts, function (elem) {
                                return elem.id == part;
                            })
                            return particle;

                        })
                    } else {

                    }
                }
                return quantity;
            })
        } else {
            this.quantities = map(ENUMS.slcfQuantity, (value) => {
                var base = { label: value.label, name: value.quantity, marked: false };
                if (value.spec) {
                    base['spec'] = true;
                    base['specs'] = [];
                }
                if (value.part) {
                    base['part'] = true;
                    base['parts'] = [];
                }
                return base;
            });

        }
    }

    public addSpec(index) {
        this.quantities[index]['specs'].push({ spec: {} });
    }
    
    public removeSpec(parent, index) {
        this.quantities[parent]['specs'].splice(index, 1);
    }

    public addPart(index) {
        this.quantities[index]['parts'].push({ spec: {} });
    }

    public removePart(parent, index) {
        this.quantities[parent]['parts'].splice(index, 1);
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

    public get xb(): Xb {
        return this._xb;
    }

    public set xb(value: Xb) {
        this._xb = value;
    }

    public get direction(): string {
        return this._direction;
    }

    public set direction(value: string) {
        this._direction = value;
    }

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        this._value = value;
    }

    public get quantities(): object[] {
        return this._quantities;
    }

    public set quantities(value: object[]) {
        this._quantities = value;
    }

    public get spec(): boolean {
        return this._spec;
    }

    public set spec(value: boolean) {
        this._spec = value;
    }

    public get part(): boolean {
        return this._part;
    }

    public set part(value: boolean) {
        this._part = value;
    }

    public toJSON(): object {
        let slcfQuantities = map(this.quantities, (value) => {
            var specs = undefined;
            var parts = undefined;
            var res = { label: value['label'], name: value['name'], marked: value['marked'] };

            if (value['spec'] && value['specs'] && value['specs'].length > 0) {
                specs = map(value['specs'], function (spec) {
                    return spec['spec'].id
                })
                res['spec'] = true;
                res['specs'] = specs;
            }
            if (value['part'] && value['parts'] && value['parts'].length > 0) {
                parts = map(value['parts'], function (part) {
                    return part['part'].id
                })
                res['part'] = true;
                res['parts'] = parts;
            }
            return res;
        })

        var slcf = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            direction: this.direction,
            value: this.value,
            quantities: slcfQuantities
        }
        return slcf;
    }
}