<?php
session_name('aamks');
require_once("inc.php"); 
$confnew=json_decode(
'
{
	"basic": {
		"project_id": 1,
		"scenario_id": 1,
		"number_of_simulations": 1,
		"simulation_time": 100,
		"indoor_temperature0": -5,
		"indoor_temperature1":  10,
		"outdoor_temperature0": -5,
		"outoor_temperature1":  10,
		"indoor_pressure": 101325,
		"auto_staircaser": false
        "geometry_type": "office1",
        "material_ceiling": "concrete",
        "ceiling_thickness": "0.3",
        "material_floor": "concrete",
        "floor_thickness": "0.3",
        "material_wall": "brick",
        "wall_thickness": "0.2"
	}, 

	"advanced": {
        "detectors": false,
		"detectors_type": "heat",
		"detectors_trigger_temperature_mean": 68,
		"detectors_trigger_temperature_sd": 5,
		"detectors_trigger_obscuration_mean": 0,
		"detectors_trigger_obscuration_sd": 5,
		"detectors_not_broken_probability": 0.96,

        "sprinklers": false,
		"sprinklers_trigger_temperature_mean": 68,
		"sprinklers_trigger_temperature_sd": 3,
		"sprinklers_not_broken_probability": 0.96,
		"sprinklers_spray_density_mean": 0.0005,
		"sprinklers_spray_density_sd": 0.0001,
		"sprinklers_rti": 50,

        "nshevs": false,
        "nshevs_activation_time": 0,
        "cfast_static_records": [],

		"hrr_pua_min": 300,
		"hrr_pua_mode": 1000,
		"hrr_pua_max": 1300,
		"hrr_alpha_min": 0.0029,
		"hrr_alpha_mode": 0.047,
		"hrr_alpha_max": 0.188,
		"todo",

        "window_open": {
                {
                    "outside_temperature_range": [
                        -99999,
                        -5
                    ],
                    "window_is_quarter_open_probability": 0,
                    "window_is_full_open_probability": 0.11
                },
                {
                    "outside_temperature_range": [
                        -5,
                        15
                    ],
                    "window_is_quarter_open_probability": 0,
                    "window_is_full_open_probability": 0.5
                },
                {
                    "outside_temperature_range": [
                        15,
                        27
                    ],
                    "window_is_quarter_open_probability": 0.45,
                    "window_is_full_open_probability": 0.45
                },
                {
                    "outside_temperature_range": [
                        27,
                        99999
                    ],
                    "window_is_quarter_open_probability": 0,
                    "window_is_full_open_probability": 0.5
                }
            ]
        },
	}
}
'
);

$conf=json_decode('{
    },

    "settings": {
        "door_open": {
            "comment": "desc",
            "electro_magnet_door_is_open_probability": 0.04,
            "door_closer_door_is_open_probability": 0.14,
            "standard_door_is_open_probability": 0.5,
            "vvents_no_failure_probability": 0.96
        },
        "c_const": 8,
        "pre_evacuation_time": {
            "comment": "desc",
            "mean_and_sd_room_of_fire_origin": [
                2.74,
                0.58
            ],
            "mean_and_sd_ordinary_room": [
                5.246,
                0.101
            ]
        },
        "evacuees_concentration": {
            "comment": "desc",
            "COR": 50,
            "STAI": 50,
            "ROOM": 7,
            "HALL": 50
        },
        "evacuees_speed_params": {
            "comment": "desc",
            "max_h_speed_mean_and_sd": [
                120,
                20
            ],
            "max_v_speed_mean_and_sd": [
                80,
                20
            ],
            "beta_v_mean_and_sd": [
                -0.057,
                0.015
            ],
            "alpha_v_mean_and_sd": [
                0.706,
                0.069
            ]
        },
        "origin_of_fire": {
            "comment": "desc",
            "fire_starts_in_room_probability": 0.8
        }
    }
}', 1);
dd2($conf);
/*}}}*/

function form_general() {/*{{{*/
}
/*}}}*/
function form_characteristics() {/*{{{*/
}
/*}}}*/
function form_infrastructure() {/*{{{*/
}
/*}}}*/
function main() {/*{{{*/
}
/*}}}*/
main();

?>
