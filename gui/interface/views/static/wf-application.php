<div id="application-wrapper">
	<div id="side">
		<div id="logo">
			<img src="/resources/simo.svg" />
		</div>
		<wf-main-navigation></wf-main-navigation>
	</div>
	<div id="main">
		<wf-page-top></wf-page-top>
		<wf-top-navigation></wf-top-navigation>
		<div id="editor-area" ui-view="editor-view"></div>
	</div>
</div>
<wf-dialog-settings ng-if="main.activeDialog=='settings'" class="dialog"></wf-dialog-settings>
<div id="footer">
	<!--<p>©2016 WizFDS | contact@wizfds.com</p>-->
</div>
