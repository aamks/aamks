<div class="form-box">
	<div class="form-title">
		<label class='header'>File's settings</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Fds file:</label>
			<div class="field-container">
				<i class="material-icons" ng-click="functions.download_fds()">file_download</i>
				<i class="material-icons" ng-click="functions.upload_fds()">file_upload</i>
				<!--<i class="material-design" ng-click="functions.delete_fds()">b</i>-->
			</div>
		</div>
		<div class="form-column">
			<label>CAD file:</label>
			<div class="field-container">
				<i class="material-design" ng-click="functions.ac_link()" >g</i>
				<i class="material-design" ng-click="functions.ac_unlink()">h</i>
				<i class="material-design" ng-click="functions.ac_sync()" >i</i>
			</div>
		</div>
	</div>


	<div class="form-title">
		<label class='header'>Scenario settings</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Title:</label>
			<div class="field-container">
				<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.head.set_title" pu-elastic-input/>
			</div>
		</div>
		<div class="form-column">
			<label>Chid:</label>
			<div class="field-container">
				<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.head.set_chid" pu-elastic-input/>
			</div>
		</div>
		<div class="form-column-break"/>
		<div class="form-column">
			<label>Time begin:</label>
			<div class="field-container">
				<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.time.set_t_begin" pu-elastic-input/>
				<katex>s</katex>
			</div>
		</div>
		<div class="form-column">
			<label>Time end:</label>
			<div class="field-container">
				<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="general.time.set_t_end" pu-elastic-input/>
				<katex>s</katex>
			</div>
		</div>
		<div class="form-column">
			<label>Data saving counts (NFRAMES):</label>
			<div class="field-container">
				<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="output.general.set_nframes"  pu-elastic-input/>
				<katex>s</katex>
			</div>
		</div>
		<div class="form-column">
			<label>Plot 3D save interval (DT_PL3D):</label>
			<div class="field-container">
				<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="output.general.set_dt_pl3d"  pu-elastic-input/>
				<katex>s</katex>
			</div>
		</div>
		<div class="form-column-break"/>
		<div class="form-column">
			<label>Save simulation every:</label>
			<div class="field-container">
				<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="output.general.set_dt_restart" pu-elastic-input/>
				<katex>s</katex>
			</div>
		</div>
		<div class="form-column">
			<label>Restart calculation:</label>
			<div class="field-container">
				<input type=checkbox ng-model="general.misc.restart"/>

			</div>
		</div>
	</div>
	<div class="form-title">
		<label class='header'>Miscellaneous</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Ambient temperature:</label>
			<div class="field-container">
				<input class="short" ng-model="general.misc.tmpa" pu-elastic-input/>
				<katex>^{\circ}C</katex>
			</div>
		</div>
		<div class="form-column">
			<label>Background pressure:</label>
			<div class="field-container">
				<input class="short" ng-model="general.misc.p_inf" pu-elastic-input/>
				<katex>Pa</katex>
			</div>
		</div>
		<div class="form-column">
			<label>Humidity:</label>
			<div class="field-container">
				<input class="short" ng-model-options="{updateOn:'blur', getterSetter:true}" ng-model="general.misc.set_humidity" pu-elastic-input/>
				<katex>\%</katex>
			</div>
		</div>
		<div class="form-column-break" />
		<div class="form-column">
			<label>Gravity X,Y,Z:</label>
			<div class="field-container">
				<input class="short" ng-model="general.misc.gvec_x" pu-elastic-input/>
				<input class="short" ng-model="general.misc.gvec_y" pu-elastic-input/>
				<input class="short" ng-model="general.misc.gvec_z" pu-elastic-input/>
				<katex>m/s^2</katex>
			</div>
		</div>
		<div class="form-column-break" />
		<div class="form-column">
			<label>Noise:</label>
			<div class="field-container">
				<input type="checkbox" ng-model="general.misc.noise"/>
			</div>
		</div>
		<div class="form-column">
			<label>Noise velocity:</label>
			<div class="field-container">
				<input class="short" ng-model="general.misc.noise_velocity" pu-elastic-input/>
				<katex>m/s</katex>
			</div>
		</div>
	</div>

	<div class="form-title">
		<label class='header'>Other</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>DNS:</label>
			<div class="field-container">
				<input type=checkbox ng-model="general.misc.dns" />
			</div>
		</div>
		<div class="form-column">
			<label>Overwrite:</label>
			<div class="field-container">
				<input type=checkbox ng-model="general.misc.overwrite">
			</div>
		</div>
	</div>
</div>
