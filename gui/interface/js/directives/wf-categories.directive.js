angular.module('wf-categories.directive', ['ui.router', 'wf-globals.service', 'wf-id-generator.service', 'wf-category.service'])
.directive('wfCategories', function($state, $stateParams, Globals, $rootScope, IdGenerator, Category, CategoryManager) {
	

	function link(scope, element, attrs) {
		scope.main=$rootScope.main;

		scope.functions={
			create_category:function() {
				var category = new Category({uuid:IdGenerator.genUUID(), label:"New category", active:true, visible:true});
				CategoryManager.create(category).then(function(data) {
					scope.main.categories.push(category);
				}, function(error) {

				});
			},
			delete_category:function(index) {
				CategoryManager.delete(scope.main.categories[index].uuid).then(function() {
					scope.main.categories.splice(index,1);
				}, function(error) {
					console.log("error");
				});
			},
			set_label: function(index) {
				return function(label) {
					if(label) {
						var old_label=scope.main.categories[index].label;
						scope.main.categories[index].label=label;
						CategoryManager.update(scope.main.categories[index].uuid, scope.main.categories[index]).then(function(category) {

						}, function(error) {
							scope.main.categories[index].label=old_label;
						});
					} else {
						return scope.main.categories[index].label;
					}
				}
			},
			switchCategoryManager() {
				if(scope.main.categoryManager=='closed') {
					scope.main.categoryManager='open';
				} else {
					scope.main.categoryManager='closed';
				}
			}
		}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/wf-categories',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
