import { FdsEntities } from '../../enums/fds-entities';
import { FdsEnums } from '../../enums/fds-enums';
import { General } from './general/general';
import { Obst } from './geometry/obst';
import { Hole } from './geometry/hole';
import { Open } from './geometry/open';
import { Matl } from './geometry/matl';
import { Mesh } from './geometry/mesh';
import { Surf } from './geometry/surf';
import { SurfVent } from './ventilation/surf-vent';
import { Vent } from './ventilation/vent';
import { JetFan } from './ventilation/jet-fan';
import { Ramp } from './ramp/ramp';
import { Part } from './output/part';
import { Specie } from './specie';
import { Fire } from './fire/fire';
import { Combustion } from './fire/combustion';
import { Devc } from './output/devc';
import { Prop } from './output/prop';
import { Bndf } from './output/bndf';
import { Slcf } from './output/slcf';
import { Isof } from './output/isof';
import { Ctrl } from './output/ctrl';
import { get, map, toNumber, find } from 'lodash';

export interface FdsObject {


  general: {},
  geometry: { obsts: Obst[], holes: Hole[], opens: Open[], matls: Matl[], meshes: Mesh[], surfs: Surf[] },
  ventilation: { surfs: SurfVent[], vents: Vent[], jetfans: JetFan[] },
  ramps: { ramps: Ramp[] },
  parts: { parts: Part[] },
  species: { species: Specie[], surfs: Surf[] }, //vents: Vent[] 
  fires: { fires: Fire[], combustion: Combustion, radiation: {} };
  output: { devcs: Devc[], props: Prop[], bndfs: Bndf[], slcfs: Slcf[], isofs: Isof[], ctrls: Ctrl[] },
}

export class Fds {

  general: General;
  geometry = { obsts: [], holes: [], opens: [], matls: [], meshes: [], surfs: [] };
  ventilation = { surfs: [], vents: [], jetfans: [] };
  ramps = { ramps: [] };
  parts = { parts: [] };
  species = { species: [], surfs: [] } //vents: []
  fires = { fires: [], combustion: new Combustion(JSON.stringify({})), radiation: {} };
  output = { general: {}, devcs: [], props: [], bndfs: [], slcfs: [], isofs: [], ctrls: [] };

  constructor(jsonString: string) {

    let base: FdsObject;
    base = <FdsObject>JSON.parse(jsonString);

    // Create general
    this.general = get(base, 'general') === undefined ? new General("{}") : new General(JSON.stringify(base.general));

    // Create ramps
    this.ramps = {
      ramps: (get(base, 'ramps.ramps') === undefined ? [] : map(base.ramps.ramps, (ramp) => {
        return new Ramp(JSON.stringify(ramp));
      }))
    };

    // Create props
    this.output.props = get(base, 'output.props') === undefined ? [] : map(base.output.props, (prop) => {
      return new Prop(JSON.stringify(prop), this.ramps.ramps, this.parts.parts);
    });

    // Create parts
    this.parts.parts = get(base, 'parts.parts') === undefined ? [] : map(base.parts.parts, (part) => {
      return new Part(JSON.stringify(part));
    });

    // Create species
    this.species.species = get(base, 'species.species') === undefined ? [] : map(base.species.species, function (specie) {
      return new Specie(JSON.stringify(specie));
    })

    // Create devices after props, parts and species initialization
    this.output.devcs = get(base, 'output.devcs') === undefined ? [] : map(base.output.devcs, (devc) => {
      return new Devc(JSON.stringify(devc), this.output.props, this.species.species, this.parts.parts);
    });

    // Create geometry objects
    this.geometry.meshes = get(base, 'geometry.meshes') === undefined ? [] : map(base.geometry.meshes, (mesh) => {
      return new Mesh(JSON.stringify(mesh));
    });
    this.geometry.opens = get(base, 'geometry.opens') === undefined ? [] : map(base.geometry.opens, (open) => {
      return new Open(JSON.stringify(open));
    });
    this.geometry.matls = get(base, 'geometry.matls') === undefined ? [] : map(base.geometry.matls, (matl) => {
      return new Matl(JSON.stringify(matl), this.ramps.ramps);
    });
    this.geometry.holes = get(base, 'geometry.holes') === undefined ? [] : map(base.geometry.holes, (hole) => {
      return new Hole(JSON.stringify(hole));
    });
    // Create geometry surfs after matls initialization
    this.geometry.surfs = get(base, 'geometry.surfs') === undefined ? [new Surf(JSON.stringify({ id: "inert", editable: false }))] : map(base.geometry.surfs, (surf) => {
      return new Surf(JSON.stringify(surf), this.geometry.matls);
    });
    // Create obsts after surfaces and devices initialization
    this.geometry.obsts = get(base, 'geometry.obsts') === undefined ? [] : map(base.geometry.obsts, (obst) => {
      return new Obst(JSON.stringify(obst), this.geometry.surfs, this.output.devcs);
    });

    // Create ventilation elements
    this.ventilation.surfs = get(base, 'ventilation.surfs') === undefined ? [] : map(base.ventilation.surfs, (surf) => {
      return new SurfVent(JSON.stringify(surf), this.ramps.ramps);
    });
    this.ventilation.jetfans = get(base, 'ventilation.jetfans') === undefined ? [] : map(base.ventilation.jetfans, (jetfan) => {
      return new JetFan(JSON.stringify(jetfan), this.ramps.ramps);
    });
    this.ventilation.vents = get(base, 'ventilation.vents') === undefined ? [] : map(base.ventilation.vents, (vent) => {
      return new Vent(JSON.stringify(vent), this.ventilation.surfs);
    });

    let RADI = FdsEntities.RADI;

    // Create fire elements
    // General structure:
    // fires:
    //      - fires
    //      - combustion -> fuel
    //      - radiation
    this.fires.fires = (get(base, 'fires.fires') === undefined ? [] : map(base.fires.fires, (fire) => {
      return new Fire(JSON.stringify(fire), this.ramps.ramps);
    }));
    this.fires.combustion = (get(base, 'fires.combustion') === undefined ? new Combustion(JSON.stringify({}), this.species.species) : new Combustion(JSON.stringify(base.fires.combustion), this.species.species));
    this.fires.radiation = {
      radiation: get(base, 'fires.radiation.radiation', RADI.RADIATION.default[0]),
      number_radiation_angles: get(base, 'fires.radiation.number_radiation_angles', RADI.NUMBER_RADIATION_ANGLES.default[0]),
      time_step_increment: get(base, 'fires.radiation.time_step_increment', RADI.TIME_STEP_INCREMENT.default[0])
    };
    // TODO probably to remove 
    /*
    fuels:(get(base, 'fires.fuels')===undefined ? []: map(base.fires.fuels, function(fuel) {
      return new Fuel(fuel);	
    })),
    combustion:(get(base, 'fires.combustion')===undefined ? new Combustion({}, self.species.species) : map(base.fires.combustion, function(combustion) {
      return new Combustion(combustion, self.species.species);
    })),
    */

    // Create output elements
    let DUMP = FdsEntities.DUMP;
    this.output.general = {
      nframes: toNumber(get(base, 'output.general.nframes', DUMP.NFRAMES.default[0])),
      dt_restart: toNumber(get(base, 'output.general.dt_restart', DUMP.DT_RESTART.default[0])),
      mass_file: toNumber(get(base, 'output.general.mass_file', DUMP.MASS_FILE.default[0])),
      smoke3d: toNumber(get(base, 'output.general.smoke3d', DUMP.SMOKE3D.default[0])),
      status_files: toNumber(get(base, 'output.general.status_files', DUMP.STATUS_FILES.default[0]))
    };

    let ENUMS = FdsEnums.BNDF;
    this.output.bndfs = get(base, 'output.bndfs') === undefined ? this.bndfInit() : map(base.output.bndfs, (bndf) => {
      let getLabel = find(ENUMS.bndfQuantity, { 'quantity': bndf.quantity });
      bndf.label = getLabel.label;
      return new Bndf(JSON.stringify(bndf), this.species.species, this.parts.parts);
    });

    this.output.slcfs = get(base, 'output.slcfs') === undefined ? [] : map(base.output.slcfs, (slcf) => {
      return new Slcf(JSON.stringify(slcf), this.species.species, this.parts.parts);
    });

    this.output.isofs = get(base, 'output.isofs') === undefined ? [] : map(base.output.isofs, (isof) => {
      return new Isof(JSON.stringify(isof), this.species.species, this.parts.parts);
    });

    this.output.props = get(base, 'output.props') === undefined ? [] : map(base.output.props, (prop) => {
      return new Prop(JSON.stringify(prop), this.ramps.ramps, this.parts.parts);
    });

    this.output.ctrls = get(base, 'output.ctrls') === undefined ? [] : map(base.output.ctrls, (ctrl) => {
      return new Ctrl(JSON.stringify(ctrl));
    });

  }

