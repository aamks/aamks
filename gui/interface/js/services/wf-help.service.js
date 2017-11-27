angular.module('wf-help.service', [])
.service('HelpManager', ['$q', '$http', function($q, $http) {
	return {
 		getHelpForToken: function(token) {
                	var deferred = $q.defer();
					$http.post('/help/get-manual-url', JSON.stringify({token:token}))
					.success(function(response) {
						// timeout!!!
						if("success"===response.message.type) {
							var helpUrl=response.data.url;
						} else {
							// brak pomocy dla tokena lub błąd serwera
							var helpUrl="";
						}
						deferred.resolve(helpUrl);
					});
			  
			    	return deferred.promise;			
		},
		getHelpForEditor: function() {
                	var deferred = $q.defer();
					$http.get('/help/get-editor-help')
					.success(function(response) {
						// timeout!!!
						if("success"===response.message.type) {
							var helpContent=response.data.content;
						} else {
							var helpContent="";
						}
						deferred.resolve(helpContent);
					});
			  
			    	return deferred.promise;			
		}


	}

}]);

