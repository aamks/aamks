<div class="form-box">
	<div class="form-title">
		<label class="header">Boundary quantities</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Select boundary quanitities:</label>
			<div class="field-container">
				<select ng-change="functions.bndf.marked(functions.bndf.quantities)" ng-model="functions.bndf.quantities" ng-options="element as element.label for element in output.bndfs" chosen multiple width="1000"><option value=""></option></select>
			</div>
		</div>
	</div>
	<div class="form-row" ng-repeat="bndf in output.bndfs" >
		<div class="form-column">
			<label>{{bndf.label}}</label>
			<div class="field-container"> 
				<input type="checkbox" ng-model="bndf.marked" ng-change="functions.bndf.checked($index)" />	
				<label ng-if="bndf.marked && !bndf.specs &&!bndf.parts">BNDF{{functions.bndf.listIndex($index)}}</label> 
			</div>
		</div>
		<div ng-if="bndf.spec==true && bndf.marked==true" class="bndf-species form-column">
			<div class="form-title">
				<label>SPECIES:</label>
				<i class="material-icons" ng-click="functions.bndf.addSpec($index)">add_box</i>
			</div>
			<div class="bndf-spec" ng-repeat="spec in bndf.specs">
				<select ng-model="spec.spec" ng-options="spec.id for spec in species.species"></select>
				<i ng-click="functions.bndf.removeSpec($parent.$index, $index)">b</i>
				<label> BNDF{{functions.bndf.listIndex($index, $parent.$index)}} </label>
			</div>
		</div>
		<div ng-if="bndf.part==true && bndf.marked==true" class="bndf-species form-column">
			<div class="form-title">
				<label>PARTICLES:</label>
				<i class="material-icons" ng-click="functions.bndf.addPart($index)">add_box</i>
			</div>
			<div class="bndf-spec" ng-repeat="part in bndf.parts">
				<select ng-model="part.part" ng-options="part.id for part in parts.parts" ></select>
				<i ng-click="functions.bndf.removePart($parent.$index, $index)">b</i>
				<label> BNDF{{functions.bndf.listIndex($index, $parent.$index)}} </label>
			</div>
		</div>
	</div>
</div>
