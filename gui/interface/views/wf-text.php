<!--<div class="form-box" id="text-editor-container">
	<div>
		<div ui-codemirror="{onLoad: functions.onLoad}" ui-codemirror-opts="textEditor.editorOptions" ng-model="scenario.fds_file" id="codemirror-wrapper"></div>
		<div id="text-editor-controls">kopytko</div>
	<textareaui-codemirror-opts="textEditor.editorOptions" ng-model="scenario.fds_file" id="codemirror-wrapper"></textarea>
	</div>
</div>
-->
<div class="form-box">
	<textarea ui-codemirror="{onLoad: functions.onLoad}" ui-codemirror-opts="textEditor.editorOptions" ng-model="scenario.fds_file"></textarea>
	<div class="form-row">
		<button ng-click="functions.api.start_simulation()"><span ng-if="sim_display==''">START</span><span ng-if="sim_display!=''">STOP</span> SIMULATION</button>
		<label>{{sim_display}}</label>
	</div>
</div>
