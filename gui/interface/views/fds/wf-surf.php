<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.surf.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add SURF</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="surf">
				<div class="list-item" ng-repeat="surfItem in geometry.surfs|slice:ui.geometry.surf.begin:(ui.geometry.surf.begin+listRange)">
					<a ng-click="functions.surf.activate($index)" ng-class="{active: surfItem===surf}"> {{surfItem.id}} </a>
					<i class="material-icons red" ng-if="surf.editable==true" ng-click="functions.surf.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="geometry.surfs.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.surf.decreaseRange()">chevron_left</i>
					<p>{{ui.geometry.surf.begin}}-{{ui.geometry.surf.begin+listRange>geometry.surfs.length ? geometry.surfs.length:ui.geometry.surf.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.surf.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: surf && currentSurfList.type=='lib'}">
			<div class="form-row" ng-if="!surf">
				<label class='header'>Click 'New' to add surf to surf list</label>
			</div>
			<div ng-if="surf && currentSurfList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{surf.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.setId(currentSurfList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Color:</label>
						<div class="field-container">
							<input type=text class="string" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.set_color" ng-disabled="surf.editable==false" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Transparency:</label>
						<div class="field-container">
							<input type=text class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.set_transparency" ng-disabled="surf.editable==false" />
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Backing:</label>
						<div class="field-container">
							<select ng-model="surf.backing" ng-options="element.value as element.label for element in enums.backing" ng-disabled="surf.editable==false" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Adiabatic:</label>
						<div class="field-container">
							<input type=checkbox ng-model="surf.adiabatic" ng-true-value='true' ng-disabled="surf.editable==false"/>
						</div>
					</div>
				</div>
				<div  ng-if="surf && currentSurfList.type=='file' && surf.editable==true">
					<div class="form-row-link" ng-click="functions.surf.layer.newLayer()">
						<i class="material-icons">add_box</i>
						<div>Add layer</div>
					</div>
					<div class="from-row" ng-repeat="layer in surf.layers" >
						<div class="form-row-top">
							<div class="form-row-bottom">
								<div class="form-row-small">
									<div>Layer {{$index}}:</div>
								</div>
								<div class="form-row-small">
									<div class="form-column">
										<label>Thickness:</label>
										<div>
											<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="layer.set_thickness"  />
											<unit>m</unit>
										</div>
									</div>
								</div>
								<div class="form-row-link" ng-click="functions.surf.layer.remove($index)">
									<i class="material-icons red">delete_forever</i>
									<div>Delete layer</div>
								</div>
								<div class="form-row-link" ng-click="functions.surf.layer.material.newMaterial($index)">
									<i class="material-icons">add_box</i>
									<div>Add material</div>
								</div>
							</div>
							<div class="form-row-bottom">
								<div class="form-row-small-top">
									<div class="form-column">
										<div class="form-row-small" ng-repeat="material in layer.materials">
											<div class="form-column">
												<wf-unique-select list="geometry.matls" used="$parent.layer.materials" model="material.material" />
											</div>
											<div class="form-column">
												<label>Mass fraction:</label>
												<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="material.set_fraction"/>
											</div>
											<i class="material-icons red" ng-click="functions.surf.layer.material.remove($parent.$index, $index)">delete_forever</i>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="surf && currentSurfList.type=='lib'">
				<div class="form-title">
					<label class='header'><id>{{surf.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.setId_lib(currentSurfList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Color:</label>
						<div class="field-container">
							<input type=text class="string" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.set_color_lib" ng-disabled="surf.editable==false" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Transparency:</label>
						<div class="field-container">
							<input type=text class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.set_transparency_lib" ng-disabled="surf.editable==false" />
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Backing:</label>
						<div class="field-container">
							<select ng-model="surf.backing" ng-options="element.value as element.label for element in enums.backing" ng-disabled="surf.editable==false" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Adiabatic:</label>
						<div class="field-container">
							<input type=checkbox ng-model="surf.adiabatic" ng-true-value='true' ng-disabled="surf.editable==false"/>
						</div>
					</div>
				</div>
				<div  ng-if="surf && currentSurfList.type=='lib' && surf.editable==true">
					<div class="form-row-link" ng-click="functions.surf.layer.newLayer()">
						<i class="material-icons">add_box</i>
						<div>Add layer</div>
					</div>
					<div class="from-row" ng-repeat="layer in surf.layers" >
						<div class="form-row-top">
							<div class="form-row-bottom">
								<div class="form-row-small">
									<div>Layer {{$index}}:</div>
								</div>
								<div class="form-row-small">
									<div class="form-column">
										<label>Thickness:</label>
										<div>
											<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="layer.set_thickness"  />
											<unit>m</unit>
										</div>
									</div>
								</div>
								<div class="form-row-link" ng-click="functions.libSurf.layer.remove($index)">
									<i class="material-icons red">delete_forever</i>
									<div>Delete layer</div>
								</div>
								<div class="form-row-link" ng-click="functions.libSurf.layer.material.newMaterial($index)">
									<i class="material-icons">add_box</i>
									<div>Add material</div>
								</div>
							</div>
							<div class="form-row-bottom">
								<div class="form-row-small-top">
									<div class="form-column">
										<div class="form-row-small" ng-repeat="material in layer.materials">
											<div class="form-column">
												<wf-unique-select list="lib.matls" used="$parent.layer.materials" model="material.material"/>
											</div>
											<div class="form-column">
												<label>Mass fraction:</label>
												<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="material.set_fraction"/>
											</div>
											<i class="material-icons red" ng-click="functions.libSurf.layer.material.remove($parent.$index, $index)">delete_forever</i>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.geometry.surf.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.surf.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title"  ng-click="functions.libSurf.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add SURF</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true, thumbSize: 15}" scrollname="libSurf">
							<div class="list-item" ng-repeat="surfItem in lib.surfs|slice:ui.geometry.libSurf.begin:(ui.geometry.libSurf.begin+listRange)">
								<a ng-click="functions.libSurf.activate($index)" ng-class="{activeLib: surfItem===surf}"> {{surfItem.id}} </a>
								<i class="material-icons" ng-click="functions.libSurf.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libSurf.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom">
							<div  class="list-controls" ng-if="lib.surfs.length>listRange">
								<i class="material-icons" ng-click="functions.libSurf.decreaseRange()">chevron_left</i>
								<p>{{ui.geometry.libSurf.begin}}-{{ui.geometry.libSurf.begin+listRange>lib.surfs.length ? lib.surfs.length:ui.lib.surf.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libSurf.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.geometry.surf.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.surf.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.surf}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
