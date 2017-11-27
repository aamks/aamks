angular.module('wf-raw-file.service', [])
.service('RawFileSync', ['$q', '$http', function($q, $http) {
	return {
		parseRawFile: function(rawFile) {
			var deferred = $q.defer();
			$http.post('/func/parse-raw-file', rawFile)
			.success(function(data) {
				var parsedFile=data;
			  	deferred.resolve(parsedFile);
			});
			  
			return deferred.promise;
		}
	}
}]);