  // TODO refactor to empty constructor 
  public bndfInit() {
    let ENUMS = FdsEnums.BNDF;
    var bndfs = map(ENUMS.bndfQuantity, function (value) {
      var base = { quantity: value.quantity, marked: false, spec: value.spec, part: value.part, label: value.label };
      return new Bndf(JSON.stringify(base));
    });
    return bndfs;
  }

  // TODO Removers !!!

  /** Prepare FDS object to export to DB */
  // TODO finish
  public toJSON(): object {
    let fds = {
      general: this.general.toJSON(),
      geometry: {
        meshes: map(this.geometry.meshes, (mesh: Mesh) => { return mesh.toJSON(); }),
        opens: map(this.geometry.opens, (open: Open) => { return open.toJSON(); }),
        matls: map(this.geometry.matls, (matl: Matl) => { return matl.toJSON(); }),
        surfs: map(this.geometry.surfs, (surf: Surf) => { return surf.toJSON(); }),
        obsts: map(this.geometry.obsts, (obst: Obst) => { return obst.toJSON(); }),
        holes: map(this.geometry.holes, (hole: Hole) => { return hole.toJSON(); }),
      },
      ventilation: {
        surfs: map(this.ventilation.surfs, (surf: SurfVent) => { return surf.toJSON(); }),
        vents: map(this.ventilation.vents, (vent: Vent) => { return vent.toJSON(); }),
        jetfans: map(this.ventilation.jetfans, (jetfan: JetFan) => { return jetfan.toJSON(); }),
      },
      fires: {
        fires: map(this.fires.fires, (fire: Fire) => { return fire.toJSON(); }),
        combustion: this.fires.combustion.toJSON(),
        radiation: this.fires.radiation,
      },
      output: {
        general: this.output.general,
        bndfs: map(this.output.bndfs, (bndf: Bndf) => { return bndf.toJSON(); }),
        slcfs: map(this.output.slcfs, (slcf: Slcf) => { return slcf.toJSON(); }),
        isofs: map(this.output.isofs, (isof: Isof) => { return isof.toJSON(); }),
        devcs: map(this.output.devcs, (devc: Devc) => { return devc.toJSON(); }),
        props: map(this.output.props, (prop: Prop) => { return prop.toJSON(); }),
        ctrls: map(this.output.ctrls, (ctrl: Ctrl) => { return ctrl.toJSON(); })
      },
      ramps: this.ramps
    }

    return fds;
  }


}
