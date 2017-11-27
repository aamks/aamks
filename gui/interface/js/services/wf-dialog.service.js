angular.module('wf-dialog.service', ['ngLodash'])
.service('DialogManager', ['lodash', '$timeout', function(lodash, $timeout) {
	return {
		current: {
			dialog: "",
			alert: ""
		},
 		displayDialog: function(id, data) {
 			//LxDialogService.open(id);
			this.current.dialog=id;
			console.log(id);
		}
/*
		close: function() {
			LxDialogService.close(this.current.dialog);
			this.cleanAfterClose();
		},
		beforeClose: function() {
				LxDialogService.open("unsaved-alert");
				this.current.alert="unsaved-alert";

		},
		cleanAfterClose: function() {
			var filters=angular.element('div.dialog-filter');
			if(filters && filters.length!==0) {
		
				$timeout(function() {			
						lodash.each(filters, function(filter) {filter.remove();});
					}, 300);

			}
			this.current.dialog="";
			this.current.alert="";

		},
		closeFromAlert: function() {
			LxDialogService.close(this.current.alert, "");
			LxDialogService.close(this.current.dialog, "");
			this.cleanAfterClose();
		}
*/
	}

}]);

