<div class="double-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow MESH -->
		<div class="list">
			<div class="list-title" ng-click="functions.mesh.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add MESH</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="mesh">
				<div class="list-item" ng-repeat="meshItem in geometry.meshes|slice:ui.geometry.mesh.begin:(ui.geometry.mesh.begin+listRange)">
					<a ng-click="functions.mesh.activate($index)" ng-class="{active: meshItem===mesh}"> {{ meshItem.id }} </a>
					<i class="material-icons red" ng-click="functions.mesh.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="geometry.meshes.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.mesh.decreaseRange()">chevron_left</i>
					<p>{{ui.geometry.mesh.begin}}-{{ui.geometry.mesh.begin+listRange>geometry.meshes.length ? geometry.meshes.length:ui.geometry.mesh.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.mesh.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu MESH -->
		<div class="form-box">
			<div ng-if="!mesh">
				<label class='header'>Select or add new mesh</label>
			</div>
			<div ng-if="mesh">
				<div class="form-title">
					<label class='header'><id>{{mesh.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input type=text class="string" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-change="mesh.changeId()" ng-model="mesh.setId(currentMeshList)"/> 
						</div>
					</div>
					<div class="form-column">
						<label>Mesh cell no.: </label>
						<div class="field-container">
							{{mesh.i*mesh.j*mesh.k}}					
						</div>
					</div>
					<div class="form-column">
						<label>All meshes cell no.: </label>
						<div class="field-container">

						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Mesh XB</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_x1" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_x2" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_y1" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_y2" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_z1" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_z2" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Mesh cells</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>I: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_i" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column">
						<label>J: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_j" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column">
						<label>K: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_k" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>X cell size: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_isize" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y cell size: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_jsize" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z cell size: </label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="mesh.set_ksize" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
	</div>
	<div class="amper-container">
<!-- {{{Lista elementow OPEN -->
		<div class="list">
			<div class="list-title" ng-click="functions.open.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add Open</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="open">
				<div class="list-item" ng-repeat="openItem in geometry.opens|slice:ui.geometry.opens.begin:(ui.geometry.opens.begin+listRange)">
					<a ng-click="functions.open.activate($index)" ng-class="{active: openItem===open}"> {{openItem.id}} </a>
					<i class="material-icons" ng-click="functions.open.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="geometry.opens.length>listRange">
				<div  class="list-controls">
					<i class="material-icons" ng-click="functions.open.decreaseRange()">chevron_left</i>
					<p>{{ui.geometry.open.begin}}-{{ui.geometry.open.begin+listRange>geometry.opens.length ? geometry.opens.length:ui.geometry.open.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.open.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu OPEN -->
		<div class="form-box">
			<div ng-if="!open">
				<label class='header'>Select or add new vent open</label>
			</div>
			<div ng-if="open">
				<div class="form-title">
					<label class='header'><id>{{open.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.setId(currentOpenList)" /> 
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Open XB</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.set_x1" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.set_x2" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.set_y1" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.set_y2" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.set_z1" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="open.set_z2" pu-elastic-input/>
							<unit>m</unit>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Pomoc -->
		<div class="lib-wrapper">
			<div class="help-drawer" ng-class="ui.geometry.mesh.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.mesh.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.mesh}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>

