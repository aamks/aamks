angular.module('wf-mock.service', ['ngLodash', 'wf-project.service'])
.service('mockValues', ['Project', function(Project) {

	var project1=new Project("p1ID", "Project1", "Project 1 description - test");	
	var project2=new Project("p2ID", "Project2", "Project 2 description");	

	return {	
		main: {
			user: {
				id: "user1ID",
				name: "mimooh"
			},
			userConfig: {editor: "vim", alwaysAskBeforeClose: "true"},
			projects: []
		},
		project1 : project1,
		project2 : project2,
		scenario1 : {
			id: "sc1ID",
			projectID: "p1ID",
			name: "scenario 1",
			fds : {

			},
			autocad : {

			}
		},
		scenario2 : {
			id: "sc1ID",
			projectID: "p1ID",
			name: "scenario 1",
			fds : {

			},
			autocad : {

			}

		}
	
	}
}]);

