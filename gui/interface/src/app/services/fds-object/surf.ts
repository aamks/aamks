import { Matl } from './matl';
import { FdsEntities } from '../../enums/fds-entities';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import * as _ from 'lodash';

export interface Layers {
    materials: object[],
    thickness: number
}

export interface SurfObject {
    id: string,
    uuid: string,
    idAC: number,
    editable: boolean,
    color: string,
    backing: string,
    adiabatic: boolean,
    transparency: number,
    layers: Layers[]
}

export class Surf {

    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _editable: boolean;
    private _color: string;
    private _backing: string;
    private _adiabatic: boolean;
    private _transparency: number;
    private _layers: Layers[];

    constructor(jsonString: string, matls: Matl[] = undefined) {

        let base: SurfObject;
        base = <SurfObject>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        let SURF = FdsEntities.SURF;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;

        this.editable = base.editable || true;
        this.color = _.toString(_.get(base, 'color', SURF.COLOR.default[0]));

        this.adiabatic = (_.get(base, 'adiabatic', SURF.ADIABATIC.default[0]) == true);
        this.transparency = _.toNumber(_.get(base, 'transparency', SURF.TRANSPARENCY.default[0]));
        this.backing = _.toString(_.get(base, 'backing', SURF.BACKING.default[0]));

        this.layers = [];

        // If matls isset add layers and materials
        if (matls) {
            _.each(base.layers, (layer) => {
                this.addLayer();
                var index = this.layers.length - 1;
                this.layers[index].thickness = layer.thickness;
                _.each(layer['materials'], (matl) => {
                    this.addMaterial(index);
                    let matlIndex = this.layers[index].materials.length - 1;
                    let material = _.find(matls, function (material) {
                        return material.id == matl['matl_id'];
                    });
                    this.layers[index].materials[matlIndex]['material'] = material;
                    this.layers[index].materials[matlIndex]['fraction'] = matl['fraction'];
                });
            });
        }
    }

    /** Add new layer to surf object */
    public addLayer() {
        this.layers.push({
            materials: [],
            thickness: 0,
        });
    };

    /** Delete layer */
    public deleteLayer(index) {
        this.layers.splice(index, 1);
    };

    /** Add material to layer in surf */
    public addMaterial(layerIndex) {
        let layer = this._layers[layerIndex];
        layer.materials.push({
            material: {},
            fraction: 0
        });
    };

    /** Delete material from layer in surf */
    public deleteMaterial(layerIndex, matlIndex) {
        this.layers[layerIndex].materials.splice(matlIndex, 1);
    };

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

    public get idAC(): number {
        return this._idAC;
    }

    public set idAC(value: number) {
        this._idAC = value;
    }

    public get editable(): boolean {
        return this._editable;
    }

    public set editable(value: boolean) {
        this._editable = value;
    }

    public get color(): string {
        return this._color;
    }

    public set color(value: string) {
        this._color = value;
    }

    public get backing(): string {
        return this._backing;
    }

    public set backing(value: string) {
        this._backing = value;
    }

    public get adiabatic(): boolean {
        return this._adiabatic;
    }

    public set adiabatic(value: boolean) {
        this._adiabatic = value;
    }

    public get transparency(): number {
        return this._transparency;
    }

    public set transparency(value: number) {
        this._transparency = value;
    }

    public get layers(): Layers[] {
        return this._layers;
    }

    public set layers(value: Layers[]) {
        this._layers = value;
    }

    public toJSON(): object {
        let surf: object = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            color: this.color,
            editable: this.editable,
            backing: this.backing,
            adiabatic: this.adiabatic,
            transparency: this.transparency,
            layers: _.map(this.layers, function (layer) {
                let materials = _.map(layer.materials, function (value) {
                    return { matl_id: value['material']['id'], fraction: value['fraction'] }
                });
                return { thickness: layer.thickness, materials: materials };
            })
        }
        return surf;
    }

}
