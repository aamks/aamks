angular.module('wf-autocad.service', ['ngLodash', 'wf-fds-object.service', 'wf-risk-object.service', 'wf-id-generator.service'])
.service('Autocad', ['$rootScope','lodash', 'Fds','Obst', 'Surf', 'Mesh', 'Open', 'Slcf','Devc','Vent','SurfVent','Hole','SurfFire','FireVent','Fire','Jetfan', 'IdGenerator', function($rootScope, lodash, Fds, Obst, Surf, Mesh, Open, Slcf, Devc, Vent, SurfVent, Hole, SurfFire, FireVent,Fire, Jetfan, IdGenerator) {

	var transformAcGeometry=function(ac_geometry, current_geometry) {//{{{
	

		var transformed_geometry={
			geometry:{
				meshes:[],
				opens:[],
				surfs:[],
				obsts:[],
				holes:[]
			},
			ventilation:{
				surfs:[],
				vents:[],
				jetfans:[]
			},
			output:{
				slcfs:[],
				devcs:[]
			},
			fires:{
				fires:[]
			}
		}

		var ramps=current_geometry.ramps.ramps;

		var new_surfs=[];
		new_surfs.push(new Surf({id:"inert", editable:"false"}));
		// Dodajemy devicey z biblioteki ktore maja id = surf_id
		new_surfs=new_surfs.concat(transformSurfs(ac_geometry.geometry.surfs, current_geometry.geometry.surfs));

		var new_devcsSurfs=[];
		var new_devcsSurfs=transformDevcsSurfs(ac_geometry.geometry.surfs, current_geometry.output.devcs);

		var new_devcs=[];
		var new_devcs=transformDevcs(ac_geometry.output.devcs, current_geometry.output.devcs, new_devcsSurfs);

		var new_obsts=transformObsts(ac_geometry.geometry.obsts, current_geometry.geometry.obsts, new_surfs, new_devcsSurfs);
		var new_holes=transformHoles(ac_geometry.geometry.holes, current_geometry.geometry.holes);

		var new_meshes=[];
		var new_meshes=transformMeshes(ac_geometry.geometry.meshes, current_geometry.geometry.meshes);
		
		var new_opens=[];
		var new_opens=transformOpens(ac_geometry.geometry.opens, current_geometry.geometry.opens);

		var new_ventsurfs=[];
		var new_ventsurfs=transformVentSurfs(ac_geometry.ventilation.surfs, current_geometry.ventilation.surfs, ramps);

		var new_vents=[];
		var new_vents=transformVents(ac_geometry.ventilation.vents, current_geometry.ventilation.vents, new_ventsurfs);

		var new_jetfans=[];
		var new_jetfans=transformJetfans(ac_geometry.ventilation.jetfans, current_geometry.ventilation.jetfans, ramps);

		var new_fires=[];
		var new_fires=transformFires(ac_geometry.fires.fires, current_geometry.fires.fires, ramps);

		var new_slcfs=[];
		var new_slcfs=transformSlcfs(ac_geometry.output.slcfs, current_geometry.output.slcfs);
		
		transformed_geometry.geometry.obsts=new_obsts;
		transformed_geometry.geometry.surfs=new_surfs;
		transformed_geometry.geometry.holes=new_holes;
		transformed_geometry.geometry.meshes=new_meshes;
		transformed_geometry.geometry.opens=new_opens;

		transformed_geometry.ventilation.surfs=new_ventsurfs;
		transformed_geometry.ventilation.vents=new_vents;
		transformed_geometry.ventilation.jetfans=new_jetfans;

		transformed_geometry.fires.fires=new_fires;
		
		transformed_geometry.output.slcfs=new_slcfs;
		transformed_geometry.output.devcs=new_devcs;
		transformed_geometry.output.devcsSurfs=new_devcsSurfs;

		return transformed_geometry;
	}
//}}}
	var transformSurfs=function(ac_elements, current_elements) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcSurfs(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			// wyszukaj element czy istnieje
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// wyszukaj w bibliotece czy istnieje surf
				surf = lodash.find($rootScope.main.lib.surfs, function(surf) {
					return surf.id == ac_element.id;
				});
				// jezeli jest w bibliotece
				if(surf != undefined) {
					var base=$rootScope.main.lib.importers.surf_import(surf, current_elements, $rootScope.main.currentScenario.fds_object.geometry.matls, $rootScope.main.lib.matls, $rootScope.main.currentScenario.fds_object.ramps.ramps, $rootScope.main.lib.ramps);
					updated_elements.push(new Surf(base));
				}
				// jezeli nie ma w bibliotece utworz nowego
				else {
					updated_elements.push(new Surf(ac_element, null));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
				
			}
		});
		return updated_elements;
	
	}
//}}}
	var transformMeshes=function(ac_elements, current_elements) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);


		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				updated_elements.push(new Mesh(ac_element));
			} else {

				var original_element=sorted_current_elements[res].toJSON();
				original_element.xb=ac_element.xb;
		

				var modified_element=new Mesh(original_element);

				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
				
			}
		});

		var maxId=0;
		
		lodash.each(updated_elements, function(mesh) {
			if(mesh.id!="" && mesh.id.substr(0,4)=='MESH') {
				var number=mesh.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(mesh) {
			if(mesh.id=="") {
				mesh.id='MESH'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformOpens=function(ac_elements, current_elements) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);


		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				updated_elements.push(new Open(ac_element));
			} else {
				var original_element=sorted_current_elements[res].toJSON();
				original_element.xb=ac_element.xb;
		

				var modified_element=new Open(original_element);

				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
				
			}
		});

		var maxId=0;
		
		lodash.each(updated_elements, function(open) {
			if(open.id!="" && open.id.substr(0,4)=='OPEN') {
				var number=open.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(open) {
			if(open.id=="") {
				open.id='OPEN'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformObsts=function(ac_elements, current_elements, surfs, devcs) {//{{{
	
		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			// wyszukaj czy istnieje w bibliotece device o tej samej nazwie co nazwa warstwy obsta
			devc = lodash.find(devcs, function(devc) {
				return devc.id == ac_element.surf.surf_id;
			});
			// jezeli jest devc w bibliotece
			if(devc != undefined) {
				ac_element.devc_id = devc.id;
			}

			// wyszukaj obsta czy istnieje, czy modyfikowac
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				ac_element.id="";
				updated_elements.push(new Obst(ac_element, surfs, devcs));
			} else {
				var original_element=sorted_current_elements[res].toJSON();
				var surf_type=original_element.surf.type;
				var surf_id;
				
				switch(surf_type) {
					case 'surf_id':
						surf_id='surf_id';
						break;

					case 'surf_ids':
						surf_id='surf_idx';
						break;

					case 'surf_id6':
						surf_id='surf_id1';
						break;
				}
				
				original_element.surf[surf_id]=ac_element.surf.surf_id;
				original_element.xb=ac_element.xb;
				original_element.elevation=ac_element.elevation;

				var modified_element=new Obst(original_element, surfs, devcs);
				updated_elements.push(modified_element); //new Obst(modified_element, surfs));
				sorted_current_elements.splice(res, 1);
				
			}
		});
		
		var maxId=0;

		lodash.each(updated_elements, function(obst) {
			if(obst.id!="" && obst.id.substr(0,4)=='OBST') {
				var number=obst.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(obst) {
			if(obst.id=="") {
				obst.id='OBST'+maxId;
				maxId++;
			}
		})
	
		return updated_elements;
		//console.timeEnd('ac search');
		
	}
//}}}
	var transformHoles=function(ac_elements, current_elements) {//{{{
	
		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				ac_element.id="";
				updated_elements.push(new Hole(ac_element));
			} else {
				var original_element=sorted_current_elements[res].toJSON();
				
				original_element.xb=ac_element.xb;
				original_element.elevation=ac_element.elevation;

				var modified_element=new Hole(original_element);
				updated_elements.push(modified_element); //new Obst(modified_element, surfs));
				sorted_current_elements.splice(res, 1);
			}
		});
		
		var maxId=0;
		lodash.each(updated_elements, function(hole) {
			if(hole.id!="" && hole.id.substr(0,4)=='HOLE') {
				var number=hole.id.substr(4);
				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(hole) {
			if(hole.id=="") {
				hole.id='HOLE'+maxId;
				maxId++;
			}
		})
	
		return updated_elements;
	}
//}}}
	var transformVentSurfs=function(ac_elements, current_elements, ramps) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// jezeli nie ma w istniejacych elementach to sprobuj wyszukac w bibliotece
				surf = lodash.find($rootScope.main.lib.ventsurfs, function(surf) {
					return surf.id == ac_element.id;
				});
				// jezeli jest w bibliotece
				if(surf != undefined) {
					var base=$rootScope.main.lib.importers.surfvent_import(surf, current_elements, $rootScope.main.currentScenario.fds_object.ramps.ramps, $rootScope.main.lib.ramps);
					updated_elements.push(new SurfVent(base));
				}
				// jezeli nie ma w bibliotece utworz nowego
				else {
					updated_elements.push(new SurfVent(ac_element, null));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
			}
		});

		// chyba do usuniecia - Michal sprawdz
		var maxId=0;
		lodash.each(updated_elements, function(surf) {
			if(surf.id!="" && surf.id.substr(0,4)=='SURV') {
				var number=surf.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(surf) {
			if(surf.id=="") {
				surf.id='SURV'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformVents=function(ac_elements, current_elements, surfs) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);


		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				var vent=new Vent(ac_element, surfs);
				updated_elements.push(vent);
			} else {
				var original_element=sorted_current_elements[res].toJSON();
				original_element.xb=ac_element.xb;
		

				var modified_element=new Vent(original_element, surfs);

				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
				

			}
		});

		var maxId=0;
		
		lodash.each(updated_elements, function(vent) {
			if(vent.id!="" && vent.id.substr(0,4)=='VENT') {
				var number=vent.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(vent) {
			if(vent.id=="") {
				vent.id='VENT'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformJetfans=function(ac_elements, current_elements, ramps) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// jezeli nie ma w istniejacych elementach to sprobuj wyszukac w bibliotece
				jetfan = lodash.find($rootScope.main.lib.jetfans, function(jetfan) {
					return jetfan.id == ac_element.surf_id;
				});
				// jezeli jest w bibliotece
				if(jetfan != undefined) {
					var base=$rootScope.main.lib.importers.jetfan_import(jetfan, current_elements, $rootScope.main.currentScenario.fds_object.ramps.ramps, $rootScope.main.lib.ramps);
					// Nadpisz ustawienia geometryczne z AC
					base['direction'] = ac_element.direction;
					base['xb'] = ac_element.xb;
					base.idAC = ac_element.idAC;
					
					updated_elements.push(new Jetfan(base));
				}
				// jezeli nie ma w bibliotece utworz nowego
				else {
					//ac_element.id = IdGenerator.genId('jetfan', current_elements);
					updated_elements.push(new Jetfan(ac_element, ramps));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
			}
		});

		//lodash.each(sorted_ac_elements, function(ac_element) {
		//	res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
		//	if(res==-1) {
		//		var jetfan=new Jetfan(ac_element);
		//		updated_elements.push(jetfan);
		//	} else {
		//		var original_element=sorted_current_elements[res].toJSON();
		//		original_element.xb=ac_element.xb;
		//		original_element.direction=ac_element.direction;

		//		var modified_element=new Jetfan(original_element);

		//		updated_elements.push(modified_element);
		//		sorted_current_elements.splice(res, 1);

		//	}
		//});

		var maxId=0;
		
		lodash.each(updated_elements, function(jetfan) {
			if(jetfan.id!="" && jetfan.id.substr(0,4)=='JETFAN') {
				var number=jetfan.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(jetfan) {
			if(jetfan.id=="") {
				jetfan.id='JETFAN'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformFires=function(ac_elements, current_elements, ramps) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);


		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// Michal czy to jest dobre miejsce zeby sprawdzac, czy zaciagac z biblioteki, sprawdz, czy moge tak wywolywac ponizej rootScope?
				// jezeli nie ma w istniejacych elementach to sprobuj wyszukac w bibliotece
				var fire = lodash.find($rootScope.main.lib.fires, function(fire) {
					return fire.id == ac_element.surf_id;
				});
				// jezeli jest w bibliotece
				if(fire != undefined) {
					var base=$rootScope.main.lib.importers.fire_import(fire, current_elements, $rootScope.main.currentScenario.fds_object.ramps.ramps, $rootScope.main.lib.ramps);
					base.idAC=ac_element.idAC;
					base.vent.xb=ac_element.vent.xb;
					updated_elements.push(new Fire(base));
				}
				// jezeli nie ma w bibliotece utworz nowego
				else {
					updated_elements.push(new Fire(ac_element));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
			}
		});

		var maxId=0;
		
		lodash.each(updated_elements, function(fire) {
			if(fire.id!="" && fire.id.substr(0,4)=='FIRE') {
				var number=fire.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(fire) {
			if(fire.id=="") {
				fire.id='FIRE'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformSlcfs=function(ac_elements, current_elements) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// Michal czy to jest dobre miejsce zeby sprawdzac, czy zaciagac z biblioteki, sprawdz, czy moge tak wywolywac ponizej rootScope?
				// jezeli nie ma w istniejacych elementach to sprobuj wyszukac w bibliotece
				var slcf = lodash.find($rootScope.main.lib.slcfs, function(slcf) {
					return slcf.id == ac_element.id;
				});

				// jezeli jest w bibliotece
				if(slcf != undefined) {
					var base=$rootScope.main.lib.importers.slcf_import(slcf, current_elements);
					base.idAC = ac_element.idAC;
					base.direction = ac_element.direction;
					base.value = ac_element.value;
					base.id = IdGenerator.genId('slcf', updated_elements);
					updated_elements.push(new Slcf(base));
				}
				// jezeli nie ma w bibliotece utworz nowego
				else {
					//ac_element.id = IdGenerator.genId('slcf', current_elements);
					updated_elements.push(new Slcf(ac_element));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
			}
		});

		var maxId=0;
		
		lodash.each(updated_elements, function(slcf) {
			if(slcf.id!="" && slcf.id.substr(0,4)=='SLCF') {
				var number=slcf.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(slcf) {
			if(slcf.id=="") {
				slcf.id='SLCF'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	
	}
//}}}
	var transformDevcsSurfs=function(ac_elements, current_elements) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// wyszukaj czy istnieje w bibliotece device o tej samej nazwie co nazwa warstwy - na potrzeby przypisania devc_id do obstow
				devc = lodash.find($rootScope.main.lib.devcs, function(devc) {
					return devc.id == ac_element.id;
				});
				// jezeli istnieje w bibliotece
				if(devc != undefined) {
					var base=$rootScope.main.lib.importers.devc_import(devc, current_elements);
					//base.geometrical_type = "point";
					//base.xyz = [0, 0, 0];
					updated_elements.push(new Devc(base));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
			}
		});

		var maxId=0;
		
		lodash.each(updated_elements, function(devc) {
			if(devc.id!="" && devc.id.substr(0,4)=='DEVC') {
				var number=devc.id.substr(4);

				if(number*1>maxId) {
					maxId=number*1;
				}
			}
		})

		maxId++;

		lodash.each(updated_elements, function(devc) {
			if(devc.id=="") {
				devc.id='DEVC'+maxId;
				maxId++;
			}
		})

		return updated_elements;
	}
//}}}
	var transformDevcs=function(ac_elements, current_elements) {//{{{

		var updated_elements=[];

		var sorted_ac_elements=prepareAcElements(ac_elements);
		var sorted_current_elements=prepareCurrentElements(current_elements);

		// sprawdzenie dla kazdego elementu z AC, czy jest jego odpowiednik w fds_object - tak - modyfikacja, nie - dodanie
		// elementy z fds_object nie bedace w ac nie zostana dodane do listy updated_elements
		lodash.each(sorted_ac_elements, function(ac_element) {
			res=binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
			if(res==-1) {
				// Michal czy to jest dobre miejsce zeby sprawdzac, czy zaciagac z biblioteki, sprawdz, czy moge tak wywolywac ponizej rootScope?
				// jezeli nie ma w istniejacych elementach to sprobuj wyszukac w bibliotece
				var devc = lodash.find($rootScope.main.lib.devcs, function(devc) {
					return devc.id == ac_element.id;
				});

				// jezeli jest w bibliotece
				if(devc != undefined) {
					var base=$rootScope.main.lib.importers.devc_import(devc, current_elements);
					base.idAC = ac_element.idAC;
					base.geometrical_type = ac_element.geometrical_type;
					base.xb = ac_element.xb;
					base.xyz = ac_element.xyz;
					console.log(base);
					updated_elements.push(new Devc(base));
				}
				// jezeli nie ma w bibliotece utworz nowego
				else {
					updated_elements.push(new Devc(ac_element));
				}
			} 
			// aktualizuj istniejacy
			else {
				var modified_element=sorted_current_elements[res];
				updated_elements.push(modified_element);
				sorted_current_elements.splice(res, 1);
			}
		});

		return updated_elements;
	}
//}}}

	function binaryIndexOf(elem, list, prop) {//{{{
	 
		var minIndex = 0;
		var maxIndex = list.length - 1;
		var currentIndex;
		var currentElement;
			 
		while (minIndex <= maxIndex) {
			
			currentIndex = (minIndex + maxIndex) / 2 | 0;
			currentElement = list[currentIndex];
			if (currentElement[prop] < elem[prop]) {
				minIndex = currentIndex + 1;
			} else if (currentElement[prop] > elem[prop]) {
				maxIndex = currentIndex - 1;
			} else if (currentElement[prop] == elem[prop]) {
				return currentIndex;
			}
		}

		return -1;
	
	}
//}}}
	function prepareCurrentElements(current_elements) {//{{{
	
		var valid_current_elements=lodash.filter(current_elements, function(element) {
			return element.idAC && element.idAC!='';
		})

		var prepared_current_elements=lodash.map(valid_current_elements, function(element, index) {
		
			var new_element=element;
			new_element.index=index;
			return new_element;

		})

		var sorted_current_elements=lodash.sortBy(prepared_current_elements, function(element) {
			return element.idAC;
		})

		return sorted_current_elements;

	}
//}}}
	function prepareAcElements(ac_elements) {//{{{
		var prepared_ac_elements=lodash.map(ac_elements, function(element, index) {
			var new_element=element;
			new_element.index=index;
			return new_element;
		})

		var sorted_ac_elements=lodash.sortBy(prepared_ac_elements, function(element) {
			return element.idAC;
		})

		return sorted_ac_elements;

	}
//}}}
	function prepareAcSurfs(ac_elements) {//{{{

		var valid_ac_elements=lodash.filter(ac_elements, function(element) {
			return element.id!="INERT" && element.id!="inert";
		})

		var prepared_ac_elements=lodash.map(valid_ac_elements, function(element, index) {
			var new_element=element;
			new_element.index=index;
			return new_element;
		})

		var sorted_ac_elements=lodash.sortBy(prepared_ac_elements, function(element) {
			return element.idAC;
		})

		return sorted_ac_elements;

	}
//}}}

	return {
		transformAcGeometry:transformAcGeometry,
		binaryIndexOf:binaryIndexOf
	}
}])


