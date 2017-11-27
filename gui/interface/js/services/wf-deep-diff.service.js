angular.module('wf-deep-diff.service', ['ngLodash'])
.service('DeepDiff', ['lodash', function(lodash) {
	return {
		diffKeys : function diffKeys(obj1, obj2) {
			var diff={};
			if(obj1 && obj2) {
				lodash.each(obj1, function(value, key) {
					
					if(typeof(value)!=='object' && typeof(obj2[key]!=='object')) {
						// simple type
						if(obj2[key]!=value) {

							diff[key]=obj2[key];
						}
					} else {
						// object, array
						var tmpDiff=diffKeys(value, obj2[key]);
						if(Object.keys(tmpDiff).length!==0) {
							diff[key]=tmpDiff;
						}
					}
				});
			}
			return diff;
		}
	}
}]);


