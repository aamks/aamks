angular.module('wf-fds-object.service', ['ngLodash', 'wf-globals.service', 'wf-accessor.service', 'wf-calc.service'])
/*{{{ Fds */
.factory('Fds', ['GlobalValues', 'lodash', 'Validator', 'Mesh', 'Open', 'Matl', 'Surf', 'Obst', 'Ramp', 'Specie', 'SurfSpecie', 'VentSpecie', 'Part', 'Vent', 'SurfVent', 'Jetfan', 'Fire', 'Prop', 'Devc', 'Ctrl', 'Bndf', 'Isof', 'Slcf', 'Hole', 'Fuel','Combustion', 'Accessor', 'DialogManager', 'Calc', function(Globals, lodash, Validator, Mesh, Open, Matl, Surf, Obst, Ramp, Specie, SurfSpecie, VentSpecie, Part, Vent, SurfVent, Jetfan, Fire, Prop, Devc, Ctrl,Bndf, Isof, Slcf, Hole, Fuel, Combustion, Accessor, DialogManager, Calc) {

	
	function Fds(base) {

		var def=Globals.values.defaults.ampers;
		var defWiz=Globals.values.defaults.wiz;
		var defSpec=Globals.values.fds_object_enums.species;

		var bndfInit=function() {
			var bndfs=lodash.map(Globals.values.enums.bndfQuantity, function(value) { 
				var base={quantity:value.quantity, marked:false, spec:value.spec, part:value.part, label:value.label};
				return new Bndf(base);
			}); 
			return bndfs;
		}

		var accessor=new Accessor();
		var setter=accessor.setter;


		if(!base) {
			base={};
		}

		var self=this;

		this.general={
			head: {
				title:lodash.get(base, 'general.head.title', def.head.title.value),
				set_title:function(arg) {
					return setter(this, 'title', def.head.title, arg);
				},
				chid:lodash.get(base, 'general.head.chid', def.head.chid.value),
				set_chid:function(arg) {
					return setter(this, 'chid', def.head.chid, arg);
				}
			},
			time: {
				t_begin:accessor.toReal(lodash.get(base, 'general.time.t_begin', def.time.t_begin.value)),
				set_t_begin:function(arg) {
					//return setter(this, 't_begin', def.time.t_begin, arg);
					return accessor.calcSetter(self, 'general.time.t_begin', def.time.t_begin, Calc.timeBegin, {
						t_begin: {obj:self, path:'general.time.t_begin', value: Validator.normalizeReal(arg)*1},
						t_end: {obj:self, path:'general.time.t_end', value:self.general.time.t_end},
						t_begin_old: {obj:self, path:'general.time.t_begin', value:self.general.time.t_begin}
					} , arg);
				},
				t_end:accessor.toReal(lodash.get(base, 'general.time.t_end', def.time.t_end.value)),
				set_t_end:function(arg) {
					return setter(this, 't_end', def.time.t_end, arg);
				},
				//dt:accessor.toReal(lodash.get(base, 'general.time.dt', def.time.dt.value)),
				//set_dt:function(arg){
				//	return setter(this, 'dt', def.time.dt, arg);
				//},
				//lock_time_step:accessor.toBool(lodash.get(base, 'general.time.lock_time_step', def.time.lock_time_step.value)),
				//restrict_time_step:accessor.toBool(lodash.get(base, 'general.time.restrict_time_step', def.time.restrict_time_step.value))
			},
			misc: {
				tmpa:accessor.toReal(lodash.get(base, 'general.misc.tmpa', def.misc.tmpa.value)),
				set_tmpa:function(arg){
					return setter(this, 'tmpa', def.misc.tmpa, arg);
				},
				p_inf:accessor.toReal(lodash.get(base, 'general.misc.p_inf', def.misc.p_inf.value)),
				set_p_inf:function(arg){
					return setter(this, 'p_inf', def.misc.p_inf, arg);
				},
				humidity:accessor.toReal(lodash.get(base, 'general.misc.humidity', def.misc.humidity.value)),
				set_humidity:function(arg){
					return setter(this, 'humidity', def.misc.humidity, arg);
				},
				gvec_x:accessor.toReal(lodash.get(base, 'general.misc.gvec_x', def.misc.gvec.value[0])),
				set_gvec_x:function(arg){
					return setter(this, 'gvec_x', def.misc.gvec, arg);
				},
				gvec_y:accessor.toReal(lodash.get(base, 'general.misc.gvec_y', def.misc.gvec.value[1])),
				set_gvec_y:function(arg){
					return setter(this, 'gvec_y', def.misc.gvec, arg);
				},

				gvec_z:accessor.toReal(lodash.get(base, 'general.misc.gvec_z', def.misc.gvec.value[2])),
				set_gvec_z:function(arg){
					return setter(this, 'gvec_z', def.misc.gvec, arg);
				},
				restart:accessor.toBool(lodash.get(base, 'general.misc.restart', def.misc.restart.value)),
				dns:accessor.toBool(lodash.get(base, 'general.misc.dns', def.misc.dns.value)),
				overwrite:accessor.toBool(lodash.get(base, 'general.misc.overwrite', def.misc.overwrite.value)),
				noise:accessor.toBool(lodash.get(base, 'general.misc.noise', def.misc.noise.value)),
				noise_velocity:accessor.toReal(lodash.get(base, 'general.misc.noise_velocity', def.misc.noise_velocity.value)),
				set_noise_velocity:function(arg){
					return setter(this, 'noise_velocity', def.misc.noise_velocity, arg);
				}

			},
			init: {

			}
		}

		this.ramps={
			ramps:(lodash.get(base, 'ramps.ramps')===undefined ? []: lodash.map(base.ramps.ramps, function(ramp) {
				return new Ramp(ramp);	
			}))
		}

		var self=this;
		
		this.species={
			species:(lodash.get(base, 'species.species')===undefined ? [] : lodash.map(base.species.species, function(specie) {
				return new Specie(specie);	
			}))
		}
		this.species.surfs=(lodash.get(base, 'species.surfs')===undefined ? []: lodash.map(base.species.surfs, function(surf) {
			return new SurfSpecie(surf, self.ramps.ramps, self.species.species);	
		}));
		this.species.vents=(lodash.get(base, 'species.vents')===undefined ? []: lodash.map(base.species.vents, function(vent) {
			return new VentSpecie(vent, self.species.surfs);	
		}));

		this.parts={
			parts:(lodash.get(base, 'parts.parts')===undefined ? []: lodash.map(base.parts.parts, function(part) {
				return new Part(part);	
			}))
		}

		this.geometry={
			meshes:(lodash.get(base, 'geometry.meshes')===undefined ? []: lodash.map(base.geometry.meshes, function(mesh) {
				return new Mesh(mesh);	
			})),
			opens:(lodash.get(base, 'geometry.opens')===undefined ? []: lodash.map(base.geometry.opens, function(open) {
				return new Open(open);	
			})),
			matls:(lodash.get(base, 'geometry.matls')===undefined ? []: lodash.map(base.geometry.matls, function(matl) {
				return new Matl(matl, self.ramps.ramps);
			})),
			holes:(lodash.get(base, 'geometry.holes')===undefined ? []: lodash.map(base.geometry.holes, function(hole) {
				return new Hole(hole);	
			}))

		}

		this.geometry.surfs=(lodash.get(base, 'geometry.surfs')===undefined ? [new Surf({id:"inert", editable:false})]: lodash.map(base.geometry.surfs, function(surf) {
			return new Surf(surf, self.geometry.matls);
		}));

		
		this.ventilation={
			surfs:(lodash.get(base, 'ventilation.surfs')===undefined ? []: lodash.map(base.ventilation.surfs, function(surf) {
				return new SurfVent(surf, self.ramps.ramps);	
			})),
			jetfans:(lodash.get(base, 'ventilation.jetfans')===undefined ? []: lodash.map(base.ventilation.jetfans, function(jetfan) {
				return new Jetfan(jetfan, self.ramps.ramps);	
			}))
		}

		this.ventilation.vents=(lodash.get(base, 'ventilation.vents')===undefined ? []: lodash.map(base.ventilation.vents, function(vent) {
				return new Vent(vent, self.ventilation.surfs);	
		}));

		this.output={
			general:{
				nframes:accessor.toReal(lodash.get(base, 'output.general.nframes', def.dump.nframes.value)),
				set_nframes:function(arg){
					return setter(this, 'nframes', def.dump.nframes, arg);
				},
				dt_restart:accessor.toReal(lodash.get(base, 'output.general.dt_restart', def.dump.dt_restart.value)),
				set_dt_restart:function(arg){
					return setter(this, 'dt_restart', def.dump.dt_restart, arg);
				},
				dt_pl3d:accessor.toReal(lodash.get(base, 'output.general.dt_pl3d', def.dump.dt_pl3d.value)),
				set_dt_pl3d:function(arg){
					return setter(this, 'dt_pl3d', def.dump.dt_pl3d, arg);
				},
				mass_file:accessor.toBool(lodash.get(base, 'output.general.mass_file', def.dump.mass_file.value)),
				smoke3d:accessor.toBool(lodash.get(base, 'output.general.smoke3d', def.dump.smoke3d.value)),
				status_files:accessor.toBool(lodash.get(base, 'output.general.status_files', def.dump.status_files.value)),
				plot3d_quantities:(lodash.get(base, 'output.general.plot3d_quantities')===undefined ? [] : lodash.map(base.output.general.plot3d_quantities, function(quantity) {
					return quantity;
				})),
			},
			bndfs:(lodash.get(base, 'output.bndfs')===undefined ? bndfInit(): lodash.map(base.output.bndfs, function(bndf) {
				get_label=lodash.find(Globals.values.enums.bndfQuantity, {'quantity':bndf.quantity}); 
				bndf.label=get_label.label;
				return new Bndf(bndf, self.species.species, self.parts.parts);
			})),
			slcfs:(lodash.get(base, 'output.slcfs')===undefined ? []: lodash.map(base.output.slcfs, function(slcf) {
				return new Slcf(slcf, self.species.species, self.parts.parts);	
			})),
			isofs:(lodash.get(base, 'output.isofs')===undefined ? []: lodash.map(base.output.isofs, function(isof) {
				return new Isof(isof, self.species.species, self.parts.parts);	
			})),
			props:(lodash.get(base, 'output.props')===undefined ? []: lodash.map(base.output.props, function(prop) {
				return new Prop(prop, self.ramps.ramps, self.parts.parts);	
			})),
			ctrls:(lodash.get(base, 'output.ctrls')===undefined ? []: lodash.map(base.output.ctrls, function(ctrl) {
				return new Ctrl(ctrl);	
			}))
		}

		this.output.devcs=(lodash.get(base, 'output.devcs')===undefined ? []: lodash.map(base.output.devcs, function(devc) {
			return new Devc(devc, self.output.props, self.species.species, self.parts.parts);	
		}));

		this.geometry.obsts=(lodash.get(base, 'geometry.obsts')===undefined ? []: lodash.map(base.geometry.obsts, function(obst) {
			return new Obst(obst, self.geometry.surfs, self.output.devcs);	
		}));
		
		this.fires={
			fires:(lodash.get(base, 'fires.fires')===undefined ? []: lodash.map(base.fires.fires, function(fire) {
				return new Fire(fire, self.ramps.ramps);	
			})),
			/*
			fuels:(lodash.get(base, 'fires.fuels')===undefined ? []: lodash.map(base.fires.fuels, function(fuel) {
				return new Fuel(fuel);	
			})),
			combustion:(lodash.get(base, 'fires.combustion')===undefined ? new Combustion({}, self.species.species) : lodash.map(base.fires.combustion, function(combustion) {
				return new Combustion(combustion, self.species.species);
			})),
			*/
			combustion:(lodash.get(base, 'fires.combustion')===undefined ? new Combustion({}, self.species.species) : new Combustion(base.fires.combustion, self.species.species)),
			radiation:{
				radiation:accessor.toBool(lodash.get(base, 'fires.radiation.radiation', def.radi.radiation.value)),
				number_radiation_angles:accessor.toReal(lodash.get(base, 'fires.radiation.number_radiation_angles', def.radi.number_radiation_angles.value)),
				set_number_radiation_angles:function(arg){
					return setter(this, 'number_radiation_angles', def.radi.number_radiation_angles, arg);
				},
				time_step_increment:accessor.toReal(lodash.get(base, 'fires.radiation.time_step_increment', def.radi.time_step_increment.value)),
				set_time_step_increment:function(arg){
					return setter(this, 'time_step_increment', def.radi.time_step_increment, arg);
				}

			}
		}

		this.removers={
			ramp_prompt:function(index) {
				var ramp=self.ramps.ramps[index];

				var matls=lodash.filter(self.geometry.matls, function(matl) {
					return (ramp.id==matl['conductivity_ramp'].id || ramp.id==matl['specific_heat_ramp'].id)
				})

				var ventsurfs=lodash.filter(self.ventilation.surfs, function(surf) {
					return ramp.id==surf['ramp'].id;
				})

				var fires=lodash.filter(self.fires.fires, function(fire) {
					return ramp.id==lodash.get(fire, "surf.ramp.id", undefined)
				})

				var props=lodash.filter(self.output.props, function(prop) {
					return ramp.id==lodash.get(prop, "pressure_ramp.id", undefined)
				})

				elements={
					matls:matls,
					ventsurfs:ventsurfs,
					fires:fires,
					props:props

				}

				return elements;
			},
			ramp_remove:function(index) {
				var ramp=self.ramps.ramps[index];

				var matls=lodash.filter(self.geometry.matls, function(matl) {
					return (ramp.id==matl['conductivity_ramp'].id || ramp.id==matl['specific_heat_ramp'].id)
				})

				var ventsurfs=lodash.filter(self.ventilation.surfs, function(surf) {
					return ramp.id==surf['ramp'].id;
				})

				var fires=lodash.filter(self.fires.fires, function(fire) {
					return ramp.id==lodash.get(fire, "surf.ramp.id", undefined)
				})

				var props=lodash.filter(self.output.props, function(prop) {
					return ramp.id==lodash.get(prop, "pressure_ramp.id", undefined)
				})
				
				lodash.each(matls, function(matl) {
					if(ramp===matl['conductivity_ramp']) {
						matl['conductivity_ramp']={};
					}
					if(ramp===matl['specific_heat_ramp']) {
						
						matl['specific_heat_ramp']={};
					}

				})

				lodash.each(ventsurfs, function(surf) {
					surf.ramp={};
				})
		
				lodash.each(fires, function(fire) {
					fire.surf.ramp={};
				})

				lodash.each(props, function(prop) {
					prop.pressure_ramp={};
				})


			},
			matl_prompt:function(index) {
				var matl=self.geometry.matls[index];
				var surfs=lodash.filter(self.geometry.surfs, function(surf) {
					var res;
					res=lodash.find(surf.layers, function(layer) {
						return lodash.find(layer.materials, function(material) {
							return matl.id==lodash.get(material, "material.id", undefined)		
						})
					})
					if(res) {
						return true
					} else {
						return false
					}
	
				})


				elements={
					surfs:surfs
				}

				return elements;
			},
			matl_remove:function(index) {
				var matl=self.geometry.matls[index];
				lodash.each(self.geometry.surfs, function(surf) {
				
					lodash.each(surf.layers, function(layer) {
						lodash.remove(layer.materials, function(material) {
							return matl.id==lodash.get(material, "material.id", undefined);
						})
					})
				})
					
			},
			surf_prompt:function(index) {
				var surf=self.geometry.surfs[index];
				var obsts=lodash.filter(self.geometry.obsts, function(obst) {
					if(obst.surf.type=='surf_id') {
						return lodash.get(obst, 'surf.surf_id.id', undefined)==surf.id;	
					} else if(obst.surf.type=='surf_ids') {
						return ( lodash.get(obst, 'surf.surf_idx.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_idy.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_idz.id', undefined)==surf.id );
					} else if(obst.surf.type=='surf_id6') {

						return (lodash.get(obst, 'surf.surf_id1.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_id2.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_id3.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_id4.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_id5.id', undefined)==surf.id ||  lodash.get(obst, 'surf.surf_i6x.id', undefined)==surf.id);
					}
				})


				elements={
					obsts:obsts
				}
			

				return elements;
			},
			surf_remove:function(index) {
				var surf=self.geometry.surfs[index];
				lodash.each(self.geometry.obsts, function(obst) {
					if(obst.surf.type=='surf_id') {
						if(lodash.get(obst, 'surf.surf_id.id', undefined)==surf.id) {
							obst.surf.surf_id=self.geometry.surfs[0]||{};
						}	
					} else if(obst.surf.type=='surf_ids') {
						if(lodash.get(obst, 'surf.surf_idx.id', undefined)==surf.id) {
							obst.surf.surf_idx=self.geometry.surfs[0]||{};

						}
						if(lodash.get(obst, 'surf.surf_idy.id', undefined)==surf.id) {
						  
							obst.surf.surf_idy=self.geometry.surfs[0]||{};

						}	
						if(lodash.get(obst, 'surf.surf_idz.id', undefined)==surf.id) {

							obst.surf.surf_idz=self.geometry.surfs[0]||{};

						}
					} else if(obst.surf.type=='surf_id6') {
						if(lodash.get(obst, 'surf.surf_id1.id', undefined)==surf.id) {
							obst.surf.surf_id1=self.geometry.surfs[0]||{};

						}
						if(lodash.get(obst, 'surf.surf_id2.id', undefined)==surf.id) {
							obst.surf.surf_id2=self.geometry.surfs[0]||{};

						}
						if(lodash.get(obst, 'surf.surf_id3.id', undefined)==surf.id) {
							obst.surf.surf_id3=self.geometry.surfs[0]||{};

						}
						if(lodash.get(obst, 'surf.surf_id4.id', undefined)==surf.id) {
							obst.surf.surf_id4=self.geometry.surfs[0]||{};

						}
						if(lodash.get(obst, 'surf.surf_id5.id', undefined)==surf.id) {
							obst.surf.surf_id5=self.geometry.surfs[0]||{};

						}
						if(lodash.get(obst, 'surf.surf_id6.id', undefined)==surf.id) {
							obst.surf.surf_id6=self.geometry.surfs[0]||{};

						}

					}
				})

			},
			surfvent_prompt:function(index) {
				var surf=self.ventilation.surfs[index];
				var vents=lodash.filter(self.ventilation.vents, function(vent) {
					return surf.id==lodash.get(vent, "surf.surf_id.id", undefined);
				})

				elements={
					vents:vents
				}
			

				return elements;
			},
			surfvent_remove:function(index) {
				var surf=self.ventilation.surfs[index];
				var vents=lodash.filter(self.ventilation.vents, function(vent) {
					return surf.id==lodash.get(vent, "surf.surf_id.id", undefined);

				})

				lodash.each(vents, function(vent) {
					vent.surf.surf_id={};
				})


			},
			spec_prompt:function(index) {
				
				var specie=self.species.species[index];
				var bndfs=lodash.filter(self.output.bndfs, function(bndf) {

					if(bndf.specs && bndf.specs.length>0 && lodash.some(bndf.specs, function(spec) {
						return spec.spec.id==specie.id;	
					})) {
						return true;	
					} else {
						return false;
					}	
				})

				var slcfs=lodash.filter(self.output.slcfs, function(slcf) {
					if(slcf.quantities && slcf.quantities.length>0 && lodash.some(slcf.quantities, function(quantity) {
						if(quantity.specs && quantity.specs.length>0 && lodash.some(quantity.specs, function(spec) {
							
							return spec.spec.id==specie.id;	
						})) {
							return true;
						} else {
							return false;
						}
					})) {
						return true;	
					} else {
						return false;
					}	
				})

				var isofs=lodash.filter(self.output.isofs, function(isof) {

						return isof.spec_id && isof.spec_id.id==specie.id;	
				})

				var devcs=lodash.filter(self.output.devcs, function(devc) {

						return devc.spec_id && devc.spec_id.id==specie.id;	
				})

				
				elements={
					bndfs:bndfs,
					slcfs:slcfs,
					isofs:isofs,
					devcs:devcs
				}

				return elements;
			
			},
			spec_remove:function(index) {
				var specie=self.species.species[index];
				
				lodash.each(self.output.bndfs, function(bndf) {

					if(bndf.specs && bndf.specs.length>0) {
						lodash.remove(bndf.specs, function(spec) {
							return spec.spec.id==specie.id;	
						})
					}
				})

				lodash.each(self.output.slcfs, function(slcf) {
					if(slcf.quantities && slcf.quantities.length>0) {
					   	lodash.each(slcf.quantities, function(quantity) {
							if(quantity.specs && quantity.specs.length>0) {
								lodash.remove(quantity.specs, function(spec) {
									return spec.spec.id==specie.id;	
								})
							}
						})
					}
				})

				var isofs=lodash.filter(self.output.isofs, function(isof) {

						return isof.spec_id && isof.spec_id.id==specie.id;	
				})

				var devcs=lodash.filter(self.output.devcs, function(devc) {

						return devc.spec_id && devc.spec_id.id==specie.id;	
				})

				
				lodash.each(isofs, function(isof) {
					isof.spec_id={};
				})

				lodash.each(devcs, function(devc) {
					devc.spec_id={};
				})



			},
			part_prompt:function(index) {
				
				var particle=self.parts.parts[index];
				var bndfs=lodash.filter(self.output.bndfs, function(bndf) {

					if(bndf.parts && bndf.parts.length>0 && lodash.some(bndf.parts, function(part) {
						return part.part.id==particle.id;	
					})) {
						return true;	
					} else {
						return false;
					}	
				})

				var slcfs=lodash.filter(self.output.slcfs, function(slcf) {
					if(slcf.quantities && slcf.quantities.length>0 && lodash.some(slcf.quantities, function(quantity) {
						if(quantity.parts && quantity.parts.length>0 && lodash.some(quantity.parts, function(part) {
							
							return part.part.id==particle.id;	
						})) {
							return true;
						} else {
							return false;
						}
					})) {
						return true;	
					} else {
						return false;
					}	
				})

		
				var devcs=lodash.filter(self.output.devcs, function(devc) {

						return devc.part_id && devc.part_id.id==particle.id;	
				})
	
				var props=lodash.filter(self.output.props, function(prop) {

						return prop.part_id && prop.part_id.id==particle.id;	
				})

				
				elements={
					bndfs:bndfs,
					slcfs:slcfs,
					devcs:devcs,
					props:props
				}

				return elements;
			
			},
			part_remove:function(index) {
				var particle=self.parts.parts[index];
				
				lodash.each(self.output.bndfs, function(bndf) {

					if(bndf.parts && bndf.parts.length>0) {
						lodash.remove(bndf.parts, function(part) {
							return part.part.id==particle.id;	
						})
					}
				})

				lodash.each(self.output.slcfs, function(slcf) {
					if(slcf.quantities && slcf.quantities.length>0) {
					   	lodash.each(slcf.quantities, function(quantity) {
							if(quantity.parts && quantity.parts.length>0) {
								lodash.remove(quantity.parts, function(part) {
									return part.part.id==particle.id;	
								})
							}
						})
					}
				})

	
				var devcs=lodash.filter(self.output.devcs, function(devc) {
					return devc.part_id && devc.part_id.id==particle.id;	
				})

				var props=lodash.filter(self.output.props, function(prop) {
					return prop.part_id && prop.part_id.id==particle.id;	
				})
				

				lodash.each(devcs, function(devc) {
					devc.part_id={};
				})

				lodash.each(props, function(prop) {
					prop.part_id={};
				})

			},
			fire_prompt:function(index) {
				var fire=self.fires.fires[index];
				//var groups=lodash.filter(self.fires.groups, function(group) {
				//	if(group.fires && group.fires.length>0 && lodash.some(group.fires, function(element) {
				//		return element.fire.id==fire.id;	
				//	})) {
				//		return true;	
				//	} else {
				//		return false;
				//	}	
				//})

				//elements={
				//	groups:groups
				//}
			

				return elements;
			},
			fire_remove:function(index) {

				var fire=self.fires.fires[index];
				//lodash.each(self.fires.groups, function(group) {
				//	if(group.fires && group.fires.length>0) {
				//	 	lodash.remove(group.fires, function(element) {
				//			return element.fire.id==fire.id;	
				//		})
  
				//	}
				//})
			}

		}

		this.importers={
			ramp:function(ramp) {

			}
		};

		this.exporters={
			ramp:function() {

			}
		};

		this.serialize=function() {
			var replacer=function(key, value) {
				/*
				if(typeof(value)==='boolean') {
					return value.toString();
				}
				if(typeof(value)==='number') {
					return value.toString();
				}
				*/
				return value;

			}
			var scenarioString="";
			scenarioString=JSON.stringify(this, replacer, '\t');	

			return scenarioString;			
		}
	}

	return Fds;
}])
/*}}}  */
/*{{{ Mesh */
.factory('Mesh', ['GlobalValues', 'lodash', 'Accessor', 'IdGenerator', 'Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
	
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Mesh(base) {

		var accessor=new Accessor();

		if(!base) {
			base={};
		}
		
		var self=this;

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';
	
		this.setId=accessor.setId;
		this.changeId=function() {
			
		}	
		this.isize=accessor.toReal(base['isize'] || defWiz.mesh.size.value[0]);
		this.set_isize=function(arg){
			//return accessor.setter(this, 'isize', defWiz.mesh.size, arg);
			return accessor.calcSetter(self, 'isize', defWiz.mesh.size, Calc.meshSize, {
				dim1: {obj:self, path:'xb.x1', value:self.xb.x1},
				dim2: {obj:self, path:'xb.x2', value:self.xb.x2},
				size_old: {obj:self, path:'isize', value:self.isize},
				size: {obj:self, path:'isize', value:  Validator.normalizeReal(arg)*1},
				number: {obj:self, path:'i', value:self.i}
			} , arg);

		}

		this.jsize=accessor.toReal(base['jsize'] || defWiz.mesh.size.value[1]);
		this.set_jsize=function(arg){
			//return accessor.setter(this, 'jsize', defWiz.mesh.size, arg);
			return accessor.calcSetter(self, 'jsize', defWiz.mesh.size, Calc.meshSize, {
				dim1: {obj:self, path:'xb.y1', value:self.xb.y1},
				dim2: {obj:self, path:'xb.y2', value:self.xb.y2},
				size_old: {obj:self, path:'jsize', value:self.jsize},
				size: {obj:self, path:'jsize', value:  Validator.normalizeReal(arg)*1},
				number: {obj:self, path:'j', value:self.j}
			} , arg);

		}

		this.ksize=accessor.toReal(base['ksize'] || defWiz.mesh.size.value[2]);
		this.set_ksize=function(arg){
			//return accessor.setter(this, 'ksize', defWiz.mesh.size, arg);
			return accessor.calcSetter(self, 'ksize', defWiz.mesh.size, Calc.meshSize, {
				dim1: {obj:self, path:'xb.z1', value: self.xb.z1},
				dim2: {obj:self, path:'xb.z2', value:self.xb.z2},
				size_old: {obj:self, path:'ksize', value:self.ksize},
				size: {obj:self, path:'ksize', value:  Validator.normalizeReal(arg)*1},
				number: {obj:self, path:'k', value:self.k}
			} , arg);

		}

		this.xb={
			x1:accessor.toReal(lodash.get(base, 'xb.x1', def.mesh.xb.value[0])),
			x2:accessor.toReal(lodash.get(base, 'xb.x2', def.mesh.xb.value[1])),
			y1:accessor.toReal(lodash.get(base, 'xb.y1', def.mesh.xb.value[2])),
			y2:accessor.toReal(lodash.get(base, 'xb.y2', def.mesh.xb.value[3])),
			z1:accessor.toReal(lodash.get(base, 'xb.z1', def.mesh.xb.value[4])),
			z2:accessor.toReal(lodash.get(base, 'xb.z2', def.mesh.xb.value[5])),
	
		};

		this.set_x1=function(arg){
			//return accessor.setter(this, 'xb.x1', def.mesh.xb, arg);
			return accessor.calcSetter(self, 'xb.x1', def.mesh.xb, Calc.meshXB1, {
				dim1: {obj:self, path:'xb.x1', value: Validator.normalizeReal(arg)*1},
				dim1_old: {obj:self, path:'xb.x1', value: self.xb.x1},
				dim2: {obj:self, path:'xb.x2', value:self.xb.x2},
				size: {obj:self, path:'isize', value:self.isize},
				number: {obj:self, path:'i', value:self.i}
			} , arg);

		};
		this.set_x2=function(arg){
		//	return accessor.setter(this, 'xb.x2', def.mesh.xb, arg);
			return accessor.calcSetter(self, 'xb.x2', def.mesh.xb, Calc.meshXB2, {
				dim2: {obj:self, path:'xb.x2', value: Validator.normalizeReal(arg)*1},
				dim2_old: {obj:self, path:'xb.x2', value: self.xb.x2},
				dim1: {obj:self, path:'xb.x1', value:self.xb.x1},
				size: {obj:self, path:'isize', value:self.isize},
				number: {obj:self, path:'i', value:self.i}
			} , arg);

		};
		this.set_y1=function(arg){
			//return accessor.setter(this, 'xb.y1', def.mesh.xb, arg);
			return accessor.calcSetter(self, 'xb.y1', def.mesh.xb, Calc.meshXB1, {
				dim1: {obj:self, path:'xb.y1', value: Validator.normalizeReal(arg)*1},
				dim1_old: {obj:self, path:'xb.y1', value: self.xb.y1},
				dim2: {obj:self, path:'xb.y2', value:self.xb.y2},
				size: {obj:self, path:'jsize', value:self.jsize},
				number: {obj:self, path:'j', value:self.j}
			} , arg);

		};
		this.set_y2=function(arg){
		//	return accessor.setter(this, 'xb.y2', def.mesh.xb, arg);
			return accessor.calcSetter(self, 'xb.y2', def.mesh.xb, Calc.meshXB2, {
				dim2: {obj:self, path:'xb.y2', value: Validator.normalizeReal(arg)*1},
				dim2_old: {obj:self, path:'xb.y2', value: self.xb.y2},
				dim1: {obj:self, path:'xb.y1', value:self.xb.y1},
				size: {obj:self, path:'jsize', value:self.jsize},
				number: {obj:self, path:'j', value:self.j}
			} , arg);

		};
		this.set_z1=function(arg){
			//return accessor.setter(this, 'xb.z1', def.mesh.xb, arg);
			return accessor.calcSetter(self, 'xb.z1', def.mesh.xb, Calc.meshXB1, {
				dim1: {obj:self, path:'xb.z1', value: Validator.normalizeReal(arg)*1},
				dim1_old: {obj:self, path:'xb.z1', value: self.xb.z1},
				dim2: {obj:self, path:'xb.z2', value:self.xb.z2},
				size: {obj:self, path:'ksize', value:self.ksize},
				number: {obj:self, path:'k', value:self.k}
			} , arg);

		};
		this.set_z2=function(arg){
			//return accessor.setter(this, 'xb.z2', def.mesh.xb, arg);
			return accessor.calcSetter(self, 'xb.z2', def.mesh.xb, Calc.meshXB2, {
				dim2: {obj:self, path:'xb.z2', value: Validator.normalizeReal(arg)*1},
				dim2_old: {obj:self, path:'xb.z2', value: self.xb.z2},
				dim1: {obj:self, path:'xb.z1', value:self.xb.z1},
				size: {obj:self, path:'ksize', value:self.ksize},
				number: {obj:self, path:'k', value:self.k}
			} , arg);

		};

		if(!base['i'] && base['xb'] && base['isize'])
			this.i=accessor.toInt((base['xb']['x2'] - base['xb']['x1']) / base['isize']);
		else
			this.i=accessor.toInt(base['i'] || def.mesh.ijk.value[0]);

		this.set_i=function(arg){
			//return accessor.setter(this, 'i', def.mesh.ijk, arg);
			return accessor.calcSetter(self, 'i', def.mesh.ijk, Calc.meshNumber, {
				dim1: {obj:self, path:'xb.x1', value: self.xb.x1},
				dim2: {obj:self, path:'xb.x2', value:self.xb.x2},
				size: {obj:self, path:'isize', value:self.isize},
				number: {obj:self, path:'i', value: Validator.normalizeReal(arg)*1},
				number_old: {obj:self, path:'i', value:self.i}
			} , arg);
		}

		if(!base['j'] && base['xb'] && base['jsize'])
			this.j=accessor.toInt((base['xb']['y2'] - base['xb']['y1']) / base['jsize']);
		else
			this.j=accessor.toInt(base['j'] || def.mesh.ijk.value[1]);

		this.set_j=function(arg){
			//return accessor.setter(this, 'j', def.mesh.ijk, arg);
			return accessor.calcSetter(self, 'j', def.mesh.ijk, Calc.meshNumber, {
				dim1: {obj:self, path:'xb.y1', value: self.xb.y1},
				dim2: {obj:self, path:'xb.y2', value:self.xb.y2},
				size: {obj:self, path:'jsize', value:self.jsize},
				number: {obj:self, path:'j', value: Validator.normalizeReal(arg)*1},
				number_old: {obj:self, path:'j', value:self.j}
			} , arg);
		}

		if(!base['k'] && base['xb'] && base['ksize'])
			this.k=accessor.toInt((base['xb']['z2'] - base['xb']['z1']) / base['ksize']);
		else
			this.k=accessor.toInt(base['k'] || def.mesh.ijk.value[2]);

		this.set_k=function(arg){
		//	return accessor.setter(this, 'k', def.mesh.ijk, arg);
			return accessor.calcSetter(self, 'k', def.mesh.ijk, Calc.meshNumber, {
				dim1: {obj:self, path:'xb.z1', value: self.xb.z1},
				dim2: {obj:self, path:'xb.z2', value:self.xb.z2},
				size: {obj:self, path:'ksize', value:self.ksize},
				number: {obj:self, path:'k', value: Validator.normalizeReal(arg)*1},
				number_old: {obj:self, path:'k', value:self.k}
			} , arg);
		}

		this.toJSON=function(arg) {
			var mesh={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				i:this.i,
				j:this.j,
				k:this.k,
				isize:this.isize,
				jsize:this.jsize,
				ksize:this.ksize,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				}
			}
			return mesh; 
		}
	}

	return Mesh;
}])
/* }}} */
/*{{{ Open */
.factory('Open', ['GlobalValues', 'lodash', 'Accessor','IdGenerator' , function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Open(base) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.setId=accessor.setId;

		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';
		//this.elevation=accessor.toReal(lodash.get(base, 'elevation', defWiz.vent.elevation.value));
		//this.set_elevation=function(arg){
		//	return accessor.setter(this, 'elevation', defWiz.vent.elevation, arg);
		//}
		//

		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.vent.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.setter(this, 'xb.x1', def.vent.xb, arg);
		}
		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.vent.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.setter(this, 'xb.x2', def.vent.xb, arg);
		}
		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.vent.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.setter(this, 'xb.y1', def.vent.xb, arg);
		}
		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.vent.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.setter(this, 'xb.y2', def.vent.xb, arg);
		}
		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.vent.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.setter(this, 'xb.z1', def.vent.xb, arg);
		}
		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.vent.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.setter(this, 'xb.z2', def.vent.xb, arg);
		}

		this.surf_id='OPEN';


		this.toJSON=function(arg) {
			var open={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				surf_id:this.surf_id,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				}
			}
			return open; 
		}


	}

	return Open;
}])
/*}}} */
/*{{{ Matl */
.factory('Matl', ['GlobalValues', 'lodash','Accessor', 'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator)  {
	
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;


	function Matl(base, ramps) {

		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id'] || '';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		
		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.density=accessor.toReal(base['density'] || def.matl.density.value);
		this.set_density=function(arg){
			return accessor.setter(this, 'density', def.matl.density, arg);
		}
		this.set_density_lib=function(arg){
			return accessor.setterLib(this, 'density', def.matl.density, arg);
		}

		this.conductivity=accessor.toReal(base['conductivity'] || def.matl.conductivity.value);
		this.set_conductivity=function(arg){
			return accessor.setter(this, 'conductivity', def.matl.conductivity, arg);
		}

		this.set_conductivity_lib=function(arg){
			return accessor.setterLib(this, 'conductivity', def.matl.conductivity, arg);
		}
	
		// Jezeli nie ma nic
		// if(!base['conductivity_ramp'] && !base['conductivity_ramp'].id) {
		if(!base['conductivity_ramp']) {
			this.conductivity_ramp={};
		}
		//Jezeli kopiujemy z biblioteki lub duplikujemy obiekt, odnoszac sie do tego samego obiektu RAMP
		else if(typeof base['conductivity_ramp'] === 'object' && base['conductivity_ramp'] != {} && base['conductivity_ramp']!=undefined) {
			this.conductivity_ramp = base['conductivity_ramp'];
		} 
		// Jezeli jest nazwa
		else {
			if(!ramps){
				this.conductivity_ramp = {};
			} else {
				this.conductivity_ramp=lodash.find(ramps, function(ramp) {
					return ramp.id==base['conductivity_ramp'];
				})
				if(this.conductivity_ramp === undefined)
					this.conductivity_ramp = {};
			}
		}

		// Jezeli nie ma nic
		//if(!base['specific_heat_ramp'] || !base['specific_heat_ramp'].id) {
		if(!base['specific_heat_ramp']) {
			this.specific_heat_ramp={};
		}
		//Jezeli kopiujemy z biblioteki lub duplikujemy obiekt, odnoszac sie do tego samego obiektu RAMP
		else if(typeof base['specific_heat_ramp'] === 'object' && base['specific_heat_ramp'] != {} && base['specific_heat_ramp']!=undefined) {
			this.specific_heat_ramp = base['specific_heat_ramp'];
		} 
		// Jezeli jest nazwa
		else {
			if(!ramps){
				this.specific_heat_ramp = {};
			} else {
				this.specific_heat_ramp=lodash.find(ramps, function(ramp) {
					return ramp.id==base['specific_heat_ramp'];
				})
				if(this.specific_heat_ramp === undefined)
					this.specific_heat_ramp = {};
			}
		}

		this.specific_heat=accessor.toReal(base['specific_heat']|| def.matl.specific_heat.value);
		this.set_specific_heat=function(arg){
			return accessor.setter(this, 'specific_heat', def.matl.specific_heat, arg);
		}

		this.set_specific_heat_lib=function(arg){
			return accessor.setterLib(this, 'specific_heat', def.matl.specific_heat, arg);
		}

		this.emissivity=accessor.toReal(base['emissivity']||def.matl.emissivity.value);
		this.set_emissivity=function(arg){
			return accessor.setter(this, 'emissivity', def.matl.emissivity, arg);
		}

		this.set_emissivity_lib=function(arg){
			return accessor.setterLib(this, 'emissivity', def.matl.emissivity, arg);
		}

		this.absorption_coefficient=accessor.toReal(base['absorption_coefficient']||def.matl.absorption_coefficient.value);
		this.set_absorption_coefficient=function(arg){
			return accessor.setter(this, 'absorption_coefficient', def.matl.absorption_coefficient, arg);
		}

		this.set_absorption_coefficient_lib=function(arg){
			return accessor.setterLib(this, 'absorption_coefficient', def.matl.absorption_coefficient, arg);
		}

		this.toJSON=function(arg) {
			var matl={
				id:this.id,
				uuid:this.uuid,
				conductivity:this.conductivity,
				density:this.density,
				specific_heat:this.specific_heat,
				emissivity:this.emissivity,
				absorption_coefficient:this.absorption_coeficient,
				conductivity_ramp:this.conductivity_ramp.id,
				specific_heat_ramp:this.specific_heat_ramp.id,
			}
			return matl; 
		}
	}


	return Matl;
}])
/*}}} */
/*{{{ Surf */
.factory('Surf', ['GlobalValues', 'lodash', 'Accessor', 'IdGenerator','Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
	
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;
	
	function Surf(base, matls) {

		var accessor=new Accessor();
		
		if(!base) {
			base={};
		} else {

		}

		this.id=base['id']||'';	
		this.uuid=base['uuid']|| IdGenerator.genUUID();

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;
		
		this.idAC=base['idAC']||'';
		
		this.editable=accessor.toBool(base['editable'], true);
		this.color=base['color']|| def.surf.color.value;
		this.set_color=function(arg){
			return accessor.setter(this, 'color', def.surf.color, arg);
		}
		this.set_color_lib=function(arg){
			return accessor.setterLib(this, 'color', def.surf.color, arg);
		} 
		this.backing=base['backing']||def.surf.backing.value;
		this.adiabatic=accessor.toBool(base['adiabatic'], def.surf.adiabatic.value);
		this.transparency=accessor.toReal(base['transparency']||def.surf.transparency.value);
		
		this.set_transparency=function(arg){
			return accessor.setter(this, 'transparency', def.surf.transparency, arg);
		}
		this.set_transparency_lib=function(arg){
			return accessor.setterLib(this, 'transparency', def.surf.transparency, arg);
		}

		this.addLayer=function() {
			this.layers.push({
				materials:[],
				thickness:0,
				set_thickness:function(arg) {
					return accessor.setter(this, 'thickness', defWiz.surf.thickness, arg);
				},
				set_thickness_lib:function(arg) {
					return accessor.setterLib(this, 'thickness', defWiz.surf.thickness, arg);
				}	
			})
		};

		this.removeLayer=function(index) {
			this.layers.splice(index, 1);
		};

		this.addMaterial=function(layerIndex) {
			var layer=this.layers[layerIndex];
			layer.materials.push({
				material:{},
				fraction:0,
				set_fraction:function(arg) {
					var self=this;
					var fractions=lodash.filter(layer.materials, function(element) {
						return element.material!=self.material;
					});
					return accessor.calcSetter(self, 'fraction', defWiz.surf.fraction, Calc.matlFraction, {
						fraction_old: {obj:self, path: 'fraction', value:self.fraction},
						fractions: {obj:layer, path: 'materials', value:fractions},
						fraction: {obj:self, path: 'fraction', value:Validator.normalizeReal(arg)*1}
					}, arg) 
					//return accessor.setter(this, 'fraction', defWiz.surf.fraction , arg);
				}
			})
		};

		this.removeMaterial=function(layerIndex, matlIndex) {
			this.layers[layerIndex].materials.splice(matlIndex,1);
		};

		var self=this;

		if(!matls) {
			this.layers=base['layers']||[];
		} else {
			this.layers=[];
			lodash.each(base['layers'], function(layer) {
				self.addLayer();
				var index=self.layers.length-1;
				self.layers[index].thickness=accessor.toReal(layer.thickness);
				lodash.each(layer['materials'], function(matl) {
					self.addMaterial(index);
					var matlIndex=self.layers[index].materials.length-1;
					var material=lodash.find(matls, function(material) {
						return material.id==matl.matl_id;
					})
					self.layers[index].materials[matlIndex].material=material;
					self.layers[index].materials[matlIndex].fraction=accessor.toReal(matl.fraction);
				})
			})
		}

		this.toJSON=function(arg) {
			var surf={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				color:this.color,
				editable:this.editable,
				backing:this.backing,
				adiabatic:this.adiabatic,
				transparency:this.transparency,
				layers:lodash.map(this.layers, function(layer) {
					var materials=lodash.map(layer.materials, function(value) {
						return {matl_id:value.material.id, fraction:value.fraction}
					});
					return {thickness:layer.thickness, materials:materials};
				})
			}
			return surf; 
		}
	}

	return Surf;
}])
/* }}} */
/*{{{ Ramp */
.factory('Ramp', ['GlobalValues', 'lodash', 'Accessor', 'Validator','IdGenerator',  function(GlobalValues, lodash, Accessor, Validator, IdGenerator) {
	
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;


	function Ramp(base) {

		var accessor=new Accessor();

		if(!base) {
			base={};
		}

		this.id=base['id'] || '';

		this.uuid=base['uuid']|| IdGenerator.genUUID();


		this.type=base['type']||'matl';

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.addStep=function(t,f) {
			
			this.steps.push({
				t: t||0,
				set_t:function(arg) {

					return accessor.setter(this, 't', defWiz.ramp.t /*{type:'Real', valid_ranges: [{minInclusive:0}], error_messages:{pattern:'Fraction must be real, positive number between 0 and 1'}}*/, arg);
				},
				set_f:function(arg) {

					return accessor.setter(this, 'f', defWiz.ramp.f /*{type:'Real', valid_ranges: [{minInclusive:0}], error_messages:{pattern:'Fraction must be real, positive number between 0 and 1'}}*/, arg);
				},
				f: f||0,
				setCF:function(material) {
					var step=this;
					var matlRef=material;
					return function(arg) {
						if(arg) {	
							if(Validator.attribute(arg, defWiz.matl.conductivity_ramp_f)) {
								if(matlRef.conductivity!=0) {
									step.f = arg/matlRef.conductivity;		
								} else {
									//step.f=0;
								}			
							}
						} else {
							return step.f*matlRef.conductivity;

						}
					}
				},
				setSHF:function(material) {
					var step=this;
					var matlRef=material;
					return function(arg) {
						if(arg) {	
							if(Validator.attribute(arg, defWiz.matl.specific_heat_ramp_f)) {
								if(matlRef.specific_heat!=0) {
									step.f = arg/matlRef.specific_heat;	
								} else {
									//step.f=0;
								}					
							}
						} else {
							return step.f*matlRef.specific_heat;

						}
					}
				},
				setHRRF:function(fire) {
					var step=this;
					var fire=fire;
					return function(arg) {
						if(arg) {
							if(Validator.attribute(arg, defWiz.surf.hrr)) {
								if(fire.totalHRR()!=0) {
									step.f = arg/fire.totalHRR();
								} else {

								}
							}
						} else {
							return 	step.f*fire.totalHRR();
							
						}
		
						//return arguments.length ? (step.f = f/fire.totalHRR()) : step.f*fire.totalHRR();
					}
				},
				setVel:function(surf) {
					var step=this;
					var surf=surf;
					return function(arg) {
						if(arg) {
							if(Validator.attribute(arg, def.surf.vel)) {
								if(surf.flow.velocity!=0) {
									step.f = arg/surf.flow.velocity;
								} else {

								}
							}
						} else {
							return 	step.f*surf.flow.velocity;
							
						}
		
					}
				},
				setVolFlow:function(surf) {
					var step=this;
					var surf=surf;
					return function(arg) {
						if(arg) {
							if(Validator.attribute(arg, def.surf.volume_flow)) {
								if(surf.flow.volume_flow!=0) {
									step.f = arg/surf.flow.volume_flow;
								} else {

								}
							}
						} else {
							return 	step.f*surf.flow.volume_flow;
							
						}
		
					}
				},
				setMassFlow:function(surf) {
					var step=this;
					var surf=surf;
					return function(arg) {
						if(arg) {
							if(Validator.attribute(arg, def.surf.mass_flux)) {
								if(surf.flow.mass_flow!=0) {
									step.f = arg/surf.flow.mass_flow;
								} else {

								}
							}
						} else {
							return 	step.f*surf.flow.mass_flow;
							
						}
		
					}
				}

			
			});
		};

		if(base['steps'] && base['steps'].length>0) {
			this.steps=[];
			var self=this;	
			lodash.each(base['steps'], function(step) {
				self.addStep(step.t*1, step.f*1);	
			})
		} else {
			this.steps=[];
		}

		this.removeStep=function(index) {
			this.steps.splice(index, 1);
		};

		this.toJSON=function(arg) {
			var ramp={
				id:this.id,
				uuid:this.uuid,
				type:this.type,
				steps:lodash.map(this.steps, function(step) {
					return {t:step.t, f:step.f};
				})			
			}
			return ramp; 
		}


	}

	return Ramp;
}])
/*}}} */
/*{{{ Obst */
.factory('Obst', [ 'GlobalValues', 'lodash', 'Accessor', 'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator)  {
	
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Obst(base, surfs, devcs) {

		var accessor=new Accessor();
		if(!base) {
			base={}
		}

		var self=this;

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';
		this.elevation=accessor.toReal(lodash.get(base, 'elevation', defWiz.obst.elevation.value));
		this.set_elevation=function(arg){
			return accessor.setter(this, 'elevation', defWiz.obst.elevation, arg);
		}

		this.setId=accessor.setId;

  		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.obst.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.setter(this, 'xb.x1', def.obst.xb, arg);
		}
		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.obst.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.setter(this, 'xb.x2', def.obst.xb, arg);
		}
		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.obst.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.setter(this, 'xb.y1', def.obst.xb, arg);
		}
		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.obst.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.setter(this, 'xb.y2', def.obst.xb, arg);
		}
		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.obst.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.setter(this, 'xb.z1', def.obst.xb, arg);
		}
		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.obst.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.setter(this, 'xb.z2', def.obst.xb, arg);
		}
