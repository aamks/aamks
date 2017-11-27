<?php

$color=array('BLUE', 'RED');
$quantities=array('TEMPERATURE');
$patternInt='\d*';
$patternReal='\d';

require_once("fdsEntities.php");
require_once("wizEntities.php");
require_once("riskEntities.php");
require_once("enums.php");

$fdsObsolete=array(
/*{{{*/
	'BNDF'=>array(
		'RECOUNT_DRIP'=>'ATTRIBUTE IS ELIMINATED (see the manual)'),
	'CLIP'=>array(
		'MAXIMUM_MASS_FRACTION'=>'ATTRIBUTE IS ELIMINATED (see the manual)', 
		'MINIMUM_MASS_FRACTION'=>'ATTRIBUTE IS ELIMINATED (see the manual)'),
	'DUMP'=>array(
		'MAXIMUM_DROPLETS'=>'DUMP MAXIMUM_PARTICLES', 
		'STATE_FILE'=>'ATTRIBUTE IS ELIMINATED (see the manual)'),
	'INIT'=>array(
		'NUMBER_INITIAL_DROPLETS'=>'INIT N_PARTICLES, N_PARTICLES_PER_CELL'),
	'MATL'=>array(
		'NU_FUEL'=>'MATL NU_SPEC + SPEC_ID', 
		'NU_GAS'=>'MATL NU_SPEC + SPEC_ID', 
		'NU_RESIDUE'=>'MATL NU_MATL', 
		'NU_WATER'=>'MATL NU_SPEC + SPEC_ID', 
		'RESIDUE'=>'MATL MATL_ID'),
	'MISC'=>array(
		'BACKGROUND_SPECIES'=>'SPEC BACKGROUND=.TRUE.', 
		'CONDUCTIVITY'=>'SPEC CONDUCTIVITY', 
		'CO_PRODUCTION'=>'NEW PROCEDURE (see the manual)', 
		'CSMAG'=>'MISC C_SMAGORINSKY', 
		'MW'=>'SPEC MW', 
		'PRESSURE_CORRECTION'=>'PRES VELOCITY_TOLERANCE', 
		'RADIATION'=>'RADI RADIATION', 
		'EVAC_SURF_DEFAULT'=>'SURF EVAC_DEFAULT', 
		'SURF_DEFAULT'=>'SURF DEFAULT', 
		'VISCOSITY'=>'SPEC VISCOSITY'),
	'OBST'=>array(
		'SAWTOOTH'=>'SURF ATTRIBUTE IS ELIMINATED (see the manual)'),
	'PART'=>array(
		'FUEL'=>"&PART SPEC_ID='[FUEL]'", 
		'HEAT_OF_VAPORIZATION'=>'SPEC HEAT_OF_VAPORIZATION', 
		'H_V_REFERENCE_TEMPERATURE'=>'SPEC H_V_REFERENCE_TEMPERATURE', 
		'MELTING_TEMPERATURE'=>'SPEC MELTING_TEMPERATURE', 
		'NUMBER_INITIAL_DROPLETS'=>'INIT N_PARTICLES', 
		'PARTICLES_PER_SECOND'=>'PROP PARTICLES_PER_SECOND', 
		'SPECIFIC_HEAT'=>'SPEC SPECIFIC_HEAT_LIQUID', 
		'VAPORIZATION_TEMPERATURE'=>'SPEC VAPORIZATION_TEMPERATURE', 
		'WATER'=>"&PART SPEC_ID='WATER VAPOR'"),
	'PROP'=>array(
		'CABLE_DIAMETER'=>'NEW PROCEDURE (see the manual)', 
		'CABLE_FAILURE_TEMPERATURE'=>'NEW PROCEDURE (see the manual)', 
		'CABLE_JACKET_THICKNESS'=>'NEW PROCEDURE (see the manual)', 
		'CABLE_MASS_PER_LENGTH'=>'NEW PROCEDURE (see the manual)', 
		'CONDUIT_DIAMETER'=>'NEW PROCEDURE (see the manual)', 
		'CONDUIT_THICKNESS'=>'NEW PROCEDURE (see the manual)', 
		'DROPLETS_PER_SECOND'=>'PROP PARTICLES_PER_SECOND', 
		'DROPLET_VELOCITY'=>'PROP PARTICLE_VELOCITY', 
		'DT_INSERT'=>'NEW PROCEDURE (see the manual)'), 
	'RADI'=>array(
		'CH4_BANDS'=>'ATTRIBUTE IS ELIMINATED (see the manual)', 
		'RADIATIVE_FRACTION'=>'REAC RADIATIVE_FRACTION'),
	'REAC'=>array(
		'BOF'=>'REAC A', 
		'ID'=>'REAC FUEL', 
		'MASS_EXTINCTION_COEFFICIENT'=>'SPEC MASS_EXTINCTION_COEFFICIENT', 
		'MAXIMUM_VISIBILITY'=>'MISC MAXIMUM_VISIBILITY', 
		'OXIDIZER'=>'NEW PROCEDURE (see the manual)', 
		'VISIBILITY_FACTOR'=>'MISC VISIBILITY_FACTOR'), 
	'SPEC'=>array(
		'ABSORBING'=>'SPEC RADCAL_ID'),
	'SURF'=>array(
		'H_FIXED'=>'SURF HEAT_TRANSFER_COEFFICIENT', 
		'POROUS'=>'NEW PROCEDURE (see the manual)', 
		'VOLUME_FLUX'=>'SURF VOLUME_FLOW'),
	'TIME'=>array(
		'TWFIN'=>'TIME T_END'),
	'VENT'=>array(
		'MASS_FRACTION'=>'ATTRIBUTE IS ELIMINATED (see the manual)')
	/*}}}*/
);

$app_data=array(
	'version'=>'Simo ver. 0.1.1, release date 14.09.2017',
	"editor"=>array(
		array(
			"label"=>"VIM",
			"value"=>"vim"
		),
		array(
			"label"=>"NORMAL",
			"value"=>"normal"
		)
	)

);

$json_string = json_encode(array(
	'meta'=>array(
		'status'=>'info',
		'from'=>'getAmpers',
		'details'=>array("Global values loaded")
	),
	'data'=>array(
		"ampers"=>$fdsEntities,
		"wiz"=>$wizEntities,
		"risk"=>$riskEntities,
		"enums"=>$enums,
		"risk_enums"=>$risk_enums,
		"fds_object_enums"=>$fds_object_enums,
		"app_data"=>$app_data
	)
));
echo $json_string;
die();
?>
