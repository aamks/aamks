var statectrl=angular.module('mainapp.state.controllers', ['rawFile.service'])


statectrl.controller('startController', function($scope, $http) {

	
});

statectrl.controller('projectController', ['$scope', '$state', 'RawFileSync', function($scope, $state, RawFileSync) {
	
	$scope.textEditor={};
	$scope.textEditor.editorOptions = {
        lineWrapping : true,
        lineNumbers: true
    };

	$scope.fds={current: {rawText: " --------SURF--------  \n\
&SURF ID='pozar', HRRPUA=750.0, RAMP_Q='hrr' /  \n\
&SURF ID='FDS_gips', COLOR='CORNSILK 3', TRANSPARENCY=0.1, MATL_ID='MAT_GIPS_KARTON', THICKNESS=0.02 /  \n\
  \n\
--------VENT--------  \n\
&VENT XB=5.2,5.2, -0.2,3.4, 0.0,3.0 SURF_ID='OPEN' /  \n\
&VENT XB=1.0,1.4, 1.0,2.0, 0.0,0.0 SURF_ID='pozar' /  \n\
  \n\
--------HEAD--------  \n\
&HEAD CHID='symulacja', TITLE='symulacja' /  \n\
  \n\
--------DUMP--------  \n\
&DUMP DT_PL3D=5, DT_RESTART=2000, NFRAMES=600, PLOT3D_QUANTITY(1:5)='TEMPERATURE', 'VISIBILITY', 'PRESSURE', 'DENSITY', 'VELOCITY', WRITE_XYZ=.TRUE. /  \n\
  \n\
--------OBST--------  \n\
&OBST XB=-0.2,5.2, -0.2,0.0, 0.0,2.6 SURF_ID='FDS_gips' /  \n\
&OBST XB=-0.2,5.2, 3.0,3.2, 0.0,2.6 SURF_ID='FDS_gips' /  \n\
&OBST XB=-0.2,0.0, -0.2,3.2, 0.0,2.6 SURF_ID='FDS_gips' /  \n\
&OBST XB=5.0,5.2, -0.2,3.2, 0.0,2.6 SURF_ID='FDS_gips' /  \n\
&OBST XB=-0.2,5.2, -0.2,3.2, 2.6,2.8 SURF_ID='FDS_gips' /  \n\
"}};
		
	$scope.$watch('fds.current.rawText', function(newValue, oldValue) {
		if(newValue!=="") {
			RawFileSync.setRawFile(newValue);
			RawFileSync.sendToServer()
			.then(function(data) {
					console.log(data)
					angular.element('#karol').text(JSON.stringify(data));
				}, 
				function(err) {
					console.log(err)
				}
			);
		}
	});
	
}]);