/*
		if((!surfs && !object_surfs) ||(surfs && object_surfs)) {
			this.surf=base['surf']||{
				type:'surf_id',
				surf_id:{},
				oldType:'surf_id'
			}
		} else */

		if(!surfs) {
			this.surf=base['surf']||{
				type:'surf_id',
				surf_id: {},
				oldType:'surf_id'
			}

		} else  {
			if(base['surf']) {
				switch (base['surf']['type']) {
					case 'surf_id':
						this.surf={
							type:'surf_id',
							oldType:'surf_id',
							surf_id:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id']
							}) || surfs[0]

						};
						break;
					case 'surf_ids':
						this.surf={
							type:'surf_ids',
							oldType:'surf_id',
							surf_idx:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_idx']
							})||surfs[0],
							surf_idy:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_idy']
							})||surfs[0],
							surf_idz:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_idz']
							})||surfs[0]
						};
						break;
					case 'surf_id6':
						this.surf={
							type:'surf_id6',
							oldType:'surf_id',
							surf_id1:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id1']
							})||surfs[0],
							surf_id2:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id2']
							})||surfs[0],
							surf_id3:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id3']
							})||surfs[0],
							surf_id4:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id4']
							})||surfs[0],
							surf_id5:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id5']
							})||surfs[0],
							surf_id6:lodash.find(surfs, function(surf) {
								return surf.id==base['surf']['surf_id6']
							})||surfs[0]
						};
						break;
					default: 	
						this.surf={
						type:'surf_id',
						surf_id:{},
						oldType:'surf_id'
					}

				}
			} else {
				this.surf={
					type:'surf_id',
					surf_id:surfs[0],
					oldType:'surf_id'
				}


			}
		}

		this.thicken=accessor.toBool(base['thicken'], def.obst.thicken.value);
		this.overlay=accessor.toBool(base['overlay'], def.obst.overlay.value);
		this.permit_hole=accessor.toBool(base['permitHole'], def.obst.permit_hole.value);
		this.removable=accessor.toBool(base['removable'], def.obst.removable.value);

		this.ctrl=base['ctrl']||{};
		this.devc=lodash.find(devcs, function(devc) { return devc.id==base['devc_id']; }) || {id: ''};

		this.changeSurf=function() {
			if(this.surf.type=='surf_id') {
				if(this.surf.oldType=='surf_ids') {	
					this.surf={
						type:this.surf.type,
						surf_id:this.surf.surf_idx
					}	

				} else if(this.surf.oldType=='surf_id6') {
					this.surf={
						type:this.surf.type,
						surf_id:this.surf.surf_id1
					}	
				} else {
					this.surf={
						type:this.surf.type,
						surf_id:surfs[0]||{}
					}	
				}
			} else if(this.surf.type=='surf_ids') {
				if(this.surf.oldType=='surf_id') {	
					this.surf={
						type: this.surf.type,
						surf_idx:this.surf.surf_id,
						surf_idy:this.surf.surf_id,
						surf_idz:this.surf.surf_id
					}	
				} else if(this.surf.oldType=='surf_id6') {
					this.surf={
						type: this.surf.type,
						surf_idx:this.surf.surf_id1,
						surf_idy:this.surf.surf_id3,
						surf_idz:this.surf.surf_id5
					}	
				} else {
					this.surf={
						type: this.surf.type,
						surf_idx:surfs[0]||{},
						surf_idy:surfs[0]||{},
						surf_idz:surfs[0]||{}
					}	
				}
			} else if(this.surf.type=='surf_id6') {
				if(this.surf.oldType=='surf_id') {	
					this.surf={
						type: this.surf.type,
						surf_id1:this.surf.surf_id,
						surf_id2:this.surf.surf_id,
						surf_id3:this.surf.surf_id,
						surf_id4:this.surf.surf_id,
						surf_id5:this.surf.surf_id,
						surf_id6:this.surf.surf_id

					}	
				} else if(this.surf.oldType=='surf_ids') {
					this.surf={
						type: this.surf.type,
						surf_id1:this.surf.surf_idx,
						surf_id2:this.surf.surf_idx,
						surf_id3:this.surf.surf_idy,
						surf_id4:this.surf.surf_idy,
						surf_id5:this.surf.surf_idz,
						surf_id6:this.surf.surf_idz

					}
				} else {
					this.surf={
						surf_id1:surfs[0]||{},
						surf_id2:surfs[0]||{},
						surf_id3:surfs[0]||{},
						surf_id4:surfs[0]||{},
						surf_id5:surfs[0]||{},
						surf_id6:surfs[0]||{}

					}	
				}
			}

			this.surf.oldType=this.surf.type;
		}

		this.changeSurfID=function(id_old, list) {
			return accessor.selectSetter(self, 'surf.surf_id', id_old, list);
		}

		this.changeSurfIDX=function(id_old, list) {
			return accessor.selectSetter(self, 'surf.surf_idx', id_old, list);
		}

		this.changeSurfID1=function(id_old, list) {
			return accessor.selectSetter(self, 'surf.surf_id1', id_old, list);
		}


		this.toJSON=function(arg) {
			var surf={};
			if(this.surf.type=='surf_id') {
				surf={
					type:'surf_id',
					surf_id:lodash.get(this, 'surf.surf_id.id', undefined)
				}
			} else if(this.surf.type=='surf_ids') {
				surf={
					type:'surf_ids',
					surf_idx:lodash.get(this, 'surf.surf_idx.id', undefined),
					surf_idy:lodash.get(this, 'surf.surf_idy.id', undefined),
					surf_idz:lodash.get(this, 'surf.surf_idz.id', undefined),
				}

			} else if(this.surf.type=='surf_id6') {
				surf={
					type:'surf_id6',
					surf_id1:lodash.get(this, 'surf.surf_id1.id', undefined),
					surf_id2:lodash.get(this, 'surf.surf_id2.id', undefined),
					surf_id3:lodash.get(this, 'surf.surf_id3.id', undefined),
					surf_id4:lodash.get(this, 'surf.surf_id4.id', undefined),
					surf_id5:lodash.get(this, 'surf.surf_id5.id', undefined),
					surf_id6:lodash.get(this, 'surf.surf_id6.id', undefined)
				}

			} else {
				surf=undefined;
			}
			var obst={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				elevation:this.elevation,
				thicken:this.thicken,
				permit_hole:this.permit_hole,
				overlay:this.overlay,
				removable:this.removable,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				},
				ctrl_id:this.ctrl.id,
				devc_id:this.devc.id,
				surf:surf
			}
			return obst; 
		}


	}

	return Obst;
}])
/*}}} */
/*{{{ Hole */
.factory('Hole', ['GlobalValues', 'lodash', 'Accessor', 'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Hole(base) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';
		this.setId=accessor.setId;

		this.elevation=accessor.toReal(lodash.get(base, 'elevation', defWiz.hole.elevation.value));
		this.set_elevation=function(arg){
			return accessor.setter(this, 'elevation', defWiz.hole.elevation, arg);
		}


		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.hole.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.setter(this, 'xb.x1', def.hole.xb, arg);
		}
		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.hole.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.setter(this, 'xb.x2', def.hole.xb, arg);
		}
		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.hole.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.setter(this, 'xb.y1', def.hole.xb, arg);
		}
		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.hole.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.setter(this, 'xb.y2', def.hole.xb, arg);
		}
		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.hole.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.setter(this, 'xb.z1', def.hole.xb, arg);
		}
		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.hole.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.setter(this, 'xb.z2', def.hole.xb, arg);
		}

		this.toJSON=function(arg) {
			var hole={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				elevation:this.elevation,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				}
			}
			return hole; 
		}


	}

	return Hole;
}])
/*}}} */
/*{{{ Vent */
.factory('Vent', ['GlobalValues', 'lodash', 'Accessor','IdGenerator' , function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Vent(base, surfs) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';
		this.elevation=accessor.toReal(lodash.get(base, 'elevation', defWiz.vent.elevation.value));
		this.set_elevation=function(arg){
			return accessor.setter(this, 'elevation', defWiz.vent.elevation, arg);
		}


		this.setId=accessor.setId;
		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.vent.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.setter(this, 'xb.x1', def.vent.xb, arg);
		}
		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.vent.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.setter(this, 'xb.x2', def.vent.xb, arg);
		}
		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.vent.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.setter(this, 'xb.y1', def.vent.xb, arg);
		}
		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.vent.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.setter(this, 'xb.y2', def.vent.xb, arg);
		}
		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.vent.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.setter(this, 'xb.z1', def.vent.xb, arg);
		}
		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.vent.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.setter(this, 'xb.z2', def.vent.xb, arg);
		}

		this.surf={
			surf_id:lodash.get(base, 'surf.surf_id', {})
		}

		this.changeSurfID=function(id_old, list) {
			return accessor.selectSetter(self, 'surf.surf_id', id_old, list);
		}


		if(!surfs) {
			this.surf={

				surf_id:lodash.get(base, 'surf.surf_id', {})
			}
		} else {
			this.surf={
				surf_id: lodash.find(surfs, function(surf) {
					return surf.id==base['surf_id'];
				})
			}
		}


		this.toJSON=function(arg) {
			var vent={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				surf_id:this.surf.surf_id.id,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				}
			}
			return vent; 
		}


	}

	return Vent;
}])
/*}}} */
/*{{{ SurfVent */
.factory('SurfVent', [ 'GlobalValues', 'lodash', 'Accessor', 'IdGenerator', 'Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function SurfVent(base, ramps) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';


		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.color=base['color']||'BLUE';
		this.set_color=function(arg){
			return accessor.setter(this, 'color', def.surf.color, arg);
		}
		this.set_color_lib=function(arg){
			return accessor.setter(this, 'color', def.surf.color, arg);
		}
		var self=this;

		this.flow={
			type:lodash.get(base, 'flow.type', 'velocity'),
			oldType:'velocity',

			volume_flow: accessor.toReal(lodash.get(base, 'flow.volume_flow', def.surf.volume_flow.value)),
			set_volume_flow:function(arg){
				return accessor.setter(self, 'flow.volume_flow', def.surf.volume_flow, arg);
			},
			set_volume_flow_lib:function(arg){
				return accessor.setterLib(self, 'flow.volume_flow', def.surf.volume_flow, arg);
			},
			volume_flow_per_hour: accessor.toReal(lodash.get(base, 'flow.volume_flow_per_hour', def.hvac.volume_flow.value)),
			set_volume_flow_per_hour:function(arg){
				return accessor.calcSetter(self, 'flow.volume_flow_per_hour', def.hvac.volume_flow, Calc.volumeFlowPerSecond, {
					dim1: {obj:self, path:'flow.volume_flow_per_hour', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerSecond: {obj:self, path:'flow.volume_flow', value:self.flow.volume_flow},
				}, arg);
			},
			set_volume_flow_per_hour_lib:function(arg){
				return accessor.calcSetter(self, 'flow.volume_flow_per_hour', def.hvac.volume_flow, Calc.volumeFlowPerSecond, {
					dim1: {obj:self, path:'flow.volume_flow_per_hour', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerSecond: {obj:self, path:'flow.volume_flow', value:self.flow.volume_flow},
				}, arg);
			},

			mass_flow: accessor.toReal(lodash.get(base, 'flow.mass_flow', def.surf.mass_flux.value)),
			set_mass_flow:function(arg){
				return accessor.setter(self, 'flow.mass_flow', def.surf.mass_flux, arg);
			},
			set_mass_flow_lib:function(arg){
				return accessor.setterLib(self, 'flow.mass_flow', def.surf.mass_flux, arg);
			},

			velocity: accessor.toReal(lodash.get(base, 'flow.velocity', def.surf.vel.value)),
			set_velocity:function(arg){
				return accessor.setter(self, 'flow.velocity', def.surf.vel, arg);
			},
			set_velocity_lib:function(arg){
				return accessor.setterLib(self, 'flow.velocity', def.surf.vel, arg);
			}
		}

		this.changeFlowType=function() {
	
			if(this.flow.type=='velocity') {
				if(this.flow.oldType=='volumeFlow') {

				} else if(this.flow.oldType=='massFlow') {

				}
				this.flow.volume_flow=0;
				this.flow.mass_flow=0;

			} else 	if(this.flow.type=='volumeFlow') {
				if(this.flow.oldType=='velocity') {

				} else if(this.flow.oldType=='massFlow') {

				}
				this.flow.velocity=0;
				this.flow.mass_flow=0;

			} else 	if(this.flow.type=='massFlow') {
				if(this.flow.oldType=='velocity') {

				} else if(this.flow.oldType=='massFlow') {

				}
				this.flow.volume_flow=0;
				this.flow.mass_flow=0;
			}		
		}

		this.heater={
			active: accessor.toBool(lodash.get(base, 'heater.active', false)),
			tmp_front: accessor.toReal(lodash.get(base, 'heater.tmp_front', def.surf.tmp_front.value)),
			set_temperature:function(arg) {
				return accessor.setter(this, 'tmp_front', def.surf.tmp_front, arg);
			},
			set_temperature_lib:function(arg) {
				return accessor.setterLib(this, 'tmp_front', def.surf.tmp_front, arg);
			}

		}

		this.louver={
			active: accessor.toBool(lodash.get(base, 'louver.active', false)),
			tangential1: accessor.toReal(lodash.get(base, 'louver.tangential1', def.surf.vel_t.value[0])),
			tangential2: accessor.toReal(lodash.get(base, 'louver.tangential2', def.surf.vel_t.value[1])),
			set_tangential1:function(arg) {
				return accessor.setter(this, 'tangential1', def.surf.vel_t, arg);
			},
			set_tangential2:function(arg) {
				return accessor.setter(this, 'tangential2', def.surf.vel_t, arg);
			},
			set_tangential1_lib:function(arg) {
				return accessor.setterLib(this, 'tangential1', def.surf.vel_t, arg);
			},
			set_tangential2_lib:function(arg) {
				return accessor.setterLib(this, 'tangential2', def.surf.vel_t, arg);
			}			

		}
		// Jezeli jest z bazy danych bez id
		if(base['ramp_id'] == ''){
			this.ramp = {id: ''};
		} 
		// Jeeli kopiujemy z biblioteki
		else if(typeof base['ramp'] === 'object' && base['ramp'] != null) {
			this.ramp = base['ramp'];
		} 
		// Jezeli jest nazwa
		else {
			if(!ramps){
				this.ramp = {id: ''};
			} else {
				this.ramp=lodash.find(ramps, function(ramp) {
					return ramp.id==base['ramp_id'];
				})
				if(this.ramp === undefined)
					this.ramp = {id: ''};
			}
		}

		this.toJSON=function(arg) {
			var flow={};

			if(this.flow.type=='velocity') {
				flow={
					type:'velocity',
					velocity:this.flow.velocity
				}
			} else if(this.flow.type=='volumeFlow') {
				flow={
					type:'volumeFlow',
					volume_flow:this.flow.volume_flow,
					volume_flow_per_hour:this.flow.volume_flow_per_hour
				}

			} else if(this.flow.type=='massFlow') {
				flow={
					type:'massFlow',
					mass_flow:this.flow.mass_flow
				}


			} else {
				flow={};
			}

			var surf={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				color:this.color,
				flow: flow,
				heater:{
					active:this.heater.active,
					tmp_front:this.heater.tmp_front
				},
				louver:{
					active:this.louver.active,
					tangential1:this.louver.tangential1,
					tangential2:this.louver.tangential2
				},
				ramp_id:this.ramp.id
			}
			return surf; 
		}
	}

	return SurfVent;
}])
/*}}} */
/*{{{ Jetfan */
.factory('Jetfan', ['GlobalValues', 'lodash', 'Accessor','IdGenerator', 'Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Jetfan(base, ramps) {
		if(!base) {
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.elevation=accessor.toReal(lodash.get(base, 'elevation', defWiz.vent.elevation.value));
		this.set_elevation=function(arg){
			return accessor.setter(this, 'elevation', defWiz.vent.elevation, arg);
		}
		this.set_elevation_lib=function(arg){
			return accessor.setterLib(this, 'elevation', defWiz.vent.elevation, arg);
		}

		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.vent.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.setter(this, 'xb.x1', def.vent.xb, arg);
		}
		this.set_x1_lib=function(arg){
			return accessor.setterLib(this, 'xb.x1', def.vent.xb, arg);
		}
		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.vent.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.setter(this, 'xb.x2', def.vent.xb, arg);
		}
		this.set_x2_lib=function(arg){
			return accessor.setterLib(this, 'xb.x2', def.vent.xb, arg);
		}
		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.vent.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.setter(this, 'xb.y1', def.vent.xb, arg);
		}
		this.set_y1_lib=function(arg){
			return accessor.setterLib(this, 'xb.y1', def.vent.xb, arg);
		}
		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.vent.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.setter(this, 'xb.y2', def.vent.xb, arg);
		}
		this.set_y2_lib=function(arg){
			return accessor.setterLib(this, 'xb.y2', def.vent.xb, arg);
		}
		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.vent.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.setter(this, 'xb.z1', def.vent.xb, arg);
		}
		this.set_z1_lib=function(arg){
			return accessor.setterLib(this, 'xb.z1', def.vent.xb, arg);
		}
		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.vent.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.setter(this, 'xb.z2', def.vent.xb, arg);
		}
		this.set_z2_lib=function(arg){
			return accessor.setterLib(this, 'xb.z2', def.vent.xb, arg);
		}


		this.direction=base['direction']||'+x';
		this.set_direction=function(arg){
			return accessor.setter(this, 'direction', defWiz.hvac.direction, arg);
		}
		this.set_direction_lib=function(arg){
			return accessor.setterLib(this, 'direction', defWiz.hvac.direction, arg);
		}

		var self=this;

		this.flow={
			type:lodash.get(base, 'flow.type', 'volumeFlow'),
			oldType:'volumeFlow',
			volume_flow: accessor.toReal(lodash.get(base, 'flow.volume_flow', def.hvac.volume_flow.value)),
			set_volume_flow:function(arg){
				return accessor.calcSetter(self, 'flow.volume_flow', def.hvac.volume_flow, Calc.volumeFlowPerHour, {
					dim1: {obj:self, path:'flow.volume_flow', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerHour: {obj:self, path:'flow.volume_flow_per_hour', value:self.flow.volume_flow_per_hour},
				}, arg);
			},
			set_volume_flow_lib:function(arg){
				return accessor.calcSetter(self, 'flow.volume_flow', def.hvac.volume_flow, Calc.volumeFlowPerHour, {
					dim1: {obj:self, path:'flow.volume_flow', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerHour: {obj:self, path:'flow.volume_flow_per_hour', value:self.flow.volume_flow_per_hour},
				}, arg);
			},

			volume_flow_per_hour: accessor.toReal(lodash.get(base, 'flow.volume_flow_per_hour', def.hvac.volume_flow.value)),
			set_volume_flow_per_hour:function(arg){
				return accessor.calcSetter(self, 'flow.volume_flow_per_hour', def.hvac.volume_flow, Calc.volumeFlowPerSecond, {
					dim1: {obj:self, path:'flow.volume_flow_per_hour', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerSecond: {obj:self, path:'flow.volume_flow', value:self.flow.volume_flow},
				}, arg);
			},
			set_volume_flow_per_hour_lib:function(arg){
				return accessor.calcSetter(self, 'flow.volume_flow_per_hour', def.hvac.volume_flow, Calc.volumeFlowPerSecond, {
					dim1: {obj:self, path:'flow.volume_flow_per_hour', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerSecond: {obj:self, path:'flow.volume_flow', value:self.flow.volume_flow},
				}, arg);
			},

			mass_flow: accessor.toReal(lodash.get(base, 'flow.mass_flow', def.hvac.mass_flow.value)),
			set_mass_flow:function(arg){
				return accessor.setter(self, 'flow.mass_flow', def.hvac.mass_flow, arg);
			},
			set_mass_flow_lib:function(arg){
				return accessor.setterLib(self, 'flow.mass_flow', def.hvac.mass_flow, arg);
			},
		}

		this.changeFlowType=function() {
	
			if(this.flow.type=='massFlow') {
				if(this.flow.oldType=='volumeFlow') {

				}
				//this.flow.volume_flow=0;

			} else	if(this.flow.type=='volumeFlow') {
				if(this.flow.oldType=='massFlow') {

				} 
				//this.flow.mass_flow=0;
			}		
		}

		// Jezeli jest z bazy danych bez id
		if(base['ramp_id'] == ''){
			this.ramp = {id: ''};
		} 
		// Jeeli kopiujemy z biblioteki
		else if(typeof base['ramp'] === 'object' && base['ramp'] != null) {
			this.ramp = base['ramp'];
		} 
		// Jezeli jest nazwa
		else {
			if(!ramps){
				this.ramp = {id: ''};
			} else {
				this.ramp=lodash.find(ramps, function(ramp) {
					return ramp.id==base['ramp_id'];
				})
				if(this.ramp === undefined)
					this.ramp = {id: ''};
			}
		}

		this.louver={
			active: accessor.toBool(false),
			tangential1: accessor.toReal(lodash.get(base, 'louver.tangential1', def.vent.uvw.value[0])),
			tangential2: accessor.toReal(lodash.get(base, 'louver.tangential2', def.vent.uvw.value[1])),
			tangential3: accessor.toReal(lodash.get(base, 'louver.tangential3', def.vent.uvw.value[2])),
			set_tangential1:function(arg) {
				return accessor.setter(this, 'tangential1', def.vent.uvw, arg);
			},
			set_tangential2:function(arg) {
				return accessor.setter(this, 'tangential2', def.vent.uvw, arg);
			},
			set_tangential3:function(arg) {
				return accessor.setter(this, 'tangential3', def.vent.uvw, arg);
			},
			set_tangential1_lib:function(arg) {
				return accessor.setterLib(this, 'tangential1', def.vent.uvw, arg);
			},
			set_tangential2_lib:function(arg) {
				return accessor.setterLib(this, 'tangential2', def.vent.uvw, arg);
			},			
			set_tangential3_lib:function(arg) {
				return accessor.setterLib(this, 'tangential3', def.vent.uvw, arg);
			}
		}
		if(base['louver'] != undefined){
			this.louver.active = accessor.toBool(base['louver']['active'], false);
		}

		this.area={
			type:lodash.get(base, 'area.type', 'area'),
			oldType:'area',
			area: accessor.toReal(lodash.get(base, 'area.area', def.hvac.area.value)),
			set_area:function(arg){
				return accessor.setter(self, 'area.area', def.hvac.area, arg);
			},
			set_area_lib:function(arg){
				return accessor.setterLib(self, 'area.area', def.hvac.area, arg);
			},

			diameter: accessor.toReal(lodash.get(base, 'area.diameter', def.hvac.diameter.value)),
			set_diameter:function(arg){
				return accessor.setter(self, 'area.diameter', def.hvac.diameter, arg);
			},
			set_diameter_lib:function(arg){
				return accessor.setterLib(self, 'area.diameter', def.hvac.diameter, arg);
			},

			perimeter: accessor.toReal(lodash.get(base, 'area.perimeter', def.hvac.perimeter.value)),
			set_perimeter:function(arg){
				return accessor.setter(self, 'area.perimeter', def.hvac.perimeter, arg);
			},
			set_perimeter_lib:function(arg){
				return accessor.setterLib(self, 'area.perimeter', def.hvac.perimeter, arg);
			},
		}

		this.changeAreaType=function() {
	
			if(this.area.type=='area') {
				this.area.area=0;
			} else	if(this.area.type=='diameter') {
				this.area.diameter=0;
			} else	if(this.area.type=='perimeter') {
				this.area.perimeter=0;
			}
		}

		this.devc={
			active: accessor.toBool(false),
			setpoint: accessor.toReal(lodash.get(base, 'devc.setpoint', def.devc.setpoint.value)),
			set_setpoint:function(arg) {
				return accessor.setter(this, 'setpoint', def.devc.setpoint, arg);
			},
			set_setpoint_lib:function(arg) {
				return accessor.setterLib(this, 'setpoint', def.devc.setpoint, arg);
			}
		}
		if(base['devc'] != undefined){
			this.devc.active = accessor.toBool(base['devc']['active'], false);
		}


		this.toJSON=function(arg) {

			var flow={};
			if(this.flow.type=='massFlow') {
				flow={
					type:'massFlow',
					mass_flow:this.flow.mass_flow
				}
			} else if(this.flow.type=='volumeFlow') {
				flow={
					type:'volumeFlow',
					volume_flow:this.flow.volume_flow,
					volume_flow_per_hour:this.flow.volume_flow_per_hour
				}
			} else {
				flow={};
			}

			var area={};
			if(this.area.type=='area') {
				area={
					type:'area',
					area:this.area.area
				}
			} else if(this.area.type=='diameter') {
				area={
					type:'diameter',
					diameter:this.area.diameter
				}
			} else if(this.area.type=='perimeter') {
				area={
					type:'perimeter',
					perimeter:this.area.perimeter
				}
			} else {
				area={};
			}

			var jetfan={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				direction:this.direction,
				elevation: this.elevation,
				flow: flow,
				area: area,
				ramp_id:this.ramp.id,
				louver:{
					active:this.louver.active,
					tangential1:this.louver.tangential1,
					tangential2:this.louver.tangential2,
					tangential3:this.louver.tangential3
				},
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				},
				devc:{
					active:this.devc.active,
					setpoint:this.devc.setpoint,
				},
			}
			return jetfan; 
		}
	}
	return Jetfan;
}])

