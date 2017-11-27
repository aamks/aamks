<div class="projects-title">
	<h2>CATEGORIES</h2>
	<i class="material-icons" ng-click="functions.create_category()">add_box</i>
	<div class="projects-categories"></div>
	<i class="material-icons" ng-click="functions.switchCategoryManager()">keyboard_backspace</i>
</div>
<div class="form-box">
	<div class="category-list">
		<div class="category-row" ng-repeat="category in main.categories">
			<label>{{$index+1}}</label>
			<input type=text class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="functions.set_label($index)"/>
			<input type=checkbox ng-model="category.visible" />
			<i class="material-icons" ng-click="functions.delete_category($index)">delete_forever</i>
		</div>
	</div>
</div>
