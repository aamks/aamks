import { FdsEntities } from '../../enums/fds-entities';
import * as _ from 'lodash';
import { Hole } from './hole'
import { Matl } from './matl'
import { Mesh } from './mesh'
import { Obst } from './obst'
import { Open } from './open'
import { Surf } from './surf'
import { Ramp } from './ramp';
import { General } from './general';
import { Devc } from './devc';
import { Part } from './part';
import { Prop } from './prop';
import { Specie } from './specie';
import { SurfVent } from './surf-vent';
import { Vent } from './vent';
import { JetFan } from './jet-fan';
import { Fire } from './fire';
import { Combustion } from './combustion';
import { Bndf } from './bndf';
import { Slcf } from './slcf';
import { Isof } from './isof';
import { Ctrl } from './ctrl';
import { FdsEnums } from '../../enums/fds-enums';

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
  fires = { fires: [], combustion: {}, radiation: {} };
  output = { general: {}, devcs: [], props: [], bndfs: [], slcfs: [], isofs: [], ctrls: [] };

  constructor(jsonString: string) {

    let base: FdsObject;
    base = <FdsObject>JSON.parse(jsonString);

    // Create general
    this.general = _.get(base, 'general') === undefined ? new General("{}") : new General(JSON.stringify(base.general));

    // Create ramps
    this.ramps = {
      ramps: (_.get(base, 'ramps.ramps') === undefined ? [] : _.map(base.ramps.ramps, (ramp) => {
        return new Ramp(JSON.stringify(ramp));
      }))
    };

    // Create props
    this.output.props = _.get(base, 'output.props') === undefined ? [] : _.map(base.output.props, (prop) => {
      return new Prop(JSON.stringify(prop), this.ramps.ramps, this.parts.parts);
    });

    // Create parts
    this.parts.parts = _.get(base, 'parts.parts') === undefined ? [] : _.map(base.parts.parts, (part) => {
      return new Part(JSON.stringify(part));
    });

    // Create species
    this.species.species = _.get(base, 'species.species') === undefined ? [] : _.map(base.species.species, function (specie) {
      return new Specie(JSON.stringify(specie));
    })

    // Create devices after props, parts and species initialization
    this.output.devcs = _.get(base, 'output.devcs') === undefined ? [] : _.map(base.output.devcs, (devc) => {
      return new Devc(JSON.stringify(devc), this.output.props, this.species.species, this.parts.parts);
    });

    // Create geometry objects
    this.geometry.meshes = _.get(base, 'geometry.meshes') === undefined ? [] : _.map(base.geometry.meshes, (mesh) => {
      return new Mesh(JSON.stringify(mesh));
    });
    this.geometry.opens = _.get(base, 'geometry.opens') === undefined ? [] : _.map(base.geometry.opens, (open) => {
      return new Open(JSON.stringify(open));
    });
    this.geometry.matls = _.get(base, 'geometry.matls') === undefined ? [] : _.map(base.geometry.matls, (matl) => {
      return new Matl(JSON.stringify(matl), this.ramps.ramps);
    });
    this.geometry.holes = _.get(base, 'geometry.holes') === undefined ? [] : _.map(base.geometry.holes, (hole) => {
      return new Hole(JSON.stringify(hole));
    });
    // Create geometry surfs after matls initialization
    this.geometry.surfs = _.get(base, 'geometry.surfs') === undefined ? [new Surf(JSON.stringify({ id: "inert", editable: false }))] : _.map(base.geometry.surfs, (surf) => {
      return new Surf(JSON.stringify(surf), this.geometry.matls);
    });
    // Create obsts after surfaces and devices initialization
    this.geometry.obsts = _.get(base, 'geometry.obsts') === undefined ? [] : _.map(base.geometry.obsts, (obst) => {
      return new Obst(JSON.stringify(obst), this.geometry.surfs, this.output.devcs);
    });

    // Create ventilation elements
    this.ventilation.surfs = _.get(base, 'ventilation.surfs') === undefined ? [] : _.map(base.ventilation.surfs, (surf) => {
      return new SurfVent(JSON.stringify(surf), this.ramps.ramps);
    });
    this.ventilation.jetfans = _.get(base, 'ventilation.jetfans') === undefined ? [] : _.map(base.ventilation.jetfans, (jetfan) => {
      return new JetFan(JSON.stringify(jetfan), this.ramps.ramps);
    });
    this.ventilation.vents = _.get(base, 'ventilation.vents') === undefined ? [] : _.map(base.ventilation.vents, (vent) => {
      return new Vent(JSON.stringify(vent), this.ventilation.surfs);
    });

    let RADI = FdsEntities.RADI;

    // Create fire elements
    // General structure:
    // fires:
    //      - fires
    //      - combustion -> fuel
    //      - radiation
    this.fires.fires = (_.get(base, 'fires.fires') === undefined ? [] : _.map(base.fires.fires, (fire) => {
      return new Fire(JSON.stringify(fire), this.ramps.ramps);
    }));
    this.fires.combustion = (_.get(base, 'fires.combustion') === undefined ? new Combustion(JSON.stringify({}), this.species.species) : new Combustion(JSON.stringify(base.fires.combustion), this.species.species));
    this.fires.radiation = {
      radiation: _.get(base, 'fires.radiation.radiation', RADI.RADIATION.default[0]),
      number_radiation_angles: _.get(base, 'fires.radiation.number_radiation_angles', RADI.NUMBER_RADIATION_ANGLES.default[0]),
      time_step_increment: _.get(base, 'fires.radiation.time_step_increment', RADI.TIME_STEP_INCREMENT.default[0])
    };
    // TODO probably to remove 
    /*
    fuels:(_.get(base, 'fires.fuels')===undefined ? []: _.map(base.fires.fuels, function(fuel) {
      return new Fuel(fuel);	
    })),
    combustion:(_.get(base, 'fires.combustion')===undefined ? new Combustion({}, self.species.species) : _.map(base.fires.combustion, function(combustion) {
      return new Combustion(combustion, self.species.species);
    })),
    */

    // Create output elements
    let DUMP = FdsEntities.DUMP;
    this.output.general = {
      nframes: _.toNumber(_.get(base, 'output.general.nframes', DUMP.NFRAMES.default[0])),
      dt_restart: _.toNumber(_.get(base, 'output.general.dt_restart', DUMP.DT_RESTART.default[0])),
      mass_file: _.toNumber(_.get(base, 'output.general.mass_file', DUMP.MASS_FILE.default[0])),
      smoke3d: _.toNumber(_.get(base, 'output.general.smoke3d', DUMP.SMOKE3D.default[0])),
      status_files: _.toNumber(_.get(base, 'output.general.status_files', DUMP.STATUS_FILES.default[0]))

    };

    let ENUMS = FdsEnums.BNDF;
    this.output.bndfs = _.get(base, 'output.bndfs') === undefined ? this.bndfInit() : _.map(base.output.bndfs, (bndf) => {
      let get_label = _.find(ENUMS.bndfQuantity, { 'quantity': bndf.quantity });
      bndf.label = get_label.label;
      return new Bndf(JSON.stringify(bndf), this.species.species, this.parts.parts);
    });

    this.output.slcfs = _.get(base, 'output.slcfs') === undefined ? [] : _.map(base.output.slcfs, (slcf) => {
      return new Slcf(JSON.stringify(slcf), this.species.species, this.parts.parts);
    });

    this.output.isofs = _.get(base, 'output.isofs') === undefined ? [] : _.map(base.output.isofs, (isof) => {
      return new Isof(JSON.stringify(isof), this.species.species, this.parts.parts);
    });

    this.output.props = _.get(base, 'output.props') === undefined ? [] : _.map(base.output.props, (prop) => {
      return new Prop(JSON.stringify(prop), this.ramps.ramps, this.parts.parts);
    });

    this.output.ctrls = _.get(base, 'output.ctrls') === undefined ? [] : _.map(base.output.ctrls, (ctrl) => {
      return new Ctrl(JSON.stringify(ctrl));
    });

  }

  // TODO refactor to empty constructor 
  public bndfInit() {
    let ENUMS = FdsEnums.BNDF;
    var bndfs = _.map(ENUMS.bndfQuantity, function (value) {
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
        matls: _.map(this.geometry['matls'], (matl: Matl) => { return matl.toJSON(); }),
        meshes: _.map(this.geometry['meshes'], (mesh: Mesh) => { return mesh.toJSON(); }),
        opens: _.map(this.geometry['opens'], (open: Open) => { return open.toJSON(); })
      },
      ramps: this.ramps
    }

    return fds;
  }


}
