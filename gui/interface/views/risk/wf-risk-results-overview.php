<div class="form-box">
	<div class="risk-results">
		<div class="risk-result">
			<button ng-click="functions.generate_results()">Generate results</button>
		</div>
		<div ng-show="functions.show_results">
			<div class="risk-result">
				<label>Figure 1. Performance of the safety systems</label>
				<img ng-src="{{output.pie_fault}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 2. Event tree for FED conseqences</label>
				<img ng-src="{{output.tree}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 3. Event tree for construction stability conseqences</label>
				<img ng-src="{{output.tree_steel}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 4. FN curves</label>
				<img ng-src="{{output.ccdf}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 5. ASET distribution</label>
				<img ng-src="{{output.dcbe}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 6. RSET distribution</label>
				<img ng-src="{{output.wcbe}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 7. Hot layer height distribution</label>
				<img ng-src="{{output.height}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 8. Max temperature of hot layer distribution</label>
				<img ng-src="{{output.temp}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 9. Minimal visibility distribution</label>
				<img ng-src="{{output.vis}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 10. Bar chart for fatalities in a function of number of scenarios</label>
				<img ng-src="{{output.losses0}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 11. Bar chart for heavy injured in a function of number of scenarios</label>
				<img ng-src="{{output.losses1}}" /><br/>
			</div>
			<div class="risk-result">
				<label>Figure 12. Bar chart for light injured in a function of number of scenarios</label>
				<img ng-src="{{output.losses2}}" /><br/>
			</div>
			<div class="risk-result">
				<iframe width="1000px" height="800px" ng-src="{{output.visual}}" /><br/>
			</div>
		</div>

	<!--
		<div class="risk-result">
			<label>1. RISK MATRIX</label>
			<img ng-src="/resources/rm_8.png" />
		</div>
		<div class="risk-result">
			<label>2. EVENT TREE</label>
			<img ng-src="/resources/eta_8.png" />
		</div>
		<div class="risk-result">
			<label>3. F-N CURVES</label>
			<img ng-src="/resources/grzybowska_l8_ccdf.png" />
		</div>
		<div class="risk-result">
			<label>4. ASET DISTRIBUTION</label>
			<img ng-src="/resources/grzybowska_l8_dbce.png" />
		</div>
		<div class="risk-result">
			<label>5. RSET DISTRIBUTION</label>
			<img ng-src="/resources/grzybowska_l8_wcbe.png" />
		</div>
		<div class="risk-result">
			<label>6. HOT GAS LAYER HEIGHT DISTRIBUTION</label>
			<img ng-src="/resources/grzybowska_l8_height.png" />
		</div>
		<div class="risk-result">
			<label>7. HOT GAS LAYER MAX TEMPERATURE DISTRIBUTION</label>
			<img ng-src="/resources/grzybowska_l8_temp.png" />
		</div>
		
	</div>
	<div class="visualization-container">
		<label>8. VISUALIZATION</label>
		<div class="visualization">

			<div id="controller">
				<div  style="float: left;padding-top: 0.15em;" >
						<button id="speed1_btn" class="ui-button ui-widget ui-corner-all" title="Play" style="height:1.6em">
							x1
						</button>
						<button id="speed2_btn" class="ui-button ui-widget ui-corner-all" title="Play" style="height:1.6em">
							x2
						</button>
						<button id="speed10_btn" class="ui-button ui-widget ui-corner-all" title="Play" style="height:1.6em">
							x10
						</button>

						<button id="play_btn" class="ui-button ui-widget ui-corner-all ui-button-icon-only" title="Play" style="height:1.6em">
						<span class="ui-icon ui-icon-play" ></span>
					</button>
				</div>
				<div id="slider">
							<div id="slider-handler" class="ui-slider-handle"></div>
				</div>
			</div>

			<div>
				-->
				<!--
				<div id="left">
						ustawienia wizualizacji
				</div>
				<div id="container">
				</div>

			</div>


		</div>
	</div>
				-->


</div>
<!--
<script src="/resources/visualize/js/three.min.js"></script>
<script src="/resources/visualize/js/BlendCharacter.js"></script>
<script src="/resources/visualize/js/OrbitControls.js"></script>
<script src="/resources/visualize/js/SimoVis.js"></script>
<script src="/resources/visualize/js/SimoVisSmoke.js"></script>
<script src="/resources/visualize/js/VolumetricFire.js"></script>

<script src="/resources/visualize/js/bson.js"></script>
<script src="/resources/visualize/js/jquery.min.js"></script>
<script src="/resources/visualize/js/jquery-ui.min.js"></script>
<script type="x-shader/x-vertex" id="vertexshader">
	uniform float amplitude;
	attribute float size;
	attribute vec3 customColor;
	varying vec3 vColor;
	// varying vec3 vPosition;

	void main() {
		vColor = customColor;
		// vPosition = position;

		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		// vec4 mvPosition = modelViewMatrix * vec4( position[0], position[1], position[2], 1.0 );

		gl_PointSize = size  * ( 300.0 / -mvPosition.z );
		// gl_PointSize = 25.0;
		gl_Position = projectionMatrix * mvPosition;
	}
</script>

<script type="x-shader/x-fragment" id="fragmentshader">
	uniform vec3 color;
	uniform sampler2D texture;
	varying vec3 vColor;
	// varying vec3 vPosition;
	void main() {
		// if (gl_FragCoord[2] > 100.0) discard;
		gl_FragColor = vec4( color * vColor, 0.5) * texture2D( texture, gl_PointCoord );
		// gl_FragColor = vec4( 0.0, 0.0, 1.0, 1.0 ) ;//* texture2D( texture, gl_PointCoord );
	}
</script>
<script>
	var vis;
	$(document).ready( function() {
		$.urlParam = function(name, default_value){
			/*
					var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
					if (!results)
						return default_value;
					return results[1] || 0;
			*/
					return "sim_6";
			}

			vis = new SIMO.Visualize("container");
			vis.init(
				"container",		{
							on_frame_change : function(seconds){
									$( "#slider").slider('value', seconds);
									$( "#slider-handler").text( Math.round(seconds) + 's' );
								},
							on_data_loaded : function(evacuation_data){
								 vis.set_optimal_view();
								 $( "#slider" ).slider({max:vis.get_simulation_length()})
							},
							data_dir : $.urlParam('dir', 'sim_1')
				}
			);
			 $( "#slider" ).slider({
				 create: function(event, ui) {
			  $( "#slider-handler").text('0s' );
		   },
				 slide: function( event, ui ) {
					 vis.set_simulation_time(ui.value);
					 $( "#slider-handler").text( Math.round(ui.value) + 's' );
				 }
			  });

			 $( "#play_btn" ).click(function(){
				 if (vis.isPlaying){
					  vis.play(false);
						$( "#play_btn > span" ).removeClass('ui-icon-pause').addClass('ui-icon-play');
				 }
				 else{
					vis.play(true);
						$( "#play_btn > span" ).removeClass('ui-icon-play').addClass('ui-icon-pause');
				 }
				 console.info(vis.isPlaying);
			 });

			 $( "#speed1_btn"  ).click(function(){vis.simulation_speed = 1.0;});
			 $( "#speed2_btn"  ).click(function(){vis.simulation_speed = 2.0;});
			 $( "#speed10_btn" ).click(function(){vis.simulation_speed = 10.0;});

		 });

</script>

-->
