<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.ctrl.newItem()">
				<h2>Add CTRL</h2>
				<i class="material-icons">add_box</i>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="ctrl">
				<div class="list-item" ng-repeat="ctrlItem in output.ctrls|slice:ui.output.ctrl.begin:(ui.output.ctrl.begin+listRange)">
					<a ng-click="functions.ctrl.activate($index)" ng-class="{active: ctrlItem===ctrl}"> {{ctrlItem.id}} </a>
					<i class="material-icons red" ng-if="ctrl.editable==true" ng-click="functions.ctrl.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="output.ctrls.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.ctrl.decreaseRange()">chevron_left</i>
					<p>{{ui.output.ctrl.begin}}-{{ui.output.ctrl.begin+listRange>output.ctrls.length ? output.ctrls.length:ui.output.ctrl.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.ctrl.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box">
			<div class="form-row" ng-if="!ctrl">
				<label class='header'>Click 'New' to add ctrl to ctrl list</label>
			</div>
			<div ng-if="ctrl">
				<div class="form-title">
					<label class='header'>{{ctrl.id}} DEFINITION</label>
				</div>
				<div class="form-row-regular">
					<label>ID: </label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="ctrl.setId(currentCtrlList)" /> 
					</div>
				</div>

				<div class="form-row-regular">
					<label>FUNCTION:</label>
					<div class="field-container">
						<select ng-model="ctrl.function" ng-options="element.value as element.label for element in enums.ctrlFunctions"></select>
					</div>
				</div>
				<div class="field-group" ng-if="ctrl.type=='sprinkler' || ctrl.type=='nozzle'" >
				
				</div>

			</div>
		</div>
<!--}}}-->
<!-- {{{Pomoc -->
		<div class="lib-wrapper">
			<div class="help-drawer" ng-class="ui.output.ctrl.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.ctrl.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.ctrl}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
