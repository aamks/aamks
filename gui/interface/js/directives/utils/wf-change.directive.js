angular.module('wf-change.directive', ['wf-globals.service'])
.directive('wfChange', function(Globals) {
  return {
	      restrict: 'A',
    		link: function (scope, element, attrs) {
				var onChangeHandler = scope.$eval(attrs.wfChange);
		
				element.bind('change', onChangeHandler);
			}
  };
});	
