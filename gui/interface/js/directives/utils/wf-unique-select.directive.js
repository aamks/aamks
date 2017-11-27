angular.module('wf-unique-select.directive', ['wf-globals.service', 'ngLodash'])
.directive('wfUniqueSelect', function(Globals, lodash) {
  return {
	 	restrict: 'E',
		link: function (scope, element, attrs) {
			
			scope.filterList=function() {
				
				var list;
				list=lodash.filter(scope.list, function(element) {
					return lodash.find(scope.used, function(usedElement) {
						return lodash.get(usedElement, 'material.id', undefined)==element.id;
					})==undefined
				})
				if(scope.model.id) {
					list.push(scope.model);
				}
				return list;
			}
		},
		template:'<select ng-model="model" ng-options="matl.id for matl in filterList()"><option ng-if="model.id==undefined" value="" selected>--Select MATL--</option></select>',
		scope: {
			list: '=',
			used: '=',
			model:'='
		}
  };
});	
