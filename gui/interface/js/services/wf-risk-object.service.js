angular.module('wf-risk-object.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-dialog.service'])
.factory('Risk', ['GlobalValues', 'lodash', 'Validator', '$rootScope', 'Accessor', 'DialogManager', function(Globals, lodash, Validator, $rootScope, Accessor, DialogManager) {
	
	function Risk(base) {

		var def=Globals.values.defaults.risk;
		var accessor=new Accessor();
		var setter=accessor.setter;

		var distributions=lodash.keyBy(Globals.values.risk_enums.distType, function(dist) {
			return dist.value;
		})

		console.log(base);
		if(!base) {
			base={};
			base.building = {type: {}};
			base.materials = {wall:{}, floor:{}, ceiling:{}};
		}
		console.log(base);

		this.general={
			project_name:lodash.get(base, 'general.project_name', def.general.project_name.value),
			set_project_name:function(arg) {
				return setter(this, 'project_name', def.general.project_name, arg);
			},
			simulation_time:lodash.get(base, 'general.simulation_time', def.general.simulation_time.value),
			set_simulation_time:function(arg) {
				return setter(this, 'simulation_time', def.general.simulation_time, arg);
			},
			number_of_simulations:lodash.get(base, 'general.number_of_simulations', def.general.number_of_simulations.value),
			set_number_of_simulations:function(arg) {
				return setter(this, 'number_of_simulations', def.general.number_of_simulations, arg);
			},
			indoor_temp:lodash.get(base, 'general.indoor_temp', def.general.indoor_temp.value),
			set_indoor_temp:function(arg) {
				return setter(this, 'indoor_temp', def.general.indoor_temp, arg);
			},
			elevation:lodash.get(base, 'general.elevation', def.general.elevation.value),
			set_elevation:function(arg) {
				return setter(this, 'elevation', def.general.elevation, arg);
			},
			indoor_pressure:lodash.get(base, 'general.indoor_pressure', def.general.indoor_pressure.value),
			set_indoor_pressure:function(arg) {
				return setter(this, 'indoor_pressure', def.general.indoor_pressure, arg);
			},
			humidity:lodash.get(base, 'general.humidity', def.general.humidity.value),
			set_humidity:function(arg) {
				return setter(this, 'humidity', def.general.humidity, arg);
			}
		};

		this.building={
			type:base['building']['type']||{},
			has_fire_detectors:lodash.get(base, 'building.has_fire_detectors', def.building.has_fire_detectors.value),
			set_has_fire_detectors:function(arg) {
				return setter(this, 'has_fire_detectors', def.building.has_fire_detectors, arg);
			},
			has_sprinklers:lodash.get(base, 'building.has_sprinklers', def.building.has_sprinklers.value),
			set_has_sprinklers:function(arg) {
				return setter(this, 'has_sprinklers', def.building.has_sprinklers, arg);
			},
			has_trained_staff:lodash.get(base, 'building.has_trained_staff', def.building.has_trained_staff.value),
			set_has_trained_staff:function(arg) {
				return setter(this, 'has_trained_staff', def.building.has_trained_staff, arg);
			},
			alarming_type:base['building']['alarming_type']||{},
			has_dso:lodash.get(base, 'building.has_dso', def.building.has_dso.value),
			set_has_dso:function(arg) {
				return setter(this, 'has_dso', def.building.has_dso, arg);
			}

		};

		this.geometry=base['geometry']||{}

		this.sprinklers={
			activation_temp:lodash.get(base, 'sprinklers.activation_temp', def.sprinklers.activation_temp.value),
			set_activation_temp:function(arg) {
				return setter(this, 'activation_temp', def.sprinklers.activation_temp, arg);
			},
			activation_obscuration:lodash.get(base, 'sprinklers.activation_obscuration', def.sprinklers.activation_obscuration.value),
			set_activation_obscuration:function(arg) {
				return setter(this, 'activation_obscuration', def.sprinklers.activation_obscuration, arg);
			},
			spray_density:lodash.get(base, 'sprinklers.spray_density', def.sprinklers.spray_density.value),
			set_spray_density:function(arg) {
				return setter(this, 'spray_density', def.sprinklers.spray_density, arg);
			},
			rti:lodash.get(base, 'sprinklers.rti', def.sprinklers.rti.value),
			set_rti:function(arg) {
				return setter(this, 'rti', def.sprinklers.rti, arg);
			}


		};
		
		this.detectors={
			activation_temp:lodash.get(base, 'detectors.activation_temp', def.detectors.activation_temp.value),
			set_activation_temp:function(arg) {
				return setter(this, 'activation_temp', def.detectors.activation_temp, arg);
			},
			activation_obscuration:lodash.get(base, 'detectors.activation_obscuration', def.detectors.activation_obscuration.value),
			set_activation_obscuration:function(arg) {
				return setter(this, 'activation_obscuration', def.detectors.activation_obscuration, arg);
			},
			rti:lodash.get(base, 'detectors.rti', def.detectors.rti.value),
			set_rti:function(arg) {
				return setter(this, 'rti', def.detectors.rti, arg);
			}
		
		};

		this.materials={
			wall:base['materials']['wall']||{},
			ceiling:base['materials']['ceiling']||{},
			floor:base['materials']['floor']||{},
			thickness_wall:lodash.get(base, 'materials.thickness_wall', def.materials.thickness_wall.value),
			set_thickness_wall:function(arg) {
				return setter(this, 'thickness_wall', def.materials.thickness_wall, arg);
			},
			thickness_ceiling:lodash.get(base, 'materials.thickness_ceiling', def.materials.thickness_ceiling.value),
			set_thickness_ceiling:function(arg) {
				return setter(this, 'thickness_ceiling', def.materials.thickness_ceiling, arg);
			},
			thickness_floor:lodash.get(base, 'materials.thickness_floor', def.materials.thickness_floor.value),
			set_thickness_floor:function(arg) {
				return setter(this, 'thickness_floor', def.materials.thickness_floor, arg);
			}

		};
		this.evacuation={
			number_of_people:lodash.get(base, 'evacuation.number_of_people', def.evacuation.number_of_people.value),
			set_number_of_people:function(arg) {
				return setter(this, 'number_of_people', def.evacuation.number_of_people, arg);
			},
			horizontal_speed:lodash.get(base, 'evacuation.horizontal_speed', def.evacuation.horizontal_speed.value),
			set_horizontal_speed:function(arg) {
				return setter(this, 'horizontal_speed', def.evacuation.horizontal_speed, arg);
			},
			vertical_speed:lodash.get(base, 'evacuation.vertical_speed', def.evacuation.vertical_speed.value),
			set_vertical_speed:function(arg) {
				return setter(this, 'vertical_speed', def.evacuation.vertical_speed, arg);
			}

	
		};
		this.settings={
			window_open:{
				distribution:distributions.custom,
				var1:lodash.get(base, 'settings.window_open.var1', def.window_open.var1.value),
				var2:lodash.get(base, 'settings.window_open.var2', def.window_open.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.window_open.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.window_open.var2, arg);
				}

			},
			plain_door_open:{
				distribution:distributions.binomial,
				var1:lodash.get(base, 'settings.plain_door_open.var1', def.plain_door_open.var1.value),
				var2:lodash.get(base, 'settings.plain_door_open.var2', def.plain_door_open.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.plain_door_open.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.plain_door_open.var2, arg);
				}

			},
			door_with_closer:{
				distribution:distributions.binomial,
				var1:lodash.get(base, 'settings.door_with_closer.var1', def.door_with_closer.var1.value),
				var2:lodash.get(base, 'settings.door_with_closer.var2', def.door_with_closer.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.door_with_closer.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.door_with_closer.var2, arg);
				}

			},
			electric_release_door:{
				distribution:distributions.binomial,
				var1:lodash.get(base, 'settings.electric_release_door.var1', def.electric_release_door.var1.value),
				var2:lodash.get(base, 'settings.electric_release_door.var2', def.electric_release_door.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.electric_release_door.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.electric_release_door.var2, arg);
				}

			},
			origin_of_fire:{
				distribution:distributions.binomial,
				var1:lodash.get(base, 'settings.origin_of_fire.var1', def.origin_of_fire.var1.value),
				var2:lodash.get(base, 'settings.origin_of_fire.var2', def.origin_of_fire.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.origin_of_fire.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.origin_of_fire.var2, arg);
				}

			},
			fire_detectors_trigger_temp:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.fire_detectors_trigger_temp.var1', def.fire_detectors_trigger_temp.var1.value),
				var2:lodash.get(base, 'settings.fire_detectors_trigger_temp.var2', def.fire_detectors_trigger_temp.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_detectors_trigger_temp.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_detectors_trigger_temp.var2, arg);
				}

			},
			fire_detectors_failure:{
				distribution:distributions.binomial,
				var1:lodash.get(base, 'settings.fire_detectors_failure.var1', def.fire_detectors_failure.var1.value),
				var2:lodash.get(base, 'settings.fire_detectors_failure.var2', def.fire_detectors_failure.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_detectors_failure.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_detectors_failure.var2, arg);
				}

			},
			sprinkler_trigger_temp:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.sprinkler_trigger_temp.var1', def.sprinkler_trigger_temp.var1.value),
				var2:lodash.get(base, 'settings.sprinkler_trigger_temp.var2', def.sprinkler_trigger_temp.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.sprinkler_trigger_temp.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.sprinkler_trigger_temp.var2, arg);
				}

			},
			sprinkler_failure:{
				distribution:distributions.binomial,
				var1:lodash.get(base, 'settings.sprinkler_failure.var1', def.sprinkler_failure.var1.value),
				var2:lodash.get(base, 'settings.sprinkler_failure.var2', def.sprinkler_failure.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.sprinkler_failure.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.sprinkler_failure.var2, arg);
				}

			},
			outdoor_temp:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.outdoor_temp.var1', def.outdoor_temp.var1.value),
				var2:lodash.get(base, 'settings.outdoor_temp.var2', def.outdoor_temp.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.outdoor_temp.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.outdoor_temp.var2, arg);
				}

			},
			vertical_speed:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.vertical_speed.var1', def.vertical_speed.var1.value),
				var2:lodash.get(base, 'settings.vertical_speed.var2', def.vertical_speed.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.vertical_speed.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.vertical_speed.var2, arg);
				}

			},
			horizontal_speed:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.horizontal_speed.var1', def.horizontal_speed.var1.value),
				var2:lodash.get(base, 'settings.horizontal_speed.var2', def.horizontal_speed.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.horizontal_speed.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.horizontal_speed.var2, arg);
				}

			},
			alarm_time:{
				distribution:distributions.lognormal,
				var1:lodash.get(base, 'settings.alarm_time.var1', def.alarm_time.var1.value),
				var2:lodash.get(base, 'settings.alarm_time.var2', def.alarm_time.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.alarm_time.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.alarm_time.var2, arg);
				}

			},
			fire_location:{
				distribution:distributions.uniform,
				var1:lodash.get(base, 'settings.fire_location.var1', def.fire_location.var1.value),
				var2:lodash.get(base, 'settings.fire_location.var2', def.fire_location.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_location.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_location.var2, arg);
				}

			},
			fire_hrr:{
				distribution:distributions.uniform,
				var1:lodash.get(base, 'settings.fire_hrr.var1', def.fire_hrr.var1.value),
				var2:lodash.get(base, 'settings.fire_hrr.var2', def.fire_hrr.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_hrr.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_hrr.var2, arg);
				}

			},

			fire_alpha:{
				distribution:distributions.triangular,
				var1:lodash.get(base, 'settings.fire_alpha.var1', def.fire_alpha.var1.value),
				var2:lodash.get(base, 'settings.fire_alpha.var2', def.fire_alpha.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_alpha.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_alpha.var2, arg);
				}

			},
			fire_co:{
				distribution:distributions.uniform,
				var1:lodash.get(base, 'settings.fire_co.var1', def.fire_co.var1.value),
				var2:lodash.get(base, 'settings.fire_co.var2', def.fire_co.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_co.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_co.var2, arg);
				}

			},
			fire_soot:{
				distribution:distributions.uniform,
				var1:lodash.get(base, 'settings.fire_soot.var1', def.fire_soot.var1.value),
				var2:lodash.get(base, 'settings.fire_soot.var2', def.fire_soot.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.fire_soot.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.fire_soot.var2, arg);
				}

			},
			pre_movement:{
				distribution:distributions.lognormal,
				var1:lodash.get(base, 'settings.pre_movement.var1', def.pre_movement.var1.value),
				var2:lodash.get(base, 'settings.pre_movement.var2', def.pre_movement.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.pre_movement.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.pre_movement.var2, arg);
				}

			},
			density_room:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.density_room.var1', def.density_room.var1.value),
				var2:lodash.get(base, 'settings.density_room.var2', def.density_room.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.density_room.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.density_room.var2, arg);
				}

			},
			density_corridor:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.density_corridor.var1', def.density_corridor.var1.value),
				var2:lodash.get(base, 'settings.density_corridor.var2', def.density_corridor.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.density_corridor.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.density_corridor.var2, arg);
				}

			},
			alpha_speed:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.alpha_speed.var1', def.alpha_speed.var1.value),
				var2:lodash.get(base, 'settings.alpha_speed.var2', def.alpha_speed.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.alpha_speed.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.alpha_speed.var2, arg);
				}

			},
			beta_speed:{
				distribution:distributions.normal,
				var1:lodash.get(base, 'settings.beta_speed.var1', def.beta_speed.var1.value),
				var2:lodash.get(base, 'settings.beta_speed.var2', def.beta_speed.var2.value),
				set_var1:function(arg) {
					return setter(this, 'var1', def.beta_speed.var1, arg);
				},
				set_var2:function(arg) {
					return setter(this, 'var2', def.beta_speed.var2, arg);
				}

			}
		};


	}

	return Risk;
}])
.factory('MVent', ['GlobalValues', 'lodash', 'Validator', '$rootScope', 'Accessor', 'DialogManager', function(Globals, lodash, Validator, $rootScope, Accessor, DialogManager) {

	
	function MVent(base) {

		var def=Globals.values.defaults.risk;
		var accessor=new Accessor();
		var setter=accessor.setter;

		if(!base) {
			base={};
		}

		this.id=base.id||"";

		this.setId=accessor.setId;
		
		
		this.flow=lodash.get(base, 'flow', def.mvent.flow.value);
		this.set_flow=function(arg) {
			return setter(this, 'flow', def.mvent.flow, arg);
		}

		this.begin_dropoff_pressure=lodash.get(base, 'begin_dropoff_pressure', def.mvent.begin_dropoff_pressure.value);
		this.set_begin_dropoff_pressure=function(arg) {
			return setter(this, 'begin_dropoff_pressure', def.mvent.begin_dropoff_pressure, arg);
		}

		this.zero_flow_pressure=lodash.get(base, 'zero_flow_pressure', def.mvent.zero_flow_pressure.value);
		this.set_zero_flow_pressure=function(arg) {
			return setter(this, 'zero_flow_pressure', def.mvent.zero_flow_pressure, arg);
		}

		this.initial_opening_fraction=lodash.get(base, 'initial_opening_fraction', def.mvent.initial_opening_fraction.value);
		this.set_initial_opening_fraction=function(arg) {
			return setter(this, 'initial_opening_fraction', def.mvent.initial_opening_fraction, arg);
		}

		this.filter_efficiency=lodash.get(base, 'filter_efficiency', def.mvent.filter_efficiency.value);
		this.set_filter_efficiency=function(arg) {
			return setter(this, 'filter_efficiency', def.mvent.filter_efficiency, arg);
		}



	}

	return MVent;
}])