/*}}} */
/*{{{ Slcf */
.factory('Slcf', [ 'GlobalValues', 'lodash', 'Accessor','IdGenerator' , function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Slcf(base, specs, parts) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.direction=base['direction']||'x';
		this.value=accessor.toReal(base['value']||0);
		this.set_value=function(arg){
			return accessor.setter(this, 'value', def.slcf.pbx, arg);
		}
		this.set_value_lib=function(arg){
			return accessor.setterLib(this, 'value', def.slcf.pbx, arg);
		}


		if(base['quantities']) {
			this.quantities=lodash.map(GlobalValues.values.enums.slcfQuantity, function(value) {
				var baseQuantity=lodash.find(base['quantities'], function(quantity) {
					return value.quantity==quantity.name;
				})
				var quantity={label:value.label, name:value.quantity, marked:accessor.toBool(baseQuantity.marked)};
				if(accessor.toBool(baseQuantity['spec'])==true) {
					this.spec=true;
					if(specs) {
						quantity.specs=lodash.map(baseQuantity['specs'], function(spec) {
							var specie=lodash.find(specs, function(elem) {
								return elem.id==spec;
							})
							return specie;
						})
					} else {
					
					}
				}
				if(accessor.toBool(baseQuantity['part'])==true) {
					this.part=true;
					if(parts) {
						quantity.parts=lodash.map(baseQuantity['parts'], function(part) {
							var particle=lodash.find(parts, function(elem) {
								return elem.id==part;
							})
							return particle;

						})
					} else {
					
					}
				}
				return quantity;
			})
		} else {
			this.quantities=lodash.map(GlobalValues.values.enums.slcfQuantity, function(value) { 
				var base={label:value.label, name:value.quantity, marked:false}; 
				if(accessor.toBool(value.spec)==true) {
					base.spec=true;
					base.specs=[];
				}
				if(accessor.toBool(value.part)==true) {
					base.part=true;
					base.parts=[];
				}

				return base;
			});
		
		}

		this.addSpec=function(index) {
			this.quantities[index].specs.push({spec:{}});
		}
		this.removeSpec=function(parent, index) {
			this.quantities[parent].specs.splice(index,1);
		}
		this.addPart=function(index) {
			this.quantities[index].parts.push({spec:{}});
		}
		this.removePart=function(parent, index) {
			this.quantities[parent].parts.splice(index,1);
		}

		this.toJSON=function(arg) {
			
			var slcfQuantities=lodash.map(this.quantities, function(value) {
				var specs=undefined;
				var parts=undefined;
				var res={label:value.label, name:value.name, marked:value.marked};

				if(value.spec && value.specs && value.specs.length>0) {
					specs=lodash.map(value.specs, function(spec) {
						return spec.spec.id
					})
					res.spec=true;
					res.specs=specs;
				}
				if(value.part && value.parts && value.parts.length>0) {
					parts=lodash.map(value.parts, function(part) {
						return part.part.id
					})
					res.part=true;
					res.parts=parts;
				}
				return res;
			})
			
			var slcf={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				direction:this.direction,
				value:this.value,
				quantities:slcfQuantities
			}
			return slcf; 
		}



	}

	return Slcf;
}])
/*}}} */
/*{{{ Specie */
.factory('Specie', [ 'GlobalValues', 'lodash', 'Accessor','IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Specie(base) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;
		this.editable=accessor.toBool(base['editable'], true);

		this.formula=base['formula']||def.spec.formula.value;
		this.set_formula=function(arg){
			return accessor.setter(this, 'formula', def.spec.formula, arg);
		}
		this.set_formula_lib=function(arg){
			return accessor.setterLib(this, 'formula', def.spec.formula, arg);
		}
		this.mw=accessor.toReal(base['mw']||def.spec.mw.value);
		this.set_mw=function(arg){
			return accessor.setter(this, 'mw', def.spec.mw, arg);
		}

		this.set_mw_lib=function(arg){
			return accessor.setterLib(this, 'mw', def.spec.mw, arg);
		}

		this.toJSON=function(arg) {
			var specie={
				id:this.id,
				uuid:this.uuid,
				editable:this.editable,
				formula:this.formula,
				mw:this.mw
			}
			return specie; 
		}
	}

	return Specie;
}])
/*}}} */
/*{{{ VentSpecie */
.factory('VentSpecie', ['GlobalValues', 'lodash', 'Accessor','IdGenerator' , function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function VentSpecie(base, surfs) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';
		this.elevation=accessor.toReal(lodash.get(base, 'elevation', defWiz.vent.elevation.value));
		this.set_elevation=function(arg){
			return accessor.setter(this, 'elevation', defWiz.vent.elevation, arg);
		}

		this.setId=accessor.setId;
		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.vent.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.setter(this, 'xb.x1', def.vent.xb, arg);
		}
		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.vent.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.setter(this, 'xb.x2', def.vent.xb, arg);
		}
		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.vent.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.setter(this, 'xb.y1', def.vent.xb, arg);
		}
		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.vent.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.setter(this, 'xb.y2', def.vent.xb, arg);
		}
		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.vent.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.setter(this, 'xb.z1', def.vent.xb, arg);
		}
		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.vent.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.setter(this, 'xb.z2', def.vent.xb, arg);
		}

		this.surf={
			surf_id:lodash.get(base, 'surf.surf_id', {})
		}

		this.changeSurfID=function(id_old, list) {
			return accessor.selectSetter(self, 'surf.surf_id', id_old, list);
		}

		if(!surfs) {
			this.surf={
				surf_id:lodash.get(base, 'surf.surf_id', {})
			}
		} else {
			this.surf={
				surf_id: lodash.find(surfs, function(surf) {
					return surf.id==base['surf_id'];
				})
			}
		}

		this.toJSON=function(arg) {
			var vent={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				surf_id:this.surf.surf_id.id,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				}
			}
			return vent; 
		}
	}
	return VentSpecie;
}])
/*}}} */
/*{{{ SurfSpecie */
.factory('SurfSpecie', [ 'GlobalValues', 'lodash', 'Accessor', 'IdGenerator', 'Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function SurfSpecie(base, ramps, specs) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';


		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.color=base['color']||'BLUE';
		this.set_color=function(arg){
			return accessor.setter(this, 'color', def.surf.color, arg);
		}
		this.set_color_lib=function(arg){
			return accessor.setter(this, 'color', def.surf.color, arg);
		}

		if(!specs) {
			this.spec=base['spec']||undefined;
		} else {
			if(base) {
				this.spec=lodash.find(specs, function(spec) {
					return spec.id==base['spec_id'];
				});
			} else {
				this.spec = undefined;
			}
		}

		var self=this;

		this.flow={
			type:lodash.get(base, 'flow.type', 'massFlux'),
			oldType:'massFlux',

			mass_flux: accessor.toReal(lodash.get(base, 'flow.mass_flux', def.surf.mass_flux.value)),
			set_mass_flux:function(arg){
				return accessor.setter(self, 'flow.mass_flux', def.surf.mass_flux, arg);
			},
			set_mass_flux_lib:function(arg){
				return accessor.setterLib(self, 'flow.mass_flux', def.surf.mass_flux, arg);
			},

			mass_fraction: accessor.toReal(lodash.get(base, 'flow.mass_fraction', def.surf.mass_fraction.value)),
			set_mass_fraction:function(arg){
				return accessor.setter(self, 'flow.mass_fraction', def.surf.mass_fraction, arg);
			},
			set_mass_fraction_lib:function(arg){
				return accessor.setterLib(self, 'flow.mass_fraction', def.surf.mass_fraction, arg);
			},
		}

		this.mass_fraction_flow={
			type:lodash.get(base, 'mass_fraction_flow.type', 'volumeFlow'),
			oldType:'volumeFlow',

			volume_flow: accessor.toReal(lodash.get(base, 'mass_fraction_flow.volume_flow', def.surf.volume_flow.value)),
			set_volume_flow:function(arg){
				return accessor.calcSetter(self, 'mass_fraction_flow.volume_flow', def.hvac.volume_flow, Calc.volumeFlowPerHour, {
					dim1: {obj:self, path:'mass_fraction_flow.volume_flow', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerHour: {obj:self, path:'mass_fraction_flow.volume_flow_per_hour', value:self.flow.volume_flow_per_hour},
				}, arg);
			},
			set_volume_flow_lib:function(arg){
				return accessor.calcSetter(self, 'mass_fraction_flow.volume_flow', def.hvac.volume_flow, Calc.volumeFlowPerHour, {
					dim1: {obj:self, path:'mass_fraction_flow.volume_flow', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerHour: {obj:self, path:'mass_fraction_flow.volume_flow_per_hour', value:self.flow.volume_flow_per_hour},
				}, arg);
			},
			volume_flow_per_hour: accessor.toReal(lodash.get(base, 'mass_fraction_flow.volume_flow_per_hour', def.hvac.volume_flow.value)),
			set_volume_flow_per_hour:function(arg){
				return accessor.calcSetter(self, 'mass_fraction_flow.volume_flow_per_hour', def.hvac.volume_flow, Calc.volumeFlowPerSecond, {
					dim1: {obj:self, path:'mass_fraction_flow.volume_flow_per_hour', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerSecond: {obj:self, path:'mass_fraction_flow.volume_flow', value:self.flow.volume_flow},
				}, arg);
			},
			set_volume_flow_per_hour_lib:function(arg){
				return accessor.calcSetter(self, 'mass_fraction_flow.volume_flow_per_hour', def.hvac.volume_flow, Calc.volumeFlowPerSecond, {
					dim1: {obj:self, path:'mass_fraction_flow.volume_flow_per_hour', value:Validator.normalizeReal(arg)*1},
					volumeFlowPerSecond: {obj:self, path:'mass_fraction_flow.volume_flow', value:self.flow.volume_flow},
				}, arg);
			},

			mass_flux_total: accessor.toReal(lodash.get(base, 'mass_fraction_flow.mass_flux_total', def.surf.mass_flux_total.value)),
			set_mass_flux_total:function(arg){
				return accessor.setter(self, 'mass_fraction_flow.mass_flux_total', def.surf.mass_flux_total, arg);
			},
			set_mass_flux_total_lib:function(arg){
				return accessor.setterLib(self, 'mass_fraction_flow.mass_flux_total', def.surf.mass_flux_total, arg);
			},

			velocity: accessor.toReal(lodash.get(base, 'mass_fraction_flow.velocity', def.surf.vel.value)),
			set_velocity:function(arg){
				return accessor.setter(self, 'mass_fraction_flow.velocity', def.surf.vel, arg);
			},
			set_velocity_lib:function(arg){
				return accessor.setterLib(self, 'mass_fraction_flow.velocity', def.surf.vel, arg);
			}
		}

		this.changeMassFractionFlowType=function() {
			if(this.mass_fraction_flow.type=='volumeFlow') {
				this.mass_fraction_flow.velocity=0;
				this.mass_fraction_flow.mass_flux_total=0;
			} else if(this.mass_fraction_flow.type=='velocity') {
				this.mass_fraction_flow.volume_flow=0;
				this.mass_fraction_flow.volume_flow_per_hour=0;
				this.mass_fraction_flow.mass_flux_total=0;
			} else if(this.mass_fraction_flow.type=='totalMassFlux') {
				this.mass_fraction_flow.volume_flow=0;
				this.mass_fraction_flow.volume_flow_per_hour=0;
				this.mass_fraction_flow.velocity=0;
			}
		}

		this.changeFlowType=function() {
			if(this.flow.type=='massFlux') {
				this.flow.mass_fraction=0;
				this.mass_fraction_flow.volume_flow=0;
				this.mass_fraction_flow.volume_flow_per_hour=0;
				this.mass_fraction_flow.velocity=0;
				this.mass_fraction_flow.mass_flux_total=0;
			} else if(this.flow.type=='massFraction') {
				this.flow.mass_flux=0;
			}
		}

		this.heater={
			active: accessor.toBool(lodash.get(base, 'heater.active', false)),
			tmp_front: accessor.toReal(lodash.get(base, 'heater.tmp_front', def.surf.tmp_front.value)),
			set_temperature:function(arg) {
				return accessor.setter(this, 'tmp_front', def.surf.tmp_front, arg);
			},
			set_temperature_lib:function(arg) {
				return accessor.setterLib(this, 'tmp_front', def.surf.tmp_front, arg);
			}
		}

		this.louver={
			active: accessor.toBool(lodash.get(base, 'louver.active', false)),
			tangential1: accessor.toReal(lodash.get(base, 'louver.tangential1', def.surf.vel_t.value[0])),
			tangential2: accessor.toReal(lodash.get(base, 'louver.tangential2', def.surf.vel_t.value[1])),
			set_tangential1:function(arg) {
				return accessor.setter(this, 'tangential1', def.surf.vel_t, arg);
			},
			set_tangential2:function(arg) {
				return accessor.setter(this, 'tangential2', def.surf.vel_t, arg);
			},
			set_tangential1_lib:function(arg) {
				return accessor.setterLib(this, 'tangential1', def.surf.vel_t, arg);
			},
			set_tangential2_lib:function(arg) {
				return accessor.setterLib(this, 'tangential2', def.surf.vel_t, arg);
			}			
		}
		// Jezeli jest z bazy danych bez id
		if(base['ramp_id'] == ''){
			this.ramp = {id: ''};
		} 
		// Jeeli kopiujemy z biblioteki
		else if(typeof base['ramp'] === 'object' && base['ramp'] != null) {
			this.ramp = base['ramp'];
		} 
		// Jezeli jest nazwa
		else {
			if(!ramps){
				this.ramp = {id: ''};
			} else {
				this.ramp=lodash.find(ramps, function(ramp) {
					return ramp.id==base['ramp_id'];
				})
				if(this.ramp === undefined)
					this.ramp = {id: ''};
			}
		}

		this.toJSON=function(arg) {
			var flow={};

			// TODO do poprawy - jak jest mass fraction to jeszcze jeden typ nawiewu - volume / velocity / total ..
			if(this.flow.type=='massFlux') {
				flow={
					type:'massFlux',
					mass_flux:this.flow.mass_flux
				}
			} else if(this.flow.type=='massFraction') {
				flow={
					type:'massFraction',
					volume_flow:this.flow.volume_flow,
					volume_flow_per_hour:this.flow.volume_flow_per_hour
				}
			} else {
				flow={};
			}

			var spec_id;
			if(this.spec)
				spec_id = this.spec.id;
			else
				spec_id = "";

			var surf={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				color:this.color,
				spec_id:spec_id,
				flow: flow,
				massFractionFlow:this.mass_fraction_flow,
				heater:{
					active:this.heater.active,
					tmp_front:this.heater.tmp_front
				},
				louver:{
					active:this.louver.active,
					tangential1:this.louver.tangential1,
					tangential2:this.louver.tangential2
				},
				ramp_id:this.ramp.id
			}
			return surf; 
		}
	}

	return SurfSpecie;
}])
/*}}} */
/*{{{ Part */
.factory('Part', [ 'GlobalValues', 'lodash', 'Accessor', 'IdGenerator' ,function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Part(base) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';

		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.diameter=accessor.toReal(base['diameter']||def.part.diameter.value);
		this.set_diameter=function(arg){
			return accessor.setter(this, 'diameter', def.part.diameter, arg);
		}

		this.set_diameter_lib=function(arg){
			return accessor.setterLib(this, 'diameter', def.part.diameter, arg);
		}

		this.toJSON=function(arg) {
			var part={
				id:this.id,
				uuid:this.uuid,
				diameter:this.diameter
			}
			return part; 
		}

	}

	return Part;
}])
/*}}} */
/*{{{ Fire */
.factory('Fire', ['GlobalValues', 'lodash', 'Accessor', 'SurfFire', 'FireVent','IdGenerator', 'Calc', function(GlobalValues, lodash, Accessor, SurfFire, FireVent, IdGenerator, Calc) {
		
	// TODO: Michal jak zrobic przeliczenie Calc.ventChange przy zmianie xb venta -> aktualizacja surf'a hrr, itp.
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Fire(base, ramps) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		var self=this;

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;
		this.editable=accessor.toBool(base['editable'], true);

		this.surf=base['surf']||new SurfFire();
		if(base['surf']) {
			if(!ramps){
				this.surf=new SurfFire(base['surf']);
				this.surf.id = this.id;
			} else {
				this.surf=new SurfFire(base['surf'], ramps);
				this.surf.id = this.id;
			}
		} else {
			this.surf=new SurfFire();
			this.surf.id = this.id;
		}

		if(base['vent']) {
			this.vent=new FireVent(base['vent']);
		} else {
			this.vent=new FireVent();
		}

		this.totalHRR=function() {
			var area=Math.abs(this.vent.xb.x2-this.vent.xb.x1)*Math.abs(this.vent.xb.y2-this.vent.xb.y1);
			var hrrpua=0;
			if(this.surf.hrr.hrr_type=='hrrpua') {
				hrrpua=this.surf.hrr.value;
				this.surf.hrr.area = area;
			}
			return 1*area*hrrpua;
		}

		this.totalTime=function() {
			var time = (Math.sqrt(this.totalHRR() / this.surf.hrr.alpha)).toFixed(0);
			return time;
		}

		//this.set_x1=function(arg){
		//	this.vent.set_x1(arg);
		//	return accessor.setter(this, 'vent.xb.x1', def.vent.xb.value[0], arg);
		//}
		//this.set_x2=function(arg){
		//	this.vent.set_x2(arg);
		//	return accessor.calcSetter(self, 'vent.xb.x2', def.vent.xb.value[1], Calc.ventChange, {
		//		hrrpua: {obj:self, path:'surf.hrr.value', value:self.surf.hrr.value},
		//		alpha: {obj:self, path:'surf.hrr.alpha', value:self.surf.hrr.alpha},
		//		hrr: {obj:self, path:'surf.hrr.total_hrr', value:self.surf.hrr.total_hrr},
		//		spread_rate: {obj:self, path:'surf.hrr.spread_rate', value:self.surf.hrr.spread_rate},
		//		tauq: {obj:self, path:'surf.hrr.tau_q', value:self.surf.hrr.tau_q},
		//	}, arg);
		//	//return accessor.setter(this, 'vent.xb.x2', def.vent.xb.value[1], arg);
		//	//this.surf.hrr.set_value(self.surf.hrr.value);
		//}

		this.toJSON=function(arg) {
			var fire={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				editable:this.editable,
				surf:this.surf,
				vent:this.vent
			}
			return fire; 
		}
	}

	return Fire;
}])
/*}}} */
/*{{{ FireVent */
.factory('FireVent', ['GlobalValues', 'lodash', 'Accessor','IdGenerator', 'Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function FireVent(base) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		var self=this;

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';


		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;
		this.xb={};

		this.xb.x1=accessor.toReal(lodash.get(base, 'xb.x1', def.vent.xb.value[0]));
		this.set_x1=function(arg){
			return accessor.calcSetter(self, 'xb.x1', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.x1', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.x2', value:self.xb.x2},
				xyz: {obj:self, path:'xyz.x', value:self.xyz.x}
			}, arg);
		}
		this.set_x1_lib=function(arg){
			return accessor.calcSetter(self, 'xb.x1', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.x1', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.x2', value:self.xb.x2},
				xyz: {obj:self, path:'xyz.x', value:self.xyz.x}
			}, arg);
		}

		this.xb.x2=accessor.toReal(lodash.get(base, 'xb.x2', def.vent.xb.value[1]));
		this.set_x2=function(arg){
			return accessor.calcSetter(self, 'xb.x2', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.x2', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.x1', value:self.xb.x1},
				xyz: {obj:self, path:'xyz.x', value:self.xyz.x}
			}, arg);
		}
		this.set_x2_lib=function(arg){
			return accessor.calcSetter(self, 'xb.x2', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.x2', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.x1', value:self.xb.x1},
				xyz: {obj:self, path:'xyz.x', value:self.xyz.x}
			}, arg);
		}

		this.xb.y1=accessor.toReal(lodash.get(base, 'xb.y1', def.vent.xb.value[2]));
		this.set_y1=function(arg){
			return accessor.calcSetter(self, 'xb.y1', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.y1', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.y2', value:self.xb.y2},
				xyz: {obj:self, path:'xyz.y', value:self.xyz.y}
			}, arg);
		}
		this.set_y1_lib=function(arg){
			return accessor.calcSetter(self, 'xb.y1', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.y1', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.y2', value:self.xb.y2},
				xyz: {obj:self, path:'xyz.y', value:self.xyz.y}
			}, arg);
		}

		this.xb.y2=accessor.toReal(lodash.get(base, 'xb.y2', def.vent.xb.value[3]));
		this.set_y2=function(arg){
			return accessor.calcSetter(self, 'xb.y2', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.y2', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.y1', value:self.xb.y1},
				xyz: {obj:self, path:'xyz.y', value:self.xyz.y}
			}, arg);
		}
		this.set_y2_lib=function(arg){
			return accessor.calcSetter(self, 'xb.y2', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.y2', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.y1', value:self.xb.y1},
				xyz: {obj:self, path:'xyz.y', value:self.xyz.y}
			}, arg);
		}

		this.xb.z1=accessor.toReal(lodash.get(base, 'xb.z1', def.vent.xb.value[4]));
		this.set_z1=function(arg){
			return accessor.calcSetter(self, 'xb.z1', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.z1', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.z2', value:self.xb.z2},
				xyz: {obj:self, path:'xyz.z', value:self.xyz.z}
			}, arg);
		}
		this.set_z1_lib=function(arg){
			return accessor.calcSetter(self, 'xb.z1', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.z1', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.z2', value:self.xb.z2},
				xyz: {obj:self, path:'xyz.z', value:self.xyz.z}
			}, arg);
		}

		this.xb.z2=accessor.toReal(lodash.get(base, 'xb.z2', def.vent.xb.value[5]));
		this.set_z2=function(arg){
			return accessor.calcSetter(self, 'xb.z2', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.z2', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.z1', value:self.xb.z1},
				xyz: {obj:self, path:'xyz.z', value:self.xyz.z}
			}, arg);
		}
		this.set_z2_lib=function(arg){
			return accessor.calcSetter(self, 'xb.z2', def.vent.xb, Calc.xyz, {
				dim1: {obj:self, path:'xb.z2', value:Validator.normalizeReal(arg)*1},
				dim2: {obj:self, path:'xb.z1', value:self.xb.z1},
				xyz: {obj:self, path:'xyz.z', value:self.xyz.z}
			}, arg);
		}
		
		
		this.xyz={};

		this.xyz.x=accessor.toReal(lodash.get(base, 'xyz.x', def.vent.xyz.value[0]));
		this.set_x=function(arg){
			return accessor.setter(this, 'xyz.x', def.vent.xyz, arg);
		}
		this.xyz.y=accessor.toReal(lodash.get(base, 'xyz.y', def.vent.xyz.value[1]));
		this.set_y=function(arg){
			return accessor.setter(this, 'xyz.y', def.vent.xyz, arg);
		}
		this.xyz.z=accessor.toReal(lodash.get(base, 'xyz.z', def.vent.xyz.value[2]));
		this.set_z=function(arg){
			return accessor.setter(this, 'xyz.z', def.vent.xyz, arg);
		}

		this.toJSON=function(arg) {
			var vent={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				xb: {
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				},
				xyz: {
					x:this.xyz.x,
					y:this.xyz.y,
					z:this.xyz.z
				}
			}
			return vent; 
		}


	}

	return FireVent;
}])
/*}}} */
/*{{{ SurfFire */
.factory('SurfFire', [ 'GlobalValues', 'lodash', 'Accessor', 'IdGenerator', 'Calc', 'Validator', function(GlobalValues, lodash, Accessor, IdGenerator, Calc, Validator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function SurfFire(base, ramps) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';


		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.color=lodash.get(base, 'color', def.surf.color.value);
		this.set_color=function(arg){
			return accessor.setter(this, 'color', def.surf.color, arg);
		}
		this.set_color_lib=function(arg){
			return accessor.setterLib(this, 'color', def.surf.color, arg);
		}

		this.fire_type=base['fire_type']||'constant_hrr';


		var self=this;
		this.hrr={
			hrr_type:lodash.get(base, 'hrr.hrr_type', 'hrrpua'),
			value:accessor.toReal(lodash.get(base, 'hrr.value', def.surf.hrrpua.value)),
			set_value:function(arg){
				if((self.fire_type == 'radially_spreading' && self.hrr.hrr_type == 'hrrpua' && self.hrr.alpha != 0) || (self.fire_type == 'time_dependent_hrrpua' && self.hrr.time_function == 'tauq')){
					return accessor.calcSetter(self, 'hrr.value', def.surf.hrrpua, Calc.hrrChange, {
						hrrpua: {obj:self, path:'hrr.value', value:Validator.normalizeReal(arg)*1},
						alpha: {obj:self, path:'hrr.alpha', value:self.hrr.alpha},
						area: {obj:self, path:'hrr.area', value:self.hrr.area},
						spread_rate: {obj:self, path:'hrr.spread_rate', value:self.hrr.spread_rate},
						tauq: {obj:self, path:'hrr.tau_q', value:self.hrr.tau_q},
					}, arg);
				}
				else {
					return accessor.setter(this, 'value', defWiz.surf.hrr_value, arg);
				}
			},
			set_value_lib:function(arg){
				if((self.fire_type == 'radially_spreading' && self.hrr.hrr_type == 'hrrpua' && self.hrr.alpha != 0) || (self.fire_type == 'time_dependent_hrrpua' && self.hrr.time_function == 'tauq')){
					return accessor.calcSetter(self, 'hrr.value', def.surf.hrrpua, Calc.hrrChange, {
						hrrpua: {obj:self, path:'hrr.value', value:Validator.normalizeReal(arg)*1},
						alpha: {obj:self, path:'hrr.alpha', value:self.hrr.alpha},
						area: {obj:self, path:'hrr.area', value:self.hrr.area},
						spread_rate: {obj:self, path:'hrr.spread_rate', value:self.hrr.spread_rate},
						tauq: {obj:self, path:'hrr.tau_q', value:self.hrr.tau_q},
					}, arg);
				}
				else {
					return accessor.setter(this, 'value', defWiz.surf.hrr_value, arg);
				}
			},
			spread_rate:accessor.toReal(lodash.get(base, 'hrr.spread_rate', 0)),
			set_spread_rate:function(arg){
				return accessor.calcSetter(self, 'hrr.spread_rate', def.surf.spread_rate, Calc.spreadRateChange, {
					spread_rate: {obj:self, path:'hrr.spread_rate', value:Validator.normalizeReal(arg)*1},
					hrrpua: {obj:self, path:'hrr.value', value:self.hrr.value},
					alpha: {obj:self, path:'hrr.alpha', value:self.hrr.alpha},
					area: {obj:self, path:'hrr.area', value:self.hrr.area},
					tauq: {obj:self, path:'hrr.tau_q', value:self.hrr.tau_q},
				}, arg);
				//return accessor.setter(this, 'spread_rate', def.surf.spread_rate, arg);
			},
			set_spread_rate_lib:function(arg){
				return accessor.setterLib(this, 'spread_rate', def.surf.spread_rate, arg);
			},
			alpha:accessor.toReal(lodash.get(base, 'hrr.alpha', 0)),
			set_alpha:function(arg){
				return accessor.calcSetter(self, 'hrr.alpha', defWiz.surf.alpha, Calc.alphaChange, {
					hrrpua: {obj:self, path:'hrr.value', value:self.hrr.value},
					alpha: {obj:self, path:'hrr.alpha', value:Validator.normalizeReal(arg)*1},
					area: {obj:self, path:'hrr.area', value:self.hrr.area},
					spread_rate: {obj:self, path:'hrr.spread_rate', value:self.hrr.spread_rate},
					tauq: {obj:self, path:'hrr.tau_q', value:self.hrr.tau_q},
				}, arg);
			},
			set_alpha_lib:function(arg){
				return accessor.calcSetter(self, 'hrr.alpha', def.surf.spread_rate, Calc.alphaChange, {
					hrrpua: {obj:self, path:'hrr.value', value:self.hrr.value},
					alpha: {obj:self, path:'hrr.alpha', value:Validator.normalizeReal(arg)*1},
					area: {obj:self, path:'hrr.area', value:self.hrr.area},
					spread_rate: {obj:self, path:'hrr.spread_rate', value:self.hrr.spread_rate},
					tauq: {obj:self, path:'hrr.tau_q', value:self.hrr.tau_q},
				}, arg);
			},
			time_function:base['time_function']||'ramp',
			tau_q:accessor.toReal(lodash.get(base, 'hrr.tau_q', def.surf.tau_q.value)),
			set_tau_q:function(arg){
				return accessor.calcSetter(self, 'hrr.tau_q', def.surf.tau_q, Calc.tauqChange, {
					tauq: {obj:self, path:'hrr.tau_q', value:Validator.normalizeReal(arg)*1},
					hrrpua: {obj:self, path:'hrr.value', value:self.hrr.value},
					area: {obj:self, path:'hrr.area', value:self.hrr.area},
					alpha: {obj:self, path:'hrr.alpha', value:self.hrr.alpha},
				}, arg);
			},
			set_tau_q_lib:function(arg){
				return accessor.setterLib(this, 'tau_q', def.surf.tau_q.value, arg);
			},
		}
		if(base['hrr'])
			this.hrr.area=base['hrr']['area']||0;
		else
			this.hrr.area=0;


		// TODO: Przeliczenie spread rate i alpah po zmianie HRRPUA
		// TODO: Przeliczenie po zmianie spread rate

		// Jezeli jest z bazy danych bez id
		if(base['ramp_id'] == ''){
			this.ramp = {id: ''};
		} 
		// Jeeli kopiujemy z biblioteki
		else if(typeof base['ramp'] === 'object' && base['ramp'] != null) {
			this.ramp = base['ramp'];
		} 
		// Jezeli jest nazwa
		else {
			if(!ramps){
				this.ramp = {id: ''};
			} else {
				this.ramp=lodash.find(ramps, function(ramp) {
					return ramp.id==base['ramp_id'];
				})
				if(this.ramp === undefined)
					this.ramp = {id: ''};
			}
		}
		
		this.toJSON=function(arg) {
			var surf={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				color:this.color,
				fire_type:this.fire_type,
				hrr: {
					hrr_type:this.hrr.hrr_type,
					time_function:this.hrr.time_function,
					value:this.hrr.value,
					spread_rate:this.hrr.spread_rate,
					alpha:this.hrr.alpha,
					tau_q:this.hrr.tau_q,
				},
				ramp_id:this.ramp.id
			}
			return surf; 
		}
	
	}

	return SurfFire;
}])
/*}}} */
/*{{{ Combustion */
.factory('Combustion', [ 'GlobalValues', 'lodash', 'Accessor',  'IdGenerator', 'Fuel', function(GlobalValues, lodash, Accessor, IdGenerator, Fuel) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;
	var defSpec=GlobalValues.values.fds_object_enums.species;

	function Combustion(base, species) {
		if(!base) {
			base={};
		}

		if(!species){
			species={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';

		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;

		this.turnOnReaction=accessor.toBool(lodash.get(base, 'turnOnReaction', true));

		//this.fuel=(lodash.get(base, 'fuel')===undefined ? new Fuel(lodash.find(defSpec, function(spec) {
		//			return spec.value==defWiz.reac.spec.value;
		//		}), species) : lodash.map(base.fuel, function(fuel) {
		//			return new Fuel(fuel, species);
		//		}));

		this.fuel = new Fuel(base['fuel'], species);

		var self = this;

		this.changeFuel=function() {
			if(self.fuel.spec){
				if(self.fuel.spec.editable==false) {
					var spec=lodash.find(defSpec, function(spec) {
						return self.fuel.spec.id==spec.value;
					})
					console.log(spec);
					self.fuel=new Fuel(spec, species);

				} else {
					var spec=self.fuel.spec;
					self.fuel=new Fuel({spec:spec}, species);
					//self.fuel=new Fuel({spec:spec, formula: spec.formula}, species);
					//self.fires.combustion.fuel.formula=self.fires.fuel.formula.spec.formula;
				}
			} else {
				self.fuel.formula = def.reac.formula.value;
				self.fuel.c = def.reac.c.value;
				self.fuel.h = def.reac.h.value;
				self.fuel.o = def.reac.o.value;
				self.fuel.n = def.reac.n.value;
				self.fuel.heat_of_combustion = def.reac.heat_of_combustion.value;
				self.fuel.id = '';
			}
		}

		//if(!fires) {
		//	this.fires=base['fires']||[];
		//} else {
		//	this.fires=lodash.map(base['fires'], function(elem) {
		//		var fire=lodash.find(fires, function(fire) {
		//			return fire.id==elem;
		//		})

		//		return fire;

		//	})
		//
		//}
		//this.addFire=function() {
		//	this.fires.push({fire:{}});
		//};	
		//this.removeFire=function(index) {
		//	this.fires.splice(index,1);
		//}

		//this.toJSON=function(arg) {
		//	
		//	var fires=lodash.map(this.fires, function(fire) {
		//		return fire.fire.id;
		//	})
		//	var group={
		//		id:this.id,
		//		uuid:this.uuid,
		//		fires:fires
		//	}
		//	return group; 
		//}

	}

	return Combustion;
}])
/*}}} */
/*{{{ Fuel */
.factory('Fuel', [ 'GlobalValues', 'lodash', 'Accessor',  'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;
	var radcals=GlobalValues.values.enums.radcals;
	
	function Fuel(base, specs) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||base['label']||base['fuel']||def.reac.id.value;
		this.fuel=base['fuel'];
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;
		
		if(!specs) {
			this.spec=base['spec']||undefined;
		} else {
			if(base.editable==false) {
				this.spec=lodash.find(specs, function(spec) {
					return spec.id==base['value'];
				})

			} else {
				if(base) {
					this.spec=lodash.find(specs, function(spec) {
						return spec.id==base.value;
					})
				} else {
					this.spec = undefined;
				}
			}
		}
		
		this.formula=base['formula']||def.reac.formula.value;
		// Michal wylaczylem w partialsu set_formula bo nie mozna przypisac pustej '' wartosci
		this.set_formula=function(arg){
			return accessor.charSetter(this, 'formula', def.reac.formula, arg);
		}
		this.set_formula_lib=function(arg){
			return accessor.setterLib(this, 'formula', def.reac.formula, arg);
		}
		this.c=accessor.toReal(base['c']||def.reac.c.value);
		this.set_c=function(arg){
			return accessor.setter(this, 'c', def.reac.c, arg);
		}
		this.set_c_lib=function(arg){
			return accessor.setterLib(this, 'c', def.reac.c, arg);
		}

		this.o=accessor.toReal(base['o']||def.reac.o.value);
		this.set_o=function(arg){
			return accessor.setter(this, 'o', def.reac.o, arg);
		}
		this.set_o_lib=function(arg){
			return accessor.setterLib(this, 'o', def.reac.o, arg);
		}
		this.h=accessor.toReal(base['h']||def.reac.h.value);
		this.set_h=function(arg){
			return accessor.setter(this, 'h', def.reac.h, arg);
		}
		this.set_h_lib=function(arg){
			return accessor.setterLib(this, 'h', def.reac.h, arg);
		}
		this.n=accessor.toReal(base['n']||def.reac.n.value);
		this.set_n=function(arg){
			return accessor.setter(this, 'n', def.reac.n, arg);
		}
		this.set_n_lib=function(arg){
			return accessor.setterLib(this, 'n', def.reac.n, arg);
		}
		
		this.co_yield=accessor.toReal(base['co_yield']||def.reac.co_yield.value);
		this.set_co_yield=function(arg){
			return accessor.setter(this, 'co_yield', def.reac.co_yield, arg);
		}
		this.set_co_yield_lib=function(arg){
			return accessor.setterLib(this, 'co_yield', def.reac.co_yield, arg);
		}

		this.soot_yield=accessor.toReal(base['soot_yield']||def.reac.soot_yield.value);
		this.set_soot_yield=function(arg){
			return accessor.setter(this, 'soot_yield', def.reac.soot_yield, arg);
		}
		this.set_soot_yield_lib=function(arg){
			return accessor.setterLib(this, 'soot_yield', def.reac.soot_yield, arg);
		}
		this.heat_of_combustion=accessor.toReal(base['heat_of_combustion']||def.reac.heat_of_combustion.value);
		this.set_heat_of_combustion=function(arg){
			return accessor.setter(this, 'heat_of_combustion', def.reac.heat_of_combustion, arg);
		}
		this.set_heat_of_combustion_lib=function(arg){
			return accessor.setterLib(this, 'heat_of_combustion', def.reac.heat_of_combustion, arg);
		}
		this.radiative_fraction=accessor.toReal(base['radiative_fraction']||def.reac.radiative_fraction.value);
		this.set_radiative_fraction=function(arg){
			return accessor.setter(this, 'radiative_fraction', def.reac.radiative_fraction, arg);
		}
		this.set_radiative_fraction_lib=function(arg){
			return accessor.setterLib(this, 'radiative_fraction', def.reac.radiative_fraction, arg);
		}
		this.fuel_radcal_id=base['fuel_radcal_id']||def.reac.fuel_radcal_id.value;

		var self=this;
		this.fuel_radcal_id=lodash.find(radcals, function(element) {
			var id;
			if(base['fuel_radcal_id']!=undefined) {
				id=base['fuel_radcal_id'];
			} else if(self.spec && self.spec.editable==false && lodash.find(radcals, function(element) {return element.value==self.spec.id})) {
				id=self.spec.id;
			} else {
				id=def.reac.fuel_radcal_id.value;

			}
			return element.value==id;
		})['value']

		this.toJSON=function(arg) {
			var spec_id;
			if(this.spec)
				spec_id = this.spec.id;
			else
				spec_id = "";

			var fuel={
				fuel:this.id,
				uuid:this.uuid,
				formula:this.formula,
				spec:spec_id,
				c:this.c,
				o:this.o,
				h:this.h,
				n:this.n,
				radiative_fraction:this.radiative_fraction,
				soot_yield:this.soot_yield,
				co_yield:this.co_yield,
				heat_of_combustion:this.heat_of_combustion,
				fuel_radcal_id:this.fuel_radcal_id
			}
			return fuel; 
		}

	}

	return Fuel;
}])
/*}}} */
/*{{{ Ctrl */
.factory('Ctrl', [ 'GlobalValues', 'lodash', 'Accessor',  'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Ctrl(base) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';


		this.setId=accessor.setId;


		this.function_type=base['function_type']||def.ctrl.function_type.value;
		this.n=accessor.toInt(base['n']||def.ctrl.n.value);
		this.latch=accessor.toBool(base['latch'], def.ctrl.latch.value);

		this.inputs=base['inputs']||[];

		this.addInput=function() {
			this.inputs.push({id:{}});
		}

		this.removeInput=function(index) {
			this.inputs.splice(index, 1);
		}	


		this.toJSON=function(arg) {
			var inputs=lodash.map(this.inputs, function(input){
				return input.id;	
			});

			var ctrl={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				function_type:this.function_type,
				latch:this.latch,
				n:this.n,
				inputs:inputs
			}
			return ctrl; 
		}

	}

	return Ctrl;
}])
/*}}} */
/*{{{ Prop */
.factory('Prop', ['GlobalValues', 'lodash', 'Accessor',  'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;
	var smoke_detector_model=GlobalValues.values.enums.smokeDetectorModel;
	var cleary_params=GlobalValues.values.fds_object_enums.cleary;

	function Prop(base, ramps, parts) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.setId=accessor.setId;
		this.setId_lib=accessor.setIdLib;


		this.type=base['type']|| defWiz.prop.type.value;

		this.flow_type=base['type']|| "flowRate";

		this.activation_temperature=accessor.toReal(base['activation_temperature']||def.prop.activation_temperature.value);
		this.set_activation_temperature=function(arg){
			return accessor.setter(this, 'activation_temperature', def.prop.activation_temperature, arg);
		}
		this.set_activation_temperature_lib=function(arg){
			return accessor.setterLib(this, 'activation_temperature', def.prop.activation_temperature, arg);
		}

		this.initial_temperature=accessor.toReal(base['initial_temperature']||def.prop.initial_temperature.value);
		this.set_initial_temperature=function(arg){
			return accessor.setter(this, 'initial_temperature', def.prop.initial_temperature, arg);
		}
		this.set_initial_temperature_lib=function(arg){
			return accessor.setterLib(this, 'initial_temperature', def.prop.initial_temperature, arg);
		}

		this.rti=accessor.toReal(base['rti']||def.prop.rti.value);
		this.set_rti=function(arg){
			return accessor.setter(this, 'rti', def.prop.rti, arg);
		}
		this.set_rti_lib=function(arg){
			return accessor.setterLib(this, 'rti', def.prop.rti, arg);
		}

		/*
		this.path_length=base['path_length']||def.prop.path_length.value;
		this.set_path_length=function(arg){
			return accessor.setter(this, 'path_length', def.prop.path_length, arg);
		}
		*/
		
		this.smoke_detector_model=base['smoke_detector_model'] || defWiz.prop.smoke_detector_model.value;
		
		this.smoke_detector_model_type=base['smoke_detector_model_type'] || defWiz.prop.smoke_detector_model_type.value;

		var self=this;
		this.cleary_params=lodash.clone(lodash.find(cleary_params, function(model){
			return model.value==self.smoke_detector_model_type;
		}) );
		
		this.activation_obscuration=accessor.toReal(base['activation_obscuration']||def.prop.activation_obscuration.value);
		this.set_activation_obscuration=function(arg){
			return accessor.setter(this, 'activation_obscuration', def.prop.activation_obscuration, arg);
		}
		this.set_activation_obscuration_lib=function(arg){
			return accessor.setterLib(this, 'activation_obscuration', def.prop.activation_obscuration, arg);
		}

		this.path_length=accessor.toReal(base['path_length']||def.prop.path_length.value);
		this.set_path_length=function(arg){
			return accessor.setter(this, 'path_length', def.prop.path_length, arg);
		}
		
		this.set_path_length_lib=function(arg){
			return accessor.setterLib(this, 'path_length', def.prop.path_length, arg);
		}

		this.change_smoke_detector_model_type=function() {

			var type=this.smoke_detector_model_type;
			this.cleary_params= lodash.clone(lodash.find(cleary_params, function(model){
				return model.value==type;
			}));
		}
		
		this.set_alpha_e=function(arg){
			return accessor.setter(this, 'cleary_params.alpha_e', def.prop.alpha_e, arg);
		}
		
		this.set_beta_e=function(arg){
			return accessor.setter(this, 'cleary_params.beta_e', def.prop.beta_e, arg);
		}
		
		this.set_alpha_c=function(arg){
			return accessor.setter(this, 'cleary_params.alpha_c', def.prop.alpha_c, arg);
		}

		this.set_beta_c=function(arg){
			return accessor.setter(this, 'cleary_params.beta_c', def.prop.beta_c, arg);
		}
		
		this.offset=accessor.toReal(base['offset']||def.prop.offset.value);
		this.set_offset=function(arg){
			return accessor.setter(this, 'offset', def.prop.offset, arg);
		}
		this.set_offset_lib=function(arg){
			return accessor.setterLib(this, 'offset', def.prop.offset, arg);
		}

		this.flow_rate=accessor.toReal(base['flow_rate']||def.prop.flow_rate.value);
		this.set_flow_rate=function(arg){
			return accessor.setter(this, 'flow_rate', def.prop.flow_rate, arg);
		}
		this.set_flow_rate_lib=function(arg){
			return accessor.setterLib(this, 'flow_rate', def.prop.flow_rate, arg);
		}

		this.mass_flow_rate=accessor.toReal(base['mass_flow_rate']||def.prop.mass_flow_rate.value);
		this.set_mass_flow_rate=function(arg){
			return accessor.setter(this, 'mass_flow_rate', def.prop.mass_flow_rate, arg);
		}
		this.set_mass_flow_rate_lib=function(arg){
			return accessor.setterLib(this, 'mass_flow_rate', def.prop.mass_flow_rate, arg);
		}

		this.operating_pressure=accessor.toReal(base['operating_pressure']||def.prop.operating_pressure.value);
		this.set_operating_pressure=function(arg){
			return accessor.setter(this, 'operating_pressure', def.prop.operating_pressure, arg);
		}
		this.set_operating_pressure_lib=function(arg){
			return accessor.setterLib(this, 'operating_pressure', def.prop.operating_pressure, arg);
		}

		this.k_factor=accessor.toReal(base['k_factor']||def.prop.k_factor.value);
		this.set_k_factor=function(arg){
			return accessor.setter(this, 'k_factor', def.prop.k_factor, arg);
		}
		this.set_k_factor_lib=function(arg){
			return accessor.setterLib(this, 'k_factor', def.prop.k_factor, arg);
		}

		this.orifice_diameter=accessor.toReal(base['orifice_diameter']||def.prop.orifice_diameter.value);
		this.set_orifice_diameter=function(arg){
			return accessor.setter(this, 'orifice_diameter', def.prop.orifice_diameter, arg);
		}
		this.set_orifice_diameter_lib=function(arg){
			return accessor.setterLib(this, 'orifice_diameter', def.prop.orifice_diameter, arg);
		}

		this.c_factor=accessor.toReal(base['c_factor']||def.prop.c_factor.value);
		this.set_c_factor=function(arg){
			return accessor.setter(this, 'c_factor', def.prop.c_factor, arg);
		}
		this.set_c_factor_lib=function(arg){
			return accessor.setterLib(this, 'c_factor', def.prop.c_factor, arg);
		}

		this.particle_velocity=accessor.toReal(base['particle_velocity']||def.prop.particle_velocity.value);
		this.set_particle_velocity=function(arg){
			return accessor.setter(this, 'particle_velocity', def.prop.particle_velocity, arg);
		}
		this.set_particle_velocity_lib=function(arg){
			return accessor.setterLib(this, 'particle_velocity', def.prop.particle_velocity, arg);
		}

		this.addAngle=function(sp1,sp2) {
			this.spray_angle.push({
				sp1: sp1||0,
				set_sp1:function(arg) {
					return accessor.setter(this, 'sp1', def.prop.spray_angle.value[0] , arg);
				},
				set_sp2:function(arg) {
					return accessor.setter(this, 'sp2', def.prop.spray_angle.value[1] , arg);
				},
				sp2: sp2||0,
			});
		}
		if(base['spray_angle'] && base['spray_angle'].length>0) {
			this.spray_angle=[];
			var self=this;	
			lodash.each(base['spray_angle'], function(spray_angle) {
				self.addAngle(spray_angle.sp1*1, spray_angle.sp2*1);	
			});
		} else {
			this.spray_angle=[];
			this.addAngle(def.prop.spray_angle.value[0], def.prop.spray_angle.value[1]);
		}

		this.removeAngle=function(index) {
			this.spray_angle.splice(index, 1);
		};

		this.spray_pattern_shape=base['spray_pattern_shape']|| "gaussian";

		this.spray_pattern_mu=accessor.toInt(base['spray_pattern_mu']||def.prop.spray_pattern_mu.value);
		this.set_spray_pattern_mu=function(arg){
			return accessor.setter(this, 'spray_pattern_mu', def.prop.spray_pattern_mu, arg);
		}
		this.set_spray_pattern_mu_lib=function(arg){
			return accessor.setterLib(this, 'spray_pattern_mu', def.prop.spray_pattern_mu, arg);
		}

		this.spray_pattern_beta=accessor.toInt(base['spray_pattern_beta']||def.prop.spray_pattern_beta.value);
		this.set_spray_pattern_beta=function(arg){
			return accessor.setter(this, 'spray_pattern_beta', def.prop.spray_pattern_beta, arg);
		}
		this.set_spray_pattern_beta_lib=function(arg){
			return accessor.setterLib(this, 'spray_pattern_beta', def.prop.spray_pattern_beta, arg);
		}

		this.spray_angle1=accessor.toReal(base['spray_angle1']||def.prop.spray_angle.value[0]);
		this.set_spray_angle1=function(arg){
			return accessor.setter(this, 'spray_angle1', def.prop.spray_angle, arg);
		}
		this.set_spray_angle1_lib=function(arg){
			return accessor.setterLib(this, 'spray_angle1', def.prop.spray_angle, arg);
		}
	
		this.spray_angle2=accessor.toReal(base['spray_angle1']||def.prop.spray_angle.value[1]);
		this.set_spray_angle2=function(arg){
			return accessor.setter(this, 'spray_angle2', def.prop.spray_angle, arg);
		}
		this.set_spray_angle2_lib=function(arg){
			return accessor.setterLib(this, 'spray_angle2', def.prop.spray_angle, arg);
		}

		this.smokeview_id=base['smokeview_id']||def.prop.smokeview_id.value;
		
		if(!ramps) {
			this.pressure_ramp=base['pressure_ramp']||{};
		} else {
			this.pressure_ramp=lodash.find(ramps, function(ramp) {
				return ramp.id==base['pressure_ramp'];
			})
		}

		if(!parts) {
			this.part_id=base['part_id']||{};
		} else {
			this.part_id=lodash.find(parts, function(part) {
				return part.id==base['part_id'];
			})

		}

		this.toJSON=function(arg) {
			var prop={
				id:this.id,
				uuid:this.uuid,
				quantity:this.quantity,
				activation_temperature:this.activation_temperature,
				initial_temperature:this.initial_temperature,
				rti:this.rti,
				activation_obscuration:this.activation_obscuration,
				offset:this.offset,
				flow_type:this.flow_type,
				flow_rate:this.flow_rate,
				mass_flow_rate:this.mass_flow_rate,
				operating_pressure:this.operating_pressure,
				orifice_diameter:this.orifice_diameter,
				c_factor:this.c_factor,
				k_factor:this.k_factor,
				particle_velocity:this.particle_velocity,
				spray_angle:this.spray_angle,
				spray_angle1:this.spray_angle1,
				spray_angle2:this.spray_angle2,
				pressure_ramp:this.pressure_ramp.id,
				part_id:this.part_id.id,
				smokeview_id:this.smokeview_id
			}
			return prop; 
		}


	}

	return Prop;
}])
/*}}} */
/*{{{ Devc */
.factory('Devc', ['GlobalValues', 'lodash', 'Accessor',  'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Devc(base, props, specs, parts) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.idAC=base['idAC']||'';


		this.setId=accessor.setId;
		this.setId_lib=accessor.setId;

		this.type=base['type']||defWiz.devc.type.value;
		this.geometrical_type=base['geometrical_type']||defWiz.devc.geometrical_type.value;

		this.quantity_type=base['quantity_type']||'';

		if(!specs) {
			this.quantity=base['quantity']||GlobalValues.values.enums.devcQuantity[0];
		} else {
			this.quantity=lodash.find(GlobalValues.values.enums.devcQuantity, function(elem) {
				return elem.quantity==base['quantity']
			})
		}


		if(base['quantity'] && (accessor.toBool(base.quantity.spec)==true)) {
			if(!specs) {
				this.spec_id=base['spec_id']||{};
			} else {
				var specie=lodash.find(specs, function(elem) {
					return elem.id==spec;
				})

				this.spec_id=specie;
			}
		}

		if(base['quantity'] && (accessor.toBool(base.quantity.part)==true)) {
			if(!parts) {
				this.part_id=base['part_id']||{};
			} else {
				var part=lodash.find(parts, function(elem) {
					return elem.id==part;
				})

				this.part_id=part;
			}
		}

		if(base['prop_id']) {
			if(!props) {
				this.prop_id=base['prop_id']||{};
			} else {
				var prop=lodash.find(props, function(elem) {
					return elem.id==prop;
				})

				this.prop_id=prop;
			}
		}


		this.setpoint=accessor.toReal(base['setpoint']||def.devc.setpoint.value);
		this.set_setpoint=function(arg){
			return accessor.setter(this, 'setpoint', def.devc.setpoint, arg);
		}
		this.set_setpoint_lib=function(arg){
			return accessor.setterLib(this, 'setpoint', def.devc.setpoint, arg);
		}

		this.initial_state=accessor.toBool(base['initial_state']||def.devc.initial_state.value);
		this.latch=accessor.toBool(base['latch']||def.devc.latch.value);
		this.trip_direction=accessor.toInt(base['trip_direction']||def.devc.trip_direction.value);
		
		this.smoothing_factor=accessor.toReal(base['smoothing_factor']||def.devc.smoothing_factor.value);
		this.set_smoothing_factor=function(arg){
			return accessor.setter(this, 'smoothing_factor', def.devc.smoothing_factor, arg);
		}
		this.set_smoothing_factor_lib=function(arg){
			return accessor.setterLib(this, 'smoothing_factor', def.devc.smoothing_factor, arg);
		}
	
		this.xb={
			x1:lodash.get(base, 'xb.x1', def.devc.xb.value[0]),
			set_x1:function(arg){
				return accessor.setter(this, 'x1', def.devc.xb, arg);
			},
			set_x1_lib:function(arg){
				return accessor.setterLib(this, 'x1', def.devc.xb, arg);
			},
			x2:lodash.get(base, 'xb.x2', def.devc.xb.value[1]),
			set_x2:function(arg){
				return accessor.setter(this, 'x2', def.devc.xb, arg);
			},
			set_x2_lib:function(arg){
				return accessor.setterLib(this, 'x2', def.devc.xb, arg);
			},
			y1:lodash.get(base, 'xb.y1', def.devc.xb.value[2]),
			set_y1:function(arg){
				return accessor.setter(this, 'y1', def.devc.xb, arg);
			},
			set_y1_lib:function(arg){
				return accessor.setterLib(this, 'y1', def.devc.xb, arg);
			},
			y2:lodash.get(base, 'xb.y2', def.devc.xb.value[3]),
			set_y2:function(arg){
				return accessor.setter(this, 'y2', def.devc.xb, arg);
			},
			set_y2_lib:function(arg){
				return accessor.setterLib(this, 'y2', def.devc.xb, arg);
			},
			z1:lodash.get(base, 'xb.z1', def.devc.xb.value[4]),
			set_z1:function(arg){
				return accessor.setter(this, 'z1', def.devc.xb, arg);
			},
			set_z1_lib:function(arg){
				return accessor.setterLib(this, 'z1', def.devc.xb, arg);
			},
			z2:lodash.get(base, 'xb.z2', def.devc.xb.value[5]),
			set_z2:function(arg){
				return accessor.setter(this, 'z2', def.devc.xb, arg);
			},
			set_z2_lib:function(arg){
				return accessor.setterLib(this, 'z2', def.devc.xb, arg);
			}
		};

		this.xyz={
			x:accessor.toReal(lodash.get(base, 'xyz.x', def.devc.xyz.value[0])),
			set_x:function(arg){
				return accessor.setter(this, 'x', def.devc.xyz, arg);
			},
			set_x_lib:function(arg){
				return accessor.setterLib(this, 'x', def.devc.xyz, arg);
			},
			y:accessor.toReal(lodash.get(base, 'xyz.y', def.devc.xyz.value[1])),
			set_y:function(arg){
				return accessor.setter(this, 'y', def.devc.xyz, arg);
			},
			set_y_lib:function(arg){
				return accessor.setterLib(this, 'y', def.devc.xyz, arg);
			},
			z:accessor.toReal(lodash.get(base, 'xyz.z', def.devc.xyz.value[2])),
			set_z:function(arg){
				return accessor.setter(this, 'z', def.devc.xyz, arg);
			},
			set_z_lib:function(arg){
				return accessor.setter(this, 'z', def.devc.xyz, arg);
			},
		};

		this.statistics={
			integral_lower:accessor.toReal(lodash.get(base, 'statistics.integral_lower', def.devc.quantity_range.value[0])),
			integral_upper:accessor.toReal(lodash.get(base, 'statistics.integral_upper', def.devc.quantity_range.value[1])),
			set_integral_lower:function(arg) {
				return accessor.setter(this, 'integral_lower', def.devc.quantity_range, arg);
			},
			set_integral_upper:function(arg) {
				return accessor.setter(this, 'integral_upper', def.devc.quantity_range, arg);
			},
			set_integral_lower_lib:function(arg) {
				return accessor.setterLib(this, 'integral_lower', def.devc.quantity_range, arg);
			},
			set_integral_upper_lib:function(arg) {
				return accessor.setterLib(this, 'integral_upper', def.devc.quantity_range, arg);
			},
		}
		if(base['statistics']) {
			this.statistics.statistics=base['statistics']['statistics']||"";
		} else {
			this.statistics.statistics="";
		}

		this.toJSON=function(arg) {
			var self=this;	
			var devc={
				id:this.id,
				uuid:this.uuid,
				idAC:this.idAC,
				type:this.type,
				geometrical_type:this.geometrical_type,
				quantity_type:this.quantity_type,
				quantity:this.quantity.quantity,
				prop_id:lodash.get(self, 'prop_id.id', undefined),
				setpoint:this.setpoint,
				initial_state:this.initial_state,
				latch:this.latch,
				trip_direction:this.trip_direction,
				spec_id:lodash.get(self, 'spec_id.id', undefined),
				part_id:lodash.get(self, 'part_id.id', undefined),
				xb:{
					x1:this.xb.x1,
					x2:this.xb.x2,
					y1:this.xb.y1,
					y2:this.xb.y2,
					z1:this.xb.z1,
					z2:this.xb.z2
				},
				xyz:{
					x:this.xyz.x,
					y:this.xyz.y,
					z:this.xyz.z
				},
				statistics:this.statistics
			}
			return devc; 
		}
	}
	return Devc;
}])
/*}}} */
/*{{{ Bndf */
.factory('Bndf', ['GlobalValues', 'lodash', 'Accessor',  'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Bndf(base, specs, parts) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		this.label=base['label']||'';
		
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.setId=accessor.setId;

		this.marked=accessor.toBool(base['marked'], false);

		this.quantity=base['quantity']||undefined;

		if(accessor.toBool(base.part)==true) {
			this.part=true;
			if(!parts) {
				this.parts=base['parts']||[];
			} else {
				this.parts=lodash.map(base['parts'], function(part) {
					
					var particle=lodash.find(parts, function(elem) {
						return elem.id==part;
					})

					return {part:particle};
				})
			}
		}

		if(accessor.toBool(base.spec)==true) {
			this.spec=true;
			if(!specs) {
				this.specs=base['specs']||[];
			} else {
				this.specs=lodash.map(base['specs'], function(spec) {
					
					var specie=lodash.find(specs, function(elem) {
						return elem.id==spec;
					})

					return {spec:specie};
				})
			}
		}
		this.addSpec=function() {
			if(this.specs) {
				this.specs.push({spec:{}});
			}
		}
		this.removeSpec=function(index) {
			if(this.specs) {
				this.specs.splice(index,1);
			}
		}

		this.addPart=function() {
			if(this.parts) {
				this.parts.push({part:{}});
			}
		}
		this.removePart=function(index) {
			if(this.parts) {
				this.parts.splice(index,1);
			}
		}

		this.toJSON=function(arg) {
			var specs;
			var parts;
			if(this.specs && this.specs.length>0) {
				specs=lodash.map(this.specs, function(spec) {
					return spec.spec.id;
				})
			} else {
				specs=undefined;
			}
			
			if(this.parts && this.parts.length>0) {
				parts=lodash.map(this.parts, function(part) {
					return part.part.id;
				})
			} else {
				parts=undefined;
			}

			var bndf={
				id:this.id,
				uuid:this.uuid,
				quantity:this.quantity,
				marked:this.marked,
				label:this.label,
				spec:this.spec,
				part:this.part,
				specs:specs,
				parts:parts
			}
			return bndf; 
		}
	}

	return Bndf;
}])
/*}}} */
/*{{{ Isof */
.factory('Isof', ['GlobalValues', 'lodash', 'Accessor',  'IdGenerator', function(GlobalValues, lodash, Accessor, IdGenerator) {
		
	var def=GlobalValues.values.defaults.ampers;
	var defWiz=GlobalValues.values.defaults.wiz;

	function Isof(base, specs) {
		if(!base) {
			base={};
		}

		var accessor=new Accessor();

		this.id=base['id']||'';
		
		this.uuid=base['uuid']|| IdGenerator.genUUID();
		this.setId=accessor.setId;

		if(!specs) {
			this.quantity=base['quantity']||{};
		} else {
			this.quantity=lodash.find(GlobalValues.values.enums.isofQuantity, function(elem) {
				return elem.quantity==base['quantity']
			})
		}


		if(base['quantity'] && (accessor.toBool(base.quantity.spec)==true)) {
			if(!specs) {
				this.spec_id=base['spec_id']||{};
			} else {
				var specie=lodash.find(specs, function(elem) {
					return elem.id==spec;
				})

				this.spec_id=specie;
			}
		}

		this.values=base['values']||[];

		if(base['values'] && base['values'].length>0 && this.quantity && this.quantity!={}) {
			var self=this;
			lodash.each(base['values'], function(value) {
				self.values.push({value:self.quantity.validator.value, set_value:function(arg) {
					return accessor.setter(this, 'value', self.quantity.validator, arg);
				}});	
			})
		} else {
			this.values=[];
		}

		this.addValue=function() {
			if(this.quantity && this.quantity!={}) {
				var self=this;
				this.values.push({value:self.quantity.validator.value, set_value:function(arg) {
					return accessor.setter(this, 'value', self.quantity.validator, arg);
				}});	
			}
		}

		this.removeValue=function(index) {
			this.values.splice(index, 1);	
		}

		this.toJSON=function(arg) {
			var self=this;
			var values=lodash.map(this.values, function(value) {
				return value.value;
			})
		
			var isof={
				id:this.id,
				uuid:this.uuid,
				quantity:this.quantity.quantity,
				values:values,
				spec_id:lodash.get(self, 'spec_id.id', undefined)
			}
			return isof; 
		}


	}

	return Isof;
}])
/*}}} */
