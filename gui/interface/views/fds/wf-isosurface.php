<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.isof.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add ISOF</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="isof">
				<div class="list-item" ng-repeat="isofItem in output.isofs|slice:ui.output.isof.begin:(ui.output.isof.begin+listRange)">
					<a ng-click="functions.isof.activate($index)" ng-class="{active: isofItem===isof}"> {{isofItem.id}} </a>
					<i class="material-icons red" ng-if="isof.editable==true"  ng-click="functions.isof.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="output.isofs.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.isof.decreaseRange()">chevron_left</i>
					<p>{{ui.output.isof.begin}}-{{ui.output.isof.begin+listRange>output.isofs.length ? output.isofs.length:ui.output.isof.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.isof.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box">
			<div class="form-row" ng-if="!isof">
				<label class='header'>Click 'New' to add isof to isof list</label>
			</div>
			<div ng-if="isof">
				<div class="form-title">
					<label class='header'>{{isof.id}} DEFINITION</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="isof.setId(currentIsofList)" /> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Quanitity:</label>
						<div class="field-container">
							<select ng-model="isof.quantity" ng-options="element as element.label for element in enums.isofQuantities" chosen></select>
						</div>
					</div>
					<div class="form-column" ng-if="isof.quantity && isof.quantity.spec==true">
						<label>Specie:</label>
						<div class="field-container">
							<select ng-model="isof.spec_id" ng-options=" spec.id for spec in species.species"></select> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="field-group" ng-if="isof.quantity && isof.quantity.quantity!=undefined">
						<div class="form-title">
							<label class='header'>Add values</label>
							<i class="material-icons" ng-click="functions.isof.addValue()">add_box</i>
						</div>
						<div class="form-column" ng-repeat="value in isof.values">
							<label>Value {{$index}}:</label>
							<div class="field-container">
								<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="value.set_value" />
								<i class="material-icons red" ng-click="functions.isof.removeFunction($index)">delete_forever</i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Pomoc -->
		<div class="lib-wrapper">
			<div class="help-drawer" ng-class="ui.output.isof.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.isof.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.isof}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
