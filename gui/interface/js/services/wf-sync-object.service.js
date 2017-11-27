angular.module('wf-sync-object.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-list.service'] )
.factory('Sync', ['GlobalValues', 'lodash', 'Validator', '$rootScope', 'Accessor', function(GlobalsValues, lodash, Validator, $rootScope, Accessor) {
	
	function Sync(base) {
	

		if(!base) {
			base={};
		}

		this.ac_offline={
			meshs:[],
			opens:[],
			obsts:[],
			holes:[],
			surfs:[],
			vents:[],
			jetfans:[],
			firevents:[],
			surfvents:[],
			surffires:[],
			devcs:[],
			slcfs:[]
		};

		this.ac_removed={
			meshs:[],
			opens:[],
			obsts:[],
			holes:[],
			surfs:[],
			vents:[],
			jetfans:[],
			firevents:[],
			surfvents:[],
			surffires:[],
			devcs:[],
			slcfs:[]


		}

		this.fds_object={};
		
		var self=this;

		this.flush_ac=function() {
			self.ac_offline={
				meshs:[],
				opens:[],
				obsts:[],
				holes:[],
				surfs:[],
				vents:[],
				jetfans:[],
				firevents:[],
				surfvents:[],
				surffires:[],
				devcs:[],
				slcfs:[]
			};

		}

		this.add_ac=function(name, uuid) {
			if(lodash.some(self.ac_offline[name], function(value) {
				console.log(value);
				if(value==uuid) {
					return true;
				} else {
					return false;
				}
			})) {
				
			} else {
				self.ac_offline[name].push(uuid);
			}
		}

		this.remove_ac=function(name, obj) {
			var uuid=obj.uuid;
			if(obj.idAC) {
				self.ac_removed[name].push(obj.idAC);
			}	
			var index=lodash.findIndex(self.ac_offline[name], function(value) {
				if(value==uuid) {
					return true;
				} else {
					return false;
				}
			})
			if(index!=-1) {
				self.ac_offline[name].splice(index, 1);
			}

		}

	};
	return Sync;	
}])

