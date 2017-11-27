<div>
<!--
	<button ng-click="functions.download()"> Download </button>
	<button ngIf="file.name!=='' && file.content!==''" ng-click="functions.delete()"> Delete </button>
	<label for="editor-file_{{$index}}">{{action}}</label>
-->
	
	<label for="geom_file"><span ng-if="file.name==''">LOAD GEOMETRY</span> <span ng-if="file.name && file.name!=''">CHANGE GEOMETRY</span></label>
	<input wf-change="functions.uploadLocal" type="file" id="geom_file" />
	<label> {{file.name}} </label>

</div>

