import { FdsEntities } from '../../../enums/fds/entities/fds-entities';
import { IdGeneratorService } from '../../id-generator/id-generator.service';
import { Spec } from '../specie/spec';
import { Part } from './part';
import { FdsEnums } from '../../../enums/fds/enums/fds-enums';
import { get, map, find, filter, includes } from 'lodash';
import { quantities } from '../../../enums/fds/enums/fds-enums-quantities';

export interface DevcObject {
    id: number,
    uuid: string,
    idAC: number,
    label: string,
    quantity: object,
    marked: boolean,
    spec: boolean,
    specs: object[],
    part: boolean,
    parts: object[]

}

export class Bndf {
    private _id: number;
    private _uuid: string;
    private _idAC: number;
    private _label: string;
    private _marked: boolean;
    private _quantity: any;
    private _spec: boolean;
    private _specs: object[];
    private _part: boolean;
    private _parts: object[];

    constructor(jsonString: string, specs: Spec[] = undefined, parts: Part[] = undefined) {

        let base: DevcObject;
        base = <DevcObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SLCF = FdsEntities.SLCF;
        //let GUI_DEVC = FdsGuiEntities.DEVC;
        let QUANTITIES = filter(quantities, function(o) { return includes(o.type, 'b') });

        this.id = base.id || 0;
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.label = base['label'] || '';

        this.marked = (base.marked == false);
        this.quantity = get(base, 'quantity', '');

        if (base.part) {
            this.part = true;
            if (!parts) {
                this.parts = base.parts || [];
            } else {
                this.parts = map(base['parts'], function (part) {
                    var particle = find(parts, function (elem) {
                        return elem['id'] == part['id'];
                    });

                    return { part: particle };
                });
            }
        }


        if (base.spec) {
            this.spec = true;
            if (!specs) {
                this.specs = base['specs'] || [];
            } else {
                this.specs = map(base['specs'], function (spec) {

                    var specie = find(specs, function (elem) {
                        return elem.id == spec['id'];
                    });

                    return { spec: specie };
                });
            }
        }
    }

    public addSpec() {
        if (this.specs) {
            this.specs.push({ spec: {} });
        }
    }

    public removeSpec(index) {
        if (this.specs) {
            this.specs.splice(index, 1);
        }
    }

    public addPart() {
        if (this.parts) {
            this.parts.push({ part: {} });
        }
    }
    public removePart(index) {
        if (this.parts) {
            this.parts.splice(index, 1);
        }
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

	public get label(): string {
		return this._label;
	}

	public set label(value: string) {
		this._label = value;
	}

    public get marked(): boolean {
        return this._marked;
    }

    public set marked(value: boolean) {
        this._marked = value;
    }

    public get quantity(): any {
        return this._quantity;
    }

    public set quantity(value: any) {
        this._quantity = value;
    }

    public get spec(): boolean {
        return this._spec;
    }

    public set spec(value: boolean) {
        this._spec = value;
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
        var specs;
        var parts;
        if (this.specs && this.specs.length > 0) {
            specs = map(this.specs, function (spec) {
                return spec['spec'].id;
            })
        } else {
            specs = undefined;
        }

        if (this.parts && this.parts.length > 0) {
            parts = map(this.parts, function (part) {
                return part['part'].id;
            })
        } else {
            parts = undefined;
        }

        var bndf = {
            id: this.id,
            uuid: this.uuid,
            quantity: this.quantity,
            marked: this.marked,
            label: this.label,
            spec: this.spec,
            part: this.part,
            specs: specs,
            parts: parts
        }
        return bndf;
    }
}
