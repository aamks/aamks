angular.module('wf-library.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-list.service'])
.factory('Library', ['GlobalValues', 'lodash', 'Validator', 'Mesh', 'Matl', 'Surf', 'Obst', 'Ramp', 'Specie', 'Part', 'Vent', 'SurfVent', 'Jetfan', 'Fire', 'Fuel', 'Prop', 'Devc', 'Ctrl', 'Bndf', 'Slcf', 'Accessor', 'IdGenerator', function(Globals, lodash, Validator, Mesh, Matl, Surf, Obst, Ramp, Specie, Part, Vent, SurfVent, Jetfan, Fire, Fuel, Prop, Devc, Ctrl, Bndf, Slcf, Accessor, IdGenerator) {//{{{
	
	function Library(base) {

		var def=Globals.values.defaults.ampers;
		var defSpec=Globals.values.fds_object_enums.species;

		var accessor=new Accessor();

		if(!base) {
			base={};
		}

		// Konstruktory	//{{{
		var self=this;
		this.ramps=lodash.get(base, 'ramps')===undefined ? []: lodash.map(base.ramps, function(ramp) {
			return new Ramp(ramp);	
		});

		this.species=(lodash.get(base, 'species.species')===undefined ? lodash.map(defSpec, function(specie) {
			specie['editable']=false;
			specie['id']=specie['value'];
			return new Specie(specie);
			}) : lodash.map(base.species.species, function(specie) {
				return new Specie(specie);	
		}));
		
		this.speciesurfs=lodash.get(base, 'speciesurfs')===undefined ? []: lodash.map(base.speciesurfs, function(speciesurf) {
			return new SurfSpecie(speciesurf, self.ramps);

		});

		this.parts=lodash.get(base, 'parts')===undefined ? []: lodash.map(base.parts, function(part) {
			return new Part(part);	
		});

		this.props=lodash.get(base, 'props')===undefined ? []: lodash.map(base.props, function(prop) {
			return new Prop(prop, self.ramps, self.parts);

		});

		this.matls=lodash.get(base, 'matls')===undefined ? []: lodash.map(base.matls, function(matl) {
			return new Matl(matl, self.ramps);

		});

		this.surfs=lodash.get(base, 'surfs')===undefined ? []: lodash.map(base.surfs, function(surf) {
			return new Surf(surf, self.matls);

		});
	
		this.fires=lodash.get(base, 'fires')===undefined ? []: lodash.map(base.fires, function(fire) {
			return new Fire(fire, self.ramps);

		});

		this.ventsurfs=lodash.get(base, 'ventsurfs')===undefined ? []: lodash.map(base.ventsurfs, function(ventsurf) {
			return new SurfVent(ventsurf, self.ramps);

		});

		this.jetfans=lodash.get(base, 'jetfans')===undefined ? []: lodash.map(base.jetfans, function(jetfan) {
			return new Jetfan(jetfan, self.ramps);

		});

		this.fuels=lodash.get(base, 'fuels')===undefined ? []: lodash.map(base.fuels, function(fuels) {
			return new Fuel(fuel);

		});

		this.slcfs=lodash.get(base, 'slcfs')===undefined ? []: lodash.map(base.slcfs, function(slcf) {
			return new Slcf(slcf);

		});

		this.devcs=lodash.get(base, 'devcs')===undefined ? []: lodash.map(base.devcs, function(devc) {
			return new Devc(devc);

		});
//}}}
		// Importers//{{{
		// funkcje importujace z biblioteki do pliku, zgodnie z ustalonymi regulami
		this.importers={};
		var self=this;
		// ramp_import//{{{
		this.importers.ramp_import=function(rampItem, rampList) {

			// Nie wrzucaj rampa jezeli juz istnieje o takiej nazwie ...
			//var ramp=lodash.find(rampList, function(ramp){
			//	return ramp.id==rampItem.id
			//});

			var tempRamp=new Ramp(rampItem);
			tempRamp.id=IdGenerator.genImportId(tempRamp, rampList);

			return tempRamp;
		}
		//}}}
		// matl_import//{{{
		this.importers.matl_import=function(matlItem, matlList, rampList, libRampList) {
	
			// nadanie ID	
			var tempMatl=new Matl(matlItem);
			tempMatl.id=IdGenerator.genImportId(tempMatl, matlList);

			// sprawdzenie, jakie rampy z bilioteki sa uzywane i ich import do pliku
			var conductivity_ramp={};
			var specific_heat_ramp={};

			if(matlItem['conductivity_ramp'] && matlItem['conductivity_ramp']['id']) {
				var tempConductivityRamp=new Ramp(self.importers.ramp_import(matlItem['conductivity_ramp'], rampList));
				rampList.push(tempConductivityRamp);	
				tempMatl.conductivity_ramp=tempConductivityRamp;
			}
			if(matlItem['specific_heat_ramp'] && matlItem['specific_heat_ramp']['id']) {
				var tempSpecificHeatRamp=new Ramp(self.importers.ramp_import(matlItem['specific_heat_ramp'], rampList));
				rampList.push(tempSpecificHeatRamp);
				tempMatl.specific_heat_ramp=tempSpecificHeatRamp;
			}

			return tempMatl;
		}
		//}}}
		// surf_import//{{{
		this.importers.surf_import=function(surfItem, surfList, matlList, libMatlList, rampList, libRampList) {
	
			// nadanie ID	
			var tempSurf=new Surf(surfItem);
			tempSurf.id=IdGenerator.genImportId(tempSurf, surfList);

			// sprawdzanie czy sa warstwy
			if(surfItem['layers']){
				lodash.each(surfItem['layers'], function(layer) {
					// sprawdzanie czy sa materialy
					if(layer.materials){
						lodash.each(layer.materials, function(material){
							// Wyszukaj czy juz nie istnieje na liscie taki material
							var matl=lodash.find(matlList, function(matl){
								return matl.id==material.material.id
							});

							if(matl===undefined){
								var tempMatl=self.importers.matl_import(material.material, matlList, rampList, libRampList); 
								matlList.push(tempMatl);
							}
						});
					}
				});
			}
			return tempSurf;
		}
		//}}}
		// ventsurf_import//{{{
		this.importers.surfvent_import=function(surfItem, surfList, rampList, libRampList) {
	
			// nadanie ID	
			var tempSurf=new SurfVent(surfItem);
			tempSurf.id=IdGenerator.genImportId(tempSurf, surfList);

			// sprawdzenie, jakie rampy z bilioteki sa uzywane i ich import do pliku
			var ramp={};

			if(surfItem['ramp'] && surfItem['ramp']['id']) {
				var tempRamp=new Ramp(self.importers.ramp_import(surfItem['ramp'], rampList));
				rampList.push(tempRamp);	
				tempSurf.ramp=tempRamp;
			}
			return tempSurf;
		}
		//}}}
		// jetfan_import//{{{
		this.importers.jetfan_import=function(jetfanItem, jetfanList, rampList, libRampList) {
	
			// nadanie ID	
			var tempJetfan=new Jetfan(jetfanItem);
			tempJetfan.id=IdGenerator.genImportId('jetfan', jetfanList);

			// sprawdzenie, jakie rampy z bilioteki sa uzywane i ich import do pliku
			var ramp={};

			if(jetfanItem['ramp'] && jetfanItem['ramp']['id']) {

				// Wyszukaj czy juz nie istnieje na liscie taki ramp
				var ramp=lodash.find(rampList, function(ramp){
					return ramp.id==jetfanItem.ramp.id
				});
		
				if(ramp===undefined){
					var tempRamp=new Ramp(self.importers.ramp_import(jetfanItem['ramp'], rampList));
					rampList.push(tempRamp);	
					tempJetfan.ramp=tempRamp;
				} else {
					tempJetfan.ramp=ramp;
				}
			}

			return tempJetfan;
		}
		//}}}
		// fire_import//{{{
		this.importers.fire_import=function(fireItem, fireList, rampList, libRampList) {
	
			// nadanie ID	
			var tempFire=new Fire(fireItem);
			tempFire.id=IdGenerator.genImportId(tempFire, fireList);

			// sprawdzenie, jakie rampy z bilioteki sa uzywane i ich import do pliku
			var ramp={};

			if(fireItem['surf']['ramp'] && fireItem['surf']['ramp']['id']) {
				var tempRamp=new Ramp(self.importers.ramp_import(fireItem['surf']['ramp'], rampList));
				rampList.push(tempRamp);	
				tempFire.ramp=tempRamp;
			}

			return tempFire;
		}
		//}}}
		// slcf_import//{{{
		this.importers.slcf_import=function(slcfItem, slcfList) {
		
			var tempSlcf=new Slcf(slcfItem);
			tempSlcf.id=IdGenerator.genImportId(tempSlcf, slcfList);

			return tempSlcf;
		}
		//}}}
		// devc_import//{{{
		this.importers.devc_import=function(devcItem, devcList) {
		
			var tempDevc=new Devc(devcItem);
			tempDevc.id=IdGenerator.genImportId(tempDevc, devcList);

			return tempDevc;
		}
		//}}}
		// spec_import//{{{
		this.importers.spec_import=function(specItem, specList) {
		
			var tempSpec=new Specie(specItem);
			tempSpec.id=IdGenerator.genImportId(tempSpec, specList);

			return tempSpec;
		}
		//}}}
		//}}}
		// Exporters//{{{
		this.exporters={


		};
//}}}
		// Removers//{{{
		this.removers={
			ramp_prompt:function(index) {
				var ramp=self.ramps[index];

				var matls=lodash.filter(self.matls, function(matl) {
					return (ramp.id==matl['conductivity_ramp'].id || ramp.id==matl['specific_heat_ramp'].id)
				})

				var ventsurfs=lodash.filter(self.ventsurfs, function(surf) {
					return ramp.id==surf['ramp'].id;
				})

				var speciesurfs=lodash.filter(self.speciesurfs, function(surf) {
					return ramp.id==surf['ramp'].id;
				})

				var jetfans=lodash.filter(self.jetfans, function(jetfan) {
					return ramp.id==jetfan['ramp'].id;
				})

				var fires=lodash.filter(self.fires, function(fire) {
					return ramp.id==lodash.get(fire, "surf.ramp.id", undefined)
				})

				var props=lodash.filter(self.props, function(prop) {
					return ramp.id==lodash.get(prop, "pressure_ramp.id", undefined)
				})

				elements={
					matls:matls,
					ventsurfs:ventsurfs,
					speciesurfs:speciesurfs,
					jetfans:jetfans,
					fires:fires,
					props:props
				}

				return elements;
			},
			ramp_remove:function(index) {
				var ramp=self.ramps[index];

				var matls=lodash.filter(self.matls, function(matl) {
					return (ramp.id==matl['conductivity_ramp'].id || ramp.id==matl['specific_heat_ramp'].id)
				})

				var ventsurfs=lodash.filter(self.ventsurfs, function(surf) {
					return ramp.id==surf['ramp'].id;
				})

				var speciesurfs=lodash.filter(self.speciesurfs, function(surf) {
					return ramp.id==surf['ramp'].id;
				})

				var jetfans=lodash.filter(self.jetfans, function(jetfan) {
					return ramp.id==jetfan['ramp'].id;
				})

				var fires=lodash.filter(self.fires, function(fire) {
					return ramp.id==lodash.get(fire, "surf.ramp.id", undefined)
				})

				var props=lodash.filter(self.props, function(prop) {
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

				lodash.each(speciesurfs, function(surf) {
					surf.ramp={};
				})

				lodash.each(jetfans, function(jetfan) {
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
				var matl=self.matls[index];
				var surfs=lodash.filter(self.surfs, function(surf) {
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
				var matl=self.matls[index];
				lodash.each(self.surfs, function(surf) {
				
					lodash.each(surf.layers, function(layer) {
						lodash.remove(layer.materials, function(material) {
							return matl.id==lodash.get(material, "material.id", undefined);
						})
					})
				})
					
			},
			spec_prompt:function(index) {
				
				var specie=self.species[index];
				var props=lodash.filter(self.props, function(prop) {

						return prop.spec_id && prop.spec_id.id==specie.id;	
				})

				
				elements={
					props:props
				}

				return elements;
				
			},
			spec_remove:function(index) {
				var specie=self.species[index];
				
				var props=lodash.filter(self.props, function(prop) {
					return prop.spec_id && prop.spec_id.id==particle.id;	
				})
				
				lodash.each(props, function(prop) {
					prop.spec_id={};
				})

			},
			part_prompt:function(index) {
				var particle=self.parts[index];
				var props=lodash.filter(self.props, function(prop) {
						return prop.part_id && prop.part_id.id==particle.id;	
				})
				
				elements={
					props:props
				}
				return elements;
			},
			part_remove:function(index) {
				var particle=self.parts[index];
				
				var props=lodash.filter(self.props, function(prop) {
					return prop.part_id && prop.part_id.id==particle.id;	
				})
				
				lodash.each(props, function(prop) {
					prop.part_id={};
				})

			},
		
		};
//}}}
		// Setters//{{{
		this.setters={
			addRamp:function(ramp) {

			},
			removeRamp:function(id) {

			}
		};
//}}}

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
			var libraryString="";
			libraryString=JSON.stringify(this, replacer, '\t');	

			return libraryString;			
		};

	}

	return Library;
}])//}}}
.service('LibraryManager',['$q', '$http', 'HttpManager', 'Library', 'lodash', '$rootScope', function($q, $http, HttpManager, Library, lodash, $rootScope) {//{{{
	   
	return {
		get:function() {
			var deferred=$q.defer();
	
			HttpManager.request('get', '/api/library',  JSON.stringify({}))
			.then(function(result) {
				var library=new Library(result.data);
				deferred.resolve(library);

			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;
		},
		update:function(lib) {
			var deferred=$q.defer();
	
			console.log("Update lib:");
			console.log(lib);
			HttpManager.request('put', '/api/library',  lib)
			.then(function(result) {
				var library=result.data;
				deferred.resolve(library);

			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;
		}
	}

}])//}}}

