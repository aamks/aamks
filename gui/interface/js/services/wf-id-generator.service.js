angular.module('wf-id-generator.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-validators.service'])
.service('IdGenerator', ['Globals', 'lodash', 'Validator', function(Globals, lodash, Validator) {
	
	var genId=function(type, list) {//{{{
		var name="";
		var id="";
		switch(type) {
			case 'mesh':
			name='MESH';
			break;	
			case 'open':
			name='OPEN';
			break;	
			case 'obst':
			name='OBST';
			break;
			case 'hole':
			name='HOLE';
			break;
			case 'matl':
			name='MATL';
			break;
			case 'surf':
			name='SURF';
			break;
			case 'vent':
			name='VENT';
			break;
			case 'jetfan':
			name='JETFAN';
			break;
			case 'devc':
			name='DEVC';
			break;
			case 'ctrl':
			name='CTRL';
			break;
			case 'slcf':
			name='SLCF';
			break;
			case 'isof':
			name='ISOF';
			break;
			case 'ramp':
			name='RAMP';
			break;
			case 'spec':
			name='SPEC';
			break;
			case 'part':
			name='PART';
			break;
			case 'prop':
			name='PROP';
			break;
			case 'fire':
			name='FIRE';
			break;
			case 'group':
			name='GROUP';
			break;
			case 'fuel':
			name='FUEL';
			break;
			case 'project':
			name='PROJECT';
			break;
			case 'scenario':
			name='SCENARIO';
			break;
			case 'mvent':
			name='MVENT';
			break;


		}

		var number=0;
		if(list.length>0) {
			number=lodash.chain(list)
				.map(function(element) {return element['id'];})
				.filter(function(element){var res=element.match(new RegExp(name+'\\d+'));
					return res!=null && element==res[0];
				})
				.map(function(element){var res=element.match(/\d+/);
					
					return 1*res;
				})
				.max()
				.value();
		}
	
		if(number && isFinite(number)) {
			id=name+(number+1)+'';
		} else {
			id=name+'1';
		}
		return id;
	}
//}}}
	var checkId=function(id, list) {//{{{
		if(lodash.some(list, function(element) { return element.id==id;})) {
			return false;
		} else {
			return true;
		}
	}
//}}}
	var correctId=function(id, list) {//{{{
		if(this.checkId(id, list)) {
			return Validator.identificator(id);
		} else {
			return false;
		}
	}
//}}}
	var generateUUID=function() {//{{{
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};
//}}}
	// ustala ID elementu importowanego z biblioteki tak, zeby dodac kolejna liczbe (_1, _2) do ID bibliotecznego, zeby uniknac dublowania 
	var genImportId=function(item, list) {//{{{
		
		var id=item.id;
		var res=lodash.find(list, function(elem) {
			return id==elem.id;
		});

		if(res) {
			var count=0;
			
			while(res) {
				count++;
				res=lodash.find(list, function(elem) {
					return id+"_"+count==elem.id;
				});
			}
			id=id+"_"+count;
		} else {
			id=item.id;
		}
		return id;
	}
//}}}

	return {
		genId:genId,
		checkId:checkId,
		correctId:correctId,
		genUUID:generateUUID,
		genImportId:genImportId
	}
}])
	
