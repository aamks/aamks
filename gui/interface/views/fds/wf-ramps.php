<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.ramp.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add RAMP</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="ramp">
				<div class="list-item" ng-repeat="rampItem in ramps.ramps|slice:ui.ramps.ramp.begin:(ui.ramps.ramp.begin+listRange)">
					<a ng-click="functions.ramp.activate($index)" ng-class="{active: rampItem===ramp}"> {{rampItem.id}} </a>
					<i class="material-icons red" ng-click="functions.ramp.removePrompt($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="ramps.ramps.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.ramp.decreaseRange()">chevron_left</i>
					<p>{{ui.ramps.ramp.begin}}-{{ui.ramps.ramp.begin+listRange>ramps.ramps.length ? ramps.ramps.length:ui.ramps.ramp.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.ramp.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: ramp && currentRampList.type=='lib'}">
			<div class="form-row" ng-if="!ramp">
				<label class='header'>Click 'New' to add ramp to ramp list</label>
			</div>
			<div ng-if="ramp && currentRampList.type=='file'">
				<div class="form-title">
					<label class='header'>{{ramp.id}} DEFINITION</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="ramp.setId(currentRampList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Type:</label>
						<div class="field-container">
							<select ng-model="ramp.type" ng-options="element.value as element.label for element in enums.rampType" ></select>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label>Steps</label>
					<i class="material-icons" ng-click="functions.ramp.addStep()">add_box</i>
				</div>
				<div ng-repeat="step in ramp.steps" class="form-row-double">
					<label>T:</label>
					<div class="field-container">
						<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="step.set_t"/>
					</div>
					<label>F:</label>
					<div class="field-container">
						<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="step.set_f"/> 
					</div>
					<i class="material-icons" ng-click="functions.ramp.removeStep($index)">delete_forever</i>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="ramp && currentRampList.type=='lib'">
				<div class="form-title">
					<label class='header'>{{ramp.id}} DEFINITION</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="ramp.setId(currentRampList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Type:</label>
						<div class="field-container">
							<select ng-model="ramp.type" ng-options="element.value as element.label for element in enums.rampType" ></select>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label>Steps</label>
					<i class="material-icons" ng-click="functions.ramp.addStep()">add_box</i>
				</div>
				<div  ng-repeat="step in ramp.steps" class="form-row-double">
					<label>T:</label>
					<div class="field-container">
						<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="step.set_t"/>
					</div>
					<label>F:</label>
					<div class="field-container">
						<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="step.set_f"/> 
					</div>
					<i class="material-icons" ng-click="functions.libRamp.removeStep($index)">delete_forever</i>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.ramps.ramp.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.ramp.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libRamp.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add RAMP</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libRamp">
							<div class="list-item" ng-repeat="rampItem in lib.ramps|slice:ui.ramps.libRamp.begin:(ui.ramps.libRamp.begin+listRange)">
								<a ng-click="functions.libRamp.activate($index)" ng-class="{activeLib: rampItem===ramp}"> {{rampItem.id}} </a>
								<i class="material-icons" ng-click="functions.libRamp.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libRamp.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.ramps.length>listRange">
							<div class="list-controls">
								<i class="material-icons" ng-click="functions.libRamp.decreaseRange()">chevron_left</i>
								<p>{{ui.ramps.libRamp.begin}}-{{ui.ramps.libRamp.begin+listRange>lib.ramps.length ? lib.ramps.length:ui.lib.ramp.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libRamp.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.ramps.ramp.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.ramp.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.ramp}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
