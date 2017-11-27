angular.module('wf-safe-apply.service', [])
.service('SafeApply', [ function() {
	return {
		apply : function(scope, fn) {
			var phase = scope.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				scope.$apply(fn);
			}
		}
	}
}]);


