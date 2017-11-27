angular.module('wf-list.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-websocket.service', 'wf-autocad.service', 'wf-accessor.service'])
.factory('List', ['IdGenerator', 'lodash','Websocket', function(IdGenerator, lodash, Websocket) {
	
	function List(element, elementName, list, currentList, ui, listIndex, listRange, constr, idName, type, libraryList, libraryUi) {

		
			this.activate=function($index) {
				element[elementName]=list[ui.begin+$index];
				Websocket.syncSelectItem(list[ui.begin+$index]);
				ui.element=element[elementName]['id'];
				listIndex.index=ui.begin+$index;
				if(libraryList && libraryUi) {
					libraryUi.element='';
				}
				if(currentList) {
					currentList.value=list;
					currentList.type=type;
				}
			}

			this.activateLib=function($index) {
				element[elementName]=list[ui.begin+$index];

				ui.element=element[elementName]['id'];
				listIndex.index=ui.begin+$index;
				if(libraryList && libraryUi) {
					libraryUi.element='';
				}
				if(currentList) {
					currentList.value=list;
					currentList.type=type;
				}

			}

			this.newItem=function(args) {
				if(args) {
					var newObj=new constr(Object.assign({id:IdGenerator.genId(idName, list)}, args));
				} else {
					var newObj=new constr({id:IdGenerator.genId(idName, list)});
				}

				Websocket.syncCreateItem(newObj).then(function(res) {
					if(res.status=='success') {
						newObj.idAC=res.idAC;
						list.push(newObj);
						element[elementName]=list[list.length-1];

						ui.element=element[elementName]['id'];
						listIndex.index=list.length-1;
						
						if(ui.begin+listRange<list.length) {
							ui.begin=((list.length-(list.length%listRange))/listRange)*listRange;
						}
						if(currentList) {
							currentList.value=list;
							currentList.type=type;
						}
					}
				}, function(error) {

				});
			}

			this.importItem=function(base, args) {
				
				if(!args) {
					var newObj=new constr(base);
				} else {

				}

				Websocket.syncCreateItem(newObj).then(function(res) {
					if(res.status=='success') {
						newObj.idAC=res.idAC;
						console.log(newObj);
						console.log(list);
						list.push(newObj);
						element[elementName]=list[list.length-1];

						ui.element=element[elementName]['id'];
						listIndex.index=list.length-1;
						
						if(ui.begin+listRange<list.length) {
							ui.begin=((list.length-(list.length%listRange))/listRange)*listRange;
						}
						if(currentList) {
							currentList.value=list;
							currentList.type=type;
						}
					}
				}, function(error) {

				});


			}

			this.newItemLib=function(args) {
				if(args) {
					var newObj=new constr({id:IdGenerator.genId(idName, list)}, args);
				} else {
					var newObj=new constr({id:IdGenerator.genId(idName, list)});
				}

				list.push(newObj);
				element[elementName]=list[list.length-1];

				ui.element=element[elementName]['id'];
				listIndex.index=list.length-1;
				
				if(ui.begin+listRange<list.length) {
					ui.begin=((list.length-(list.length%listRange))/listRange)*listRange;
				}
				if(currentList) {
					currentList.value=list;
					currentList.type=type;
				}
			}


			this.getItem=function($index) {
				var item=list[ui.begin+$index];
				return item;
			}


			this.remove=function($index) {
				var updatedIndex=ui.begin+$index;

				if(element[elementName]===list[updatedIndex]) {
					if(list.length>1) {
						list.splice(updatedIndex, 1);
						if(updatedIndex==0) {
							element[elementName]=list[0];
							if(currentList) {
								currentList.value=list;
								currentList.type=type;
							}

							listIndex.index=0;
						} else {
							element[elementName]=list[updatedIndex-1];
							if(currentList) {
								currentList.value=list;
								currentList.type=type;
							}

							listIndex.index=updatedIndex-1;

							ui.element=element[elementName]['id'];
						}
					} else {
						list.splice(updatedIndex, 1);
						element[elementName]=undefined;

						ui.element='';
					}	
				} else {
					
					list.splice(updatedIndex, 1);
				}
				
				if(ui.begin==list.length && ui.begin>=listRange) {
					ui.begin-=listRange;
				}
				
			}


			this.increaseRange=function() {
				if(ui.begin+listRange<list.length) {
					ui.begin+=listRange;
				}
			}

			this.decreaseRange=function() {
				if(ui.begin>=listRange) {
					ui.begin-=listRange;
				} else {
					ui.begin=0;
				}
			}

			this.initElement=function() {
				
				var currentLibId=undefined;

				if(libraryList) {
					if(libraryList.length>0) {
						var currentLibId=lodash.find(libraryList, function(elem) {
							return elem.id==libraryUi.element;
						}); 
					}
				}

				if(currentLibId) {
					element[elementName]=currentLibId;
					if(currentList) {
						currentList.value=libraryList;
						currentList.type="lib";
					}
				} else {

					if(list.length>0) {
						var currentId=lodash.find(list, function(elem) {
							return elem.id==ui.element;
						}); 
						if(currentId) {
							element[elementName]=currentId;
							if(currentList) {
								currentList.value=list;
								currentList.type=type;
							}

						} else {	
							element[elementName]=list[0];
							if(currentList) {
								currentList.value=list;
								currentList.type=type;
							}

						}
					} else {
						element[elementName]=undefined;
					}
				}

			}

			this.exportToLib=function($index) {
				if(libraryList) {
					libraryList.push(new constr(list[ui.begin+$index]));	
				}
			}

	}

	return List;
}])

