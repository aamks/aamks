angular.module('wf-http.service', ['ui-notification'])
.service('HttpManager', ['$q', '$http', 'Notification', function($q, $http, Notification) {

	return {

		request : function (method, url, data, successFn) {
			var limit=100;
			var timeout=$q.defer();
			var result=$q.defer();
			var timedOut=false;
		
			setTimeout(function() {
				timedOut=true;
				timeout.resolve();
			}, (1000*limit));

			this.httpRequest=$http({
				method: method,
				url: url,
				data: data,
				cache: false,
				timeout: timeout.promise
			});

			this.httpRequest.success(function(data, status, headers, config) {
				if(data.meta) {
					if('success'===data.meta.status) {
						Notification.success(data.meta.details[0]);
						result.resolve(data);
					} else if('info'===data.meta.status) {
						Notification.info(data.meta.details[0]);
						result.resolve(data);
					} else if('error'===data.meta.status)  {
						Notification.error(data.meta.details[0]);
						result.reject(data);
					} else if('warning'===data.meta.status) {
						Notification.warning(data.meta.details[0]);
						result.reject(data);
					} else {
						//MessageManager.display('error', MessageManager.messages.unknownError);
						result.reject();
					}
				} else {
					//MessageManager.display('error', MessageManager.messages.internalServer);
					result.reject();
				}
				
				
			});

			this.httpRequest.error(function(data, status, headers, config) {
				if(timedOut) {
					//MessageManager.display('error', MessageManager.messages.timeout);
					result.reject();
				} else {
					//MessageManager.display('error', MessageManager.messages.internalServer);
					result.reject();

				}
			});

			return result.promise;
		}
	}
}]);
	
