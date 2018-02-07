// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";



// 1. zdefiniowac slowniki
// 2. pozniej sprawdzac poczatek linii
// 3. jezeli zwykly tekst to dodawac slownik

CodeMirror.defineMode("fds", function() {
  //
  var ampers = {};
  // inicjalizacja słowników
  var bndf = {};
  var clip = {};
  var csvf = {};
  var ctrl = {};
  var devc = {};
  var dump = {};
  var head = {};
  var hole = {};
  var hvac = {};
  var init = {};
  var isof = {};
  var matl = {};
  var mesh = {};
  var misc = {};
  var mult = {};
  var obst = {};
  var part = {};
  var pres = {};
  var prof = {};
  var prop = {};
  var radi = {};
  var ramp = {};
  var reac = {};
  var slcf = {};
  var spec = {};
  var surf = {};
  var tabl = {};
  var time = {};
  var trnx = {};
  var vent = {};
  var zone = {};

  // funkcja define tworzy slowniki atrybutów dla amperów i slownik
  // amperów
  function define(style, string) {
    var split = string.split(' ');
    for(var i = 0; i < split.length; i++) {
		if(style == 'keyword') ampers[split[i]] = style;
		if(style == 'bndf') bndf[split[i]] = style;
		if(style == 'clip') clip[split[i]] = style;
		if(style == 'csvf') csvf[split[i]] = style;
		if(style == 'ctrl') ctrl[split[i]] = style;
		if(style == 'devc') devc[split[i]] = style;
		if(style == 'dump') dump[split[i]] = style;
		if(style == 'head') head[split[i]] = style;
		if(style == 'hole') hole[split[i]] = style;
		if(style == 'hvac') hvac[split[i]] = style;
		if(style == 'init') init[split[i]] = style;
		if(style == 'isof') isof[split[i]] = style;
		if(style == 'matl') matl[split[i]] = style;
		if(style == 'mesh') mesh[split[i]] = style;
		if(style == 'misc') misc[split[i]] = style;
		if(style == 'mult') mult[split[i]] = style;
		if(style == 'obst') obst[split[i]] = style;
		if(style == 'part') part[split[i]] = style;
		if(style == 'pres') pres[split[i]] = style;
		if(style == 'prof') prof[split[i]] = style;
		if(style == 'prop') prop[split[i]] = style;
		if(style == 'radi') radi[split[i]] = style;
		if(style == 'ramp') ramp[split[i]] = style;
		if(style == 'reac') reac[split[i]] = style;
		if(style == 'slcf') slcf[split[i]] = style;
		if(style == 'spec') spec[split[i]] = style;
		if(style == 'surf') surf[split[i]] = style;
		if(style == 'tabl') tabl[split[i]] = style;
		if(style == 'time') time[split[i]] = style;
		if(style == 'trnx') trnx[split[i]] = style;
		if(style == 'vent') vent[split[i]] = style;
		if(style == 'zone') zone[split[i]] = style;
    }
  };
  define('keyword', '&BNDF &CLIP &CSVF &CTRL &DEVC &DUMP &HEAD &HOLE &HVAC &INIT &ISOF &MATL &MESH &MISC &MULT &OBST &PART &PRES &PROF &PROP &RADI &RAMP &REAC &SLCF &SPEC &SURF &TABL &TAIL &TIME &TRNX &VENT &ZONE');
  define('bndf', 'FYI CELL_CENTERED PART_ID PROP_ID QUANTITY SPEC_ID STATISTICS');
  define('clip', 'FYI MAXIMUM_DENSITY MAXIMUM_TEMPERATURE MINIMUM_DENSITY MINIMUM_TEMPERATURE');
  define('csvf', 'FYI UVWFILE');
  define('ctrl', 'FYI CONSTANT DELAY DIFFERENTIAL_GAIN EVACUATION FUNCTION_TYPE ID INITIAL_STATE INPUT_ID INTEGRAL_GAIN LATCH N ON_BOUND PROPORTIONAL_GAIN RAMP_ID SETPOINT TARGET_VALUE TRIP_DIRECTION');
  define('devc', 'FYI BYPASS_FLOWRATE CONVERSION_FACTOR COORD_FACTOR CTRL_ID DELAY DEPTH DEVC_ID DRY DUCT_ID EVACUATION FLOWRATE HIDE_COORDINATES ID INITIAL_STATE INIT_ID IOR LATCH MATL_ID NODE_ID NO_UPDATE_DEVC_ID NO_UPDATE_CTRL_ID ORIENTATION ORIENTATION_NUMBER OUTPUT PART_ID PIPE_INDEX POINTS PROP_ID QUANTITY QUANTITY2 QUANTITY_RANGE RELATIVE ROTATION SETPOINT STATISTICS STATISTICS_START SMOOTHING_FACTOR SPEC_ID SURF_ID TIME_AVERAGED TRIP_DIRECTION UNITS VELO_INDEX XB XYZ X_ID Y_ID Z_ID');
  define('dump', 'FYI CLIP_RESTART_FILES COLUMN_DUMP_LIMIT CTRL_COLUMN_LIMIT DEVC_COLUMN_LIMIT DT_BNDF DT_CTRL DT_DEVC DT_DEVC_LINE DT_FLUSH DT_HRR DT_ISOF DT_MASS DT_PART DT_PL3D DT_PROF DT_RESTART DT_SL3D DT_SLCF EB_PART_FILE FLUSH_FILE_BUFFERS MASS_FILE MAXIMUM_PARTICLES NFRAMES PLOT3D_PART_ID PLOT3D_QUANTITY PLOT3D_SPEC_ID PLOT3D_VELO_INDEX RENDER_FILE SIG_FIGS SIG_FIGS_EXP SMOKE3D SMOKE3D_QUANTITY SMOKE3D_SPEC_ID STATUS_FILES SUPPRESS_DIAGNOSTICS UVW_TIMER VELOCITY_ERROR_FILE WRITE_XYZ');
  define('head', 'FYI CHID TITLE');
  define('hole', 'FYI COLOR CTRL_ID DEVC_ID EVACUATION MESH_ID MULT_ID RGB TRANSPARENCY XB');
  define('hvac', 'FYI AIRCOIL_ID AMBIENT AREA CLEAN_LOSS COOLANT_MASS_FLOW COOLANT_SPECIFIC_HEAT COOLANT_TEMPERATURE CTRL_ID DAMPER DEVC_ID DIAMETER DUCT_ID EFFICIENCY FAN_ID FILTER_ID FIXED_Q ID LEAK_ENTHALPY LENGTH LOADING LOADING_MULTIPLIER LOSS MASS_FLOW MAX_FLOW MAX_PRESSURE NODE_ID PERIMETER RAMP_ID REVERSE ROUGHNESS SPEC_ID TAU_AC TAU_FAN TAU_VF TYPE_ID VENT_ID VENT2_ID VOLUME_FLOW XYZ');
  define('init', 'FYI CELL_CENTERED CTRL_ID DENSITY DEVC_ID DIAMETER DT_INSERT DX DY DZ HEIGHT HRRPUV ID MASS_FRACTION MASS_PER_TIME MASS_PER_VOLUME MULT_ID N_PARTICLES N_PARTICLES_PER_CELL PART_ID PARTICLE_WEIGHT_FACTOR RADIUS SHAPE SPEC_ID TEMPERATURE UVW XB XYZ');
  define('isof', 'FYI QUANTITY REDUCE_TRIANGLES SPEC_ID VALUE VELO_INDEX');
  define('matl', 'FYI A ABSORPTION_COEFFICIENT ALLOW_SHRINKING ALLOW_SWELLING BOILING_TEMPERATURE CONDUCTIVITY CONDUCTIVITY_RAMP DENSITY E EMISSIVITY GAS_DIFFUSION_DEPTH HEATING_RATE HEAT_OF_COMBUSTION HEAT_OF_REACTION ID MATL_ID NU_MATL NU_SPEC N_REACTIONS N_O2 N_S N_T PCR PYROLYSIS_RANGE REFERENCE_RATE REFERENCE_TEMPERATURE SPECIFIC_HEAT SPECIFIC_HEAT_RAMP SPEC_ID THRESHOLD_SIGN THRESHOLD_TEMPERATURE');
  define('mesh', 'FYI COLOR CYLINDRICAL EVACUATION EVAC_HUMANS EVAC_Z_OFFSET ID IJK MPI_PROCESS N_THREADS MULT_ID RGB XB');
  define('misc', 'FYI ALLOW_SURFACE_PARTICLES ALLOW_UNDERSIDE_PARTICLES ASSUMED_GAS_TEMPERATURE ASSUMED_GAS_TEMPERATURE_RAMP BAROCLINIC BNDF_DEFAULT CNF_CUTOFF CFL_MAX CFL_MIN CFL_VELOCITY_NORM CHECK_HT CHECK_VN CLIP_MASS_FRACTION C_DEARDORFF C_SMAGORINSKY C_VREMAN CONSTANT_SPECIFIC_HEAT_RATIO DNS DRIFT_FLUX DT_HVAC DT_MEAN_FORCING EVACUATION_DRILL EVACUATION_MC_MODE EVAC_PRESSURE_ITERATIONS EVAC_TIME_ITERATIONS FLUX_LIMITER FORCE_VECTOR GAMMA GRAVITATIONAL_DEPOSITION GRAVITATIONAL_SETTLING GROUND_LEVEL GVEC H_F_REFERENCE_TEMPERATURE HUMIDITY INITIAL_UNMIXED_FRACTION LAPSE_RATE MAX_CHEMISTRY_ITERATIONS MAX_LEAK_PATHS MAXIMUM_VISIBILITY MEAN_FORCING MPI_TIMEOUT NOISE NOISE_VELOCITY NO_EVACUATION OVERWRITE PARTICLE_CFL PARTICLE_CFL_MAX POROUS_FLOOR PR P_INF RAMP_GX RAMP_GY RAMP_GZ RESTART RESTART_CHID RICHARDSON_ERROR_TOLERANCE RUN_AVG_FAC SC SECOND_ORDER_INTERPOLATED_BOUND SHARED_FILE_SYSTEM SMOKE_ALBEDO SOLID_PHASE_ONLY STRATIFICATION SUPPRESSION TEXTURE_ORIGIN THERMOPHORETIC_DEPOSITION THICKEN_OBSTRUCTIONS TMPA TURBULENCE_MODEL TURBULENT_DEPOSITION U0 V0 W0 VISIBILITY_FACTOR VN_MAX VN_MIN Y_CO2_INFTY Y_O2_INFTY');
  define('mult', 'FYI TEST');
  define('obst', 'FYI ALLOW_VENT BNDF_FACE BNDF_OBST BULK_DENSITY COLOR CTRL_ID DEVC_ID EVACUATION ID MESH_ID MULT_ID OUTLINE OVERLAY PERMIT_HOLE PROP_ID REMOVABLE RGB SURF_ID SURF_ID6 SURF_IDS TEXTURE_ORIGIN THICKEN TRANSPARENCY XB');
  define('part', 'FYI AGE BREAKUP BREAKUP_CNF_RAMP_ID BREAKUP_DISTRIBUTION BREAKUP_GAMMA_D BREAKUP_RATIO BREAKUP_SIGMA_D CHECK_DISTRIBUTION CNF_RAMP_ID COLOR COMPLEX_REFRACTIVE_INDEX CTRL_ID DENSE_VOLUME_FRACTION DEVC_ID DIAMETER DISTRIBUTION DRAG_COEFFICIENT DRAG_LAW FREE_AREA_FRACTION GAMMA_D HEAT_OF_COMBUSTION HORIZONTAL_VELOCITY ID INITIAL_TEMPERATURE MASSLESS MAXIMUM_DIAMETER MINIMUM_DIAMETER MONODISPERSE N_STRATA ORIENTATION PERMEABILITY PROP_ID QUANTITIES QUANTITIES_SPEC_ID RADIATIVE_PROPERTY_TABLE REAL_REFRACTIVE_INDEX RGB SAMPLING_FACTOR SIGMA_D SPEC_ID STATIC SURFACE_TENSION SURF_ID TURBULENT_DISPERSION VERTICAL_VELOCITY');
  define('pres', 'FYI CHECK_POISSON FISHPAK_BC MAX_PRESSURE_ITERATIONS PRESSURE_RELAX_TIME RELAXATION_FACTOR VELOCITY_TOLERANCE');
  define('prof', 'FYI ID FORMAT_INDEX IOR QUANTITY XYZ');
  define('prop', 'FYI ACTIVATION_OBSCURATION ACTIVATION_TEMPERATURE ALPHA_C ALPHA_E BEAD_DENSITY BEAD_DIAMETER BEAD_EMISSIVITY BEAD_HEAT_TRANSFER_COEFFICIENT BEAD_SPECIFIC_HEAT BETA_C BETA_E CHARACTERISTIC_VELOCITY C_FACTOR FLOW_RAMP FLOW_RATE FLOW_TAU GAUGE_EMISSIVITY GAUGE_TEMPERATURE ID INITIAL_TEMPERATURE K_FACTOR LENGTH MASS_FLOW_RATE OFFSET OPERATING_PRESSURE ORIFICE_DIAMETER P0,PX,PXX(3,3) P0 PARTICLES_PER_SECOND PARTICLE_VELOCITY PART_ID PDPA_END PDPA_HISTOGRAM PDPA_HISTOGRAM_CUMULATIVE PDPA_HISTOGRAM_LIMITS PDPA_HISTOGRAM_NBINS PDPA_INTEGRATE PDPA_M PDPA_N PDPA_NORMALIZE PDPA_RADIUS PDPA_START PRESSURE_RAMP QUANTITY RTI SMOKEVIEW_ID SMOKEVIEW_PARAMETERS SPEC_ID SPRAY_ANGLE SPRAY_PATTERN_BETA SPRAY_PATTERN_MU SPRAY_PATTERN_SHAPE SPRAY_PATTERN_TABLE VELOCITY_COMPONENT');
  define('radi', 'FYI ANGLE_INCREMENT BAND_LIMITS KAPPA0 MIE_MINIMUM_DIAMETER MIE_MAXIMUM_DIAMETER MIE_NDG NMIEANG NUMBER_INITIAL_ITERATIONS NUMBER_RADIATION_ANGLES PATH_LENGTH RADIATION RADTMP TIME_STEP_INCREMENT WIDE_BAND_MODEL');
  define('ramp', 'FYI CTRL_ID DEVC_ID F ID NUMBER_INTERPOLATION_POINTS T X');
  define('reac', 'FYI A AUTO_IGNITION_TEMPERATURE C CHECK_ATOM_BALANCE CO_YIELD CRITICAL_FLAME_TEMPERATURE E EPUMO2 EQUATION FORMULA FUEL FUEL_RADCAL_ID H HEAT_OF_COMBUSTION ID IDEAL N NU N_S N_T O RADIATIVE_FRACTION REAC_ATOM_ERROR REAC_MASS_ERROR SOOT_H_FRACTION SOOT_YIELD SPEC_ID_N_S SPEC_ID_NU THIRD_BODY');
  define('slcf', 'FYI CELL_CENTERED EVACUATION MAXIMUM_VALUE MESH_NUMBER MINIMUM_VALUE PART_ID PBX PBY PBZ QUANTITY QUANTITY2 SPEC_ID VECTOR VELO_INDEX XB');
  define('spec', 'FYI AEROSOL ALIAS BACKGROUND CONDUCTIVITY CONDUCTIVITY_SOLID DENSITY_LIQUID DENSITY_SOLID DIFFUSIVITY ENTHALPY_OF_FORMATION EPSILONKLJ FIC_CONCENTRATION FLD_LETHAL_DOSE FORMULA HEAT_OF_VAPORIZATION H_V_REFERENCE_TEMPERATURE ID LUMPED_COMPONENT_ONLY MASS_EXTINCTION_COEFFICIENT MASS_FRACTION MASS_FRACTION_0 MEAN_DIAMETER MELTING_TEMPERATURE MW PR_GAS PRIMITIVE RADCAL_ID RAMP_CP RAMP_CP_L RAMP_D RAMP_G_F RAMP_K RAMP_MU REFERENCE_ENTHALPY REFERENCE_TEMPERATURE SIGMALJ SPEC_ID SPECIFIC_HEAT SPECIFIC_HEAT_LIQUID VAPORIZATION_TEMPERATURE VISCOSITY VOLUME_FRACTION');
  define('surf', 'FYI ADIABATIC BACKING BURN_AWAY CELL_SIZE_FACTOR C_FORCED_CONSTANT C_FORCED_PR_EXP C_FORCED_RE C_FORCED_RE_EXP C_HORIZONTAL C_VERTICAL COLOR CONVECTION_LENGTH_SCALE CONVECTIVE_HEAT_FLUX CONVERT_VOLUME_TO_MASS DEFAULT DT_INSERT EMISSIVITY EMISSIVITY_BACK EVAC_DEFAULT EXTERNAL_FLUX E_COEFFICIENT FREE_SLIP GEOMETRY HEAT_OF_VAPORIZATION HEAT_TRANSFER_COEFFICIENT HEAT_TRANSFER_MODEL HRRPUA ID IGNITION_TEMPERATURE INNER_RADIUS INTERNAL_HEAT_SOURCE LAYER_DIVIDE LEAK_PATH LENGTH MASS_FLUX MASS_FLUX_TOTAL MASS_FLUX_VAR MASS_FRACTION MASS_TRANSFER_COEFFICIENT MATL_ID MATL_MASS_FRACTION MINIMUM_LAYER_THICKNESS MLRPUA N_LAYER_CELLS_MAX NET_HEAT_FLUX NO_SLIP NPPC PARTICLE_MASS_FLUX PART_ID PLE PROFILE RADIUS RAMP_EF RAMP_MF RAMP_PART RAMP_Q RAMP_T RAMP_T_I RAMP_V RAMP_V_X RAMP_V_Y RAMP_V_Z RGB ROUGHNESS SPEC_ID SPREAD_RATE STRETCH_FACTOR TAU_EF TAU_MF TAU_PART TAU_Q TAU_T TAU_V TEXTURE_HEIGHT TEXTURE_MAP TEXTURE_WIDTH TGA_ANALYSIS TGA_FINAL_TEMPERATURE TGA_HEATING_RATE THICKNESS TMP_BACK TMP_FRONT TMP_INNER TRANSPARENCY VEL VEL_BULK VEL_GRAD VEL_T VOLUME_FLOW WIDTH XYZ Z0');
  define('tabl', 'FYI ID TABLE_DATA');
  define('time', 'FYI DT EVAC_DT_FLOWFIELD EVAC_DT_STEADY_STATE LIMITING_DT_RATIO LOCK_TIME_STEP RESTRICT_TIME_STEP T_BEGIN T_END TIME_SHRINK_FACTOR WALL_INCREMENT');
  define('trnx', 'FYI CC IDERIV MESH_NUMBER PC');
  define('vent', 'FYI COLOR CTRL_ID DEVC_ID DYNAMIC_PRESSURE EVACUATION ID IOR L_EDDY L_EDDY_IJ MB MESH_ID MULT_ID N_EDDY OUTLINE PBX PRESSURE_RAMP REYNOLDS_STRESS RGB SPREAD_RATE SURF_ID TEXTURE_ORIGIN TMP_EXTERIOR TMP_EXTERIOR_RAMP TRANSPARENCY UVW VEL_RMS XB XYZ');
  define('zone', 'FYI ID LEAK_AREA PERIODIC XB');


return {
	startState: function() {return {inAmper: false, amper: null, inId: false};},
    token: function(stream, state) {

		function brackets() {
			stream.next();
			stream.eatWhile(/[\d+,:]/);
			if(stream.peek() == ')'){
				stream.next();
				stream.eatSpace();
				if(stream.peek() == '='){
					stream.next();
					return state.amper.substr(1, 4).toLowerCase();
				}
			} else return null;
		}
      // If amper starts here
      if (!state.inAmper && stream.peek() == '&') {
		  	stream.next();            // Skip quote
			stream.eatWhile(/\w/);
			state.amper = stream.current().toUpperCase();
			state.inAmper = true;    // Update state
			return ampers[state.amper]; // to robi kolor dla atrybutow
      }

      if (state.inAmper) {
		if(stream.match(/ID='\w*'/, true, true)) {
			state.inId=true;
			return 'id';
		}
        if (stream.peek() == '/') { // Quote found on this line
          stream.next();          // Skip quote
          state.inAmper = false; // Clear flag
          state.amper = null; // Clear amper for fds-hint
        } else {

			if (stream.eatSpace()) return null;
			if (stream.peek() == ',') {
				stream.next();
			  return 'comma';
			}
			if(stream.match('.true.', true, true) || stream.match('.false.', true, true)){
				return 'atom';
			}
			
			if(stream.match(/(\d*\.\d+[eE]\d*|\-\d*\.\d+[eE]\d*|\d+\.[eE]\d*|\-\d+\.[eE]\d*|\d+[eE]\d*|\-\d+[eE]\d*)/, true, true) || stream.match(/(\d+\.\d+|\d+|\d+\.|\.\d+|\-\d+\.\d+|\-\d+|\-\d+\.|\-\.\d+)/, true, true) ){
				return 'number';
			}
			if (stream.peek() == '\'') {
				stream.next();
				if(stream.skipTo('\'')){
					stream.next();
					return 'string';
				} else {
					stream.skipToEnd();
					return 'string';
				}
			}
			stream.next();
			stream.eatWhile(/\w/);
			var cur = stream.current().toUpperCase();
			if(state.amper == '&BNDF')      { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return bndf[cur]; } else return null; }
			else if(state.amper == '&CLIP') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return clip[cur]; } else return null; }
			else if(state.amper == '&CSVF') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return csvf[cur]; } else return null; }
			else if(state.amper == '&CTRL') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return ctrl[cur]; } else return null; }
			else if(state.amper == '&DEVC') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return devc[cur]; } else return null; }
			else if(state.amper == '&DUMP') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return dump[cur]; } else return null; }
			else if(state.amper == '&HEAD') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return head[cur]; } else return null; }
			else if(state.amper == '&HOLE') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return hole[cur]; } else return null; }
			else if(state.amper == '&HVAC') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return hvac[cur]; } else return null; }
			else if(state.amper == '&INIT') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return init[cur]; } else return null; }
			else if(state.amper == '&ISOF') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return isof[cur]; } else return null; }
			else if(state.amper == '&MATL') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return matl[cur]; } else return null; }
			else if(state.amper == '&MESH') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return mesh[cur]; } else return null; }
			else if(state.amper == '&MISC') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return misc[cur]; } else return null; }
			else if(state.amper == '&MULT') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return mult[cur]; } else return null; }
			else if(state.amper == '&OBST') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return obst[cur]; } else return null; }
			else if(state.amper == '&PART') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return part[cur]; } else return null; }
			else if(state.amper == '&PRES') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return pres[cur]; } else return null; }
			else if(state.amper == '&PROF') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return prof[cur]; } else return null; }
			else if(state.amper == '&PROP') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return prop[cur]; } else return null; }
			else if(state.amper == '&RADI') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return radi[cur]; } else return null; }
			else if(state.amper == '&RAMP') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return ramp[cur]; } else return null; }
			else if(state.amper == '&REAC') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return reac[cur]; } else return null; }
			else if(state.amper == '&SLCF') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return slcf[cur]; } else return null; }
			else if(state.amper == '&SPEC') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return spec[cur]; } else return null; }
			else if(state.amper == '&SURF') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return surf[cur]; } else return null; }
			else if(state.amper == '&TABL') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return tabl[cur]; } else return null; }
			else if(state.amper == '&TIME') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return time[cur]; } else return null; }
			else if(state.amper == '&TRNX') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return trnx[cur]; } else return null; }
			else if(state.amper == '&VENT') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return vent[cur]; } else return null; }
			else if(state.amper == '&ZONE') { stream.eatSpace(); if(stream.peek() == '(') return brackets(); else if(stream.peek() == '=') { stream.next(); return zone[cur]; } else return null; }
			else {
				return 'error';
			}
        }
        return "keyword";          // Token style
      } else {
        stream.skipTo('&') || stream.skipToEnd();
        return 'comment';              // Unstyled token
      }
    },
    indent: function(state, textAfter) {
		if(state.inAmper == true){ 	
			return 6;
		}
	}
  };
});

CodeMirror.defineMIME('text/x-fds', 'fds');
// ../../theme/fds.css

});
