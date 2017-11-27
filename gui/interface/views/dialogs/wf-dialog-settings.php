<div class="dialog-box">
	<div class="dialog-title">
		<h1> Global settings </h1>
	</div>
	<div class="dialog-form">
		<div class="form-row">
			<div class="form-column">
				<label>Name:</label>
				<div class=field-container">
					<input type="text" ng-model="settings_copy.userName" pu-elastic-input/>
				</div>
			</div>		
		</div>
		<div class="form-row">
			<div class="form-column">
				<label>Websocket host IP:</label>
				<div class=field-container">
					<input type="text" ng-model="settings_copy.host" pu-elastic-input/>
				</div>
			</div>		
		</div>
		<div class="form-row">
			<div class="form-column">
				<label>Websocket port:</label>
				<div class=field-container">
					<input type="text" ng-model="settings_copy.port" pu-elastic-input/>
				</div>
			</div>
		</div>
		<div class="form-row">
			<div class="form-column">
				<label>Editor:</label>
				<div class=field-container">
					<select ng-model="settings_copy.editor" ng-options="element.value as element.label for element in enums.editor"></select>
				</div>
			</div>	
		</div>
	</div>
	<div class="dialog-controls">
		<button ng-click="functions.save()">Save</button>
		<button ng-click="functions.cancel()">Cancel</button>
	</div>
</div>
