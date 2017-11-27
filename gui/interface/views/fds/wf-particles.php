<div class="single-amper-wrapper">
	<div class="amper-container">
		<div class="list">
<!-- {{{Lista elementow -->
			<div class="list-title" ng-click="functions.part.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add PART</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="part">
				<div class="list-item" ng-repeat="partItem in parts.parts|slice:ui.parts.part.begin:(ui.parts.part.begin+listRange)">
					<a ng-click="functions.part.activate($index)" ng-class="{active: partItem===part}"> {{partItem.id}} </a>
					<i class="material-icons red" ng-click="functions.part.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="parts.parts.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.part.decreaseRange()">chevron_left</i>
					<p>{{ui.parts.part.begin}}-{{ui.parts.part.begin+listRange>parts.parts.length ? parts.parts.length:ui.parts.part.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.part.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: part && currentPartList.type=='lib'}">
			<div class="form-row" ng-if="!part">
				<label class='header'>Click 'New' to add part to part list</label>
			</div>
			<div ng-if="part && currentPartList.type=='file'">
				<div class="form-title">
					<label class='header'>{{part.id}} DEFINITION</label>
				</div>
				<div class="form-row-regular">
					<label>ID: </label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="part.setId(currentPartList)" /> 
					</div>
				</div>
				<div class="form-row-regular">
					<label>DIAMETER</label>
					<div class="field-container">
						<input class="short" type=text   ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="part.set_diameter"/> 
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="part && currentPartList.type=='lib'">
				<div class="form-title">
					<label class='header'>{{part.id}} DEFINITION</label>
				</div>
				<div class="form-row-regular">
					<label>ID: </label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="part.setId_lib(currentPartList)" /> 
					</div>
				</div>
				<div class="form-row-regular">
					<label>DIAMETER</label>
					<div class="field-container">
						<input class="short" type=text   ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="part.set_diameter_lib"/> 
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.parts.part.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.part.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libPart.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add PART</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libPart">
							<div class="list-item" ng-repeat="partItem in lib.parts|slice:ui.parts.libPart.begin:(ui.parts.libPart.begin+listRange)">
								<a ng-click="functions.libPart.activate($index)" ng-class="{activeLib: partItem===part}"> {{partItem.id}} </a>
								<i class="material-icons" ng-click="functions.libPart.importFromLib($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libPart.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.parts.length>listRange">
							<div class="list-controls">
								<i class="material-icons" ng-click="functions.libPart.decreaseRange()">chevron_left</i>
								<p>{{ui.parts.libPart.begin}}-{{ui.parts.libPart.begin+listRange>lib.parts.length ? lib.parts.length:ui.lib.part.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libPart.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.parts.part.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.part.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.part}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
