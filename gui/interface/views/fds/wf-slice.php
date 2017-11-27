<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.slcf.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add SLCF</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="slcf">
				<div class="list-item" ng-repeat="slcfItem in output.slcfs|slice:ui.output.slcf.begin:(ui.output.slcf.begin+listRange)">
					<a ng-click="functions.slcf.activate($index)" ng-class="{active: slcfItem===slcf}"> {{slcfItem.id}} </a>
					<i class="material-icons red" ng-click="functions.slcf.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="output.slcfs.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.slcf.decreaseRange()">chevron_left</i>
					<p>{{ui.output.slcf.begin}}-{{ui.output.slcf.begin+listRange>output.slcfs.length ? output.slcfs.length:ui.output.slcf.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.slcf.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: slcf && currentSlcfList.type=='lib'}">
			<div class="form-row" ng-if="!slcf">
				<label class='header'>Select or add new slice</label>
			</div>
			<div ng-if="slcf && currentSlcfList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{slcf.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="slcf.setId(currentSlcfList)" /> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Direction: </label>
						<div class="field-container">
							<select ng-model="slcf.direction" ng-options="element.value as element.label for element in enums.directions" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Value:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="slcf.set_value" pu-elastic-input/>
							<katex>m</katex> 
						</div>
					</div>
				</div>
				<div class="form-row" ng-repeat="quantity in slcf.quantities">
					<div class="slcf-row">
						<label>{{quantity.label}}</label>
						<input type=checkbox  ng-model="quantity.marked" />	
						<label ng-if="quantity.marked && !quantity.specs && !quantity.parts">SLCF{{functions.slcf.listIndex($index)}}</label>
					</div>
					<div ng-if="quantity.spec==true && quantity.marked==true" class="slcf-species">
						<div class="form-title">
							<label>SPECIES:</label>
							<i class="material-icons" ng-click="functions.slcf.addSpec($index)">add_box</i>
						</div>
						<div class="slcf-spec" ng-repeat="spec in quantity.specs">
							<select ng-model="spec.spec" ng-options="spec.id for spec in species.species"></select>
							<i ng-click="functions.slcf.removeSpec($parent.$index, $index)">b</i>						
							<label> SLCF{{functions.slcf.listIndex($index, $parent.$index)}} </label>
						</div>

					</div>
					<div ng-if="quantity.part==true && quantity.marked==true" class="slcf-species">
						<div class="form-title">
							<label>PARTICLES:</label>
							<i class="material-icons" ng-click="functions.slcf.addPart($index)">add_box</i>
						</div>
						<div class="slcf-spec" ng-repeat="part in quantity.parts">
							<select ng-model="part.part" ng-options="part.id for part in parts.parts"></select>
							<i ng-click="functions.slcf.removePart($parent.$index, $index)">b</i>						
							<label> SLCF{{functions.slcf.listIndex($index, $parent.$index)}} </label>
						</div>

					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="slcf && currentSlcfList.type=='lib'">
				<div class="form-title">
					<label class='header'>Library <id>{{slcf.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="slcf.setId_lib(currentSlcfList)" /> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Direction: </label>
						<div class="field-container">
							<select ng-model="slcf.direction" ng-options="element.value as element.label for element in enums.directions" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Value:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="slcf.set_value_lib" pu-elastic-input/>
							<katex>m</katex> 
						</div>
					</div>
				</div>
				<div class="form-row" ng-repeat="quantity in slcf.quantities">
					<div class="slcf-row">
						<label>{{quantity.label}}</label>
						<input type=checkbox  ng-model="quantity.marked" />	
						<label ng-if="quantity.marked && !quantity.specs && !quantity.parts">SLCF{{functions.slcf.listIndex($index)}}</label>
					</div>
					<div ng-if="quantity.spec==true && quantity.marked==true" class="slcf-species">
						<div class="form-title">
							<label>SPECIES:</label>
							<i class="material-icons" ng-click="functions.slcf.addSpec($index)">add_box</i>
						</div>
						<div class="slcf-spec" ng-repeat="spec in quantity.specs">
							<select ng-model="spec.spec" ng-options="spec.id for spec in species.species"></select>
							<i ng-click="functions.slcf.removeSpec($parent.$index, $index)">b</i>						
							<label> SLCF{{functions.slcf.listIndex($index, $parent.$index)}} </label>
						</div>
					</div>
					<div ng-if="quantity.part==true && quantity.marked==true" class="slcf-species">
						<div class="form-title">
							<label>PARTICLES:</label>
							<i class="material-icons" ng-click="functions.slcf.addPart($index)">add_box</i>
						</div>
						<div class="slcf-spec" ng-repeat="part in quantity.parts">
							<select ng-model="part.part" ng-options="part.id for part in parts.parts"></select>
							<i ng-click="functions.slcf.removePart($parent.$index, $index)">b</i>						
							<label> SLCF{{functions.slcf.listIndex($index, $parent.$index)}} </label>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.output.slcf.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.slcf.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libSlcf.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add SLCF</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libSlcf">
							<div class="list-item" ng-repeat="slcfItem in lib.slcfs|slice:ui.output.libSlcf.begin:(ui.output.libSlcf.begin+listRange)">
								<a ng-click="functions.libSlcf.activate($index)" ng-class="{activeLib: slcfItem===slcf}"> {{slcfItem.id}} </a>
								<i class="material-icons" ng-click="functions.libSlcf.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libSlcf.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.slcfs.length>listRange">
							<div class="list-controls">
								<i ng-click="functions.libSlcf.decreaseRange()">chevron_left</i>
								<p>{{ui.output.libSlcf.begin}}-{{ui.output.libSlcf.begin+listRange>lib.slcfs.length ? lib.slcfs.length:ui.lib.slcf.begin+listRange}}</p>
								<i ng-click="functions.libSlcf.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.output.slcf.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.slcf.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.slcf}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
