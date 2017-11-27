<div class="double-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow OBST -->
		<div class="list">
			<div class="list-title" ng-click="functions.obst.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add OBST</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="obst">
				<div class="list-item" ng-repeat="obstItem in geometry.obsts|slice:ui.geometry.obst.begin:(ui.geometry.obst.begin+listRange)">
					<a ng-click="functions.obst.activate($index)" ng-class="{active: obstItem===obst}"> {{obstItem.id}} </a>
					<i class="material-icons red" ng-click="functions.obst.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="geometry.obsts.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.obst.decreaseRange()">chevron_left</i>
					<div>{{ui.geometry.obst.begin}}-{{ui.geometry.obst.begin+listRange>geometry.obsts.length ? geometry.obsts.length:ui.geometry.obst.begin+listRange}}</div>
					<i class="material-icons" ng-click="functions.obst.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu OBST -->
		<div class="form-box">
			<div class="form-row" ng-if="!obst">
				<label class='header'>Select or add new obst</label>
			</div>
			<div ng-if="obst">
				<div class="form-title">
					<label class='header'><id>{{obst.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.setId(currentObstList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Elevation: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_elevation" pu-elastic-input />
						</div>
					</div>
					<div class="form-column">
						<label>Device:</label>
						<div class="field-container">
							<select ng-model="obst.devc" ng-options="devc.id for devc in output.devcs" chosen disable-search="true"><option selected value="">No DEVC</option></select>
							<!--<select ng-change="obst.changeSurfID('{{obst.surf.surf_id.id}}', geometry.surfs)" ng-model="obst.surf.surf_id" ng-options="surf.id for surf in geometry.surfs"></select>-->
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Obst XB</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_x1"  pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_x2" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_y1" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_y2" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_z1" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="obst.set_z2" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Surface</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>SURF type: </label>
						<select ng-model="obst.surf.type" ng-change="obst.changeSurf()" ng-options="element.value as element.label for element in enums.surfType" chosen disable-search="true"><option selected value="">No SURF</option></select> 
					</div>
					<div class="form-column-break"/>
					<div class="form-column" ng-if="obst.surf.type=='surf_id'">
						<label>Surface (SURF_ID): </label>
						<div class="field-container">
							<select ng-change="obst.changeSurfID('{{obst.surf.surf_id.id}}', geometry.surfs)" ng-model="obst.surf.surf_id" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_ids'">
						<label>Surface (SURF_IDX): </label>
						<div class="field-container">
							<select  ng-change="obst.changeSurfIDX('{{obst.surf.surf_idx.id}}', geometry.surfs)" ng-model="obst.surf.surf_idx" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_ids'">
						<label>Surface (SURF_IDY): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_idy" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_ids'">
						<label>Surface (SURF_IDZ): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_idz" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_id6'">
						<label>Surface (SURF_ID1): </label>
						<div class="field-container">
							<select ng-change="obst.changeSurfID1('{{obst.surf.surf_id1.id}}', geometry.surfs)" ng-model="obst.surf.surf_id1" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_id6'">
						<label>Surface (SURF_ID2): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_id2" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>		
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_id6'">
						<label>Surface (SURF_ID3): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_id3" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>	
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_id6'">
						<label>Surface (SURF_ID4): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_id4" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>	
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_id6'">
						<label>Surface (SURF_ID5): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_id5" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>	
						</div>
					</div>
					<div class="form-column" ng-if="obst.surf.type=='surf_id6'">
						<label>Surface (SURF_ID6): </label>
						<div class="field-container">
							<select ng-model="obst.surf.surf_id6" ng-options="surf.id for surf in geometry.surfs" chosen disable-search="true"><option selected value="">No SURF</option></select>	
						</div>
					</div>
				</div>

				<div class="form-title">
					<label class='header'>Other</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Thicken: </label>
						<div class="field-container">
							<input type="checkbox" ng-model="obst.thicken"/>
						</div>
					</div>
					<div class="form-column">
						<label>Permit hole: </label>
						<div class="field-container">
							<input type="checkbox" ng-model="obst.permitHole"/>
						</div>
					</div>
					<div class="form-column">
						<label>Overlay: </label>
						<div class="field-container">
							<input type="checkbox" ng-model="obst.overlay"/>
						</div>
					</div>
					<div class="form-column">
						<label>Removable: </label>
						<div class="field-container">
							<input type="checkbox" ng-model="obst.removable"/>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
	</div>
	<div class="amper-container">
<!-- {{{Lista elementow HOLE -->
		<div class="list">
			<div class="list-title" ng-click="functions.hole.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add HOLE</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="hole">
				<div class="list-item" ng-repeat="holeItem in geometry.holes|slice:ui.geometry.hole.begin:(ui.geometry.hole.begin+listRange)">
					<a ng-click="functions.hole.activate($index)" ng-class="{active: holeItem===hole}"> {{holeItem.id}} </a>
					<i class="material-icons red" ng-click="functions.hole.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="geometry.holes.length>listRange">
				<div  class="list-controls">
					<i ng-click="functions.hole.decreaseRange()">chevron_left</i>
					<p>{{ui.geometry.hole.begin}}-{{ui.geometry.hole.begin+listRange>geometry.holes.length ? geometry.holes.length:ui.geometry.hole.begin+listRange}}</p>
					<i ng-click="functions.hole.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu HOLE -->
		<div class="form-box">
			<div class="form-row" ng-if="!hole">
				<label class='header'>Select or add new hole</label>
			</div>
			<div ng-if="hole">
				<div class="form-title">
					<label class='header'><id>{{hole.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.setId(currentHoleList)"/> 
						</div>
					</div>
					<div class="form-column">
						<label>Elevation: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_elevation" pu-elastic-input/>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Hole XB</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_x1" pu-elastic-input/>
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_x2" pu-elastic-input/>
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_y1" pu-elastic-input/>
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_y2" pu-elastic-input/>
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_z1" pu-elastic-input/>
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="hole.set_z2" pu-elastic-input/>
							<katex>m</unit>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
	</div>
</div>
