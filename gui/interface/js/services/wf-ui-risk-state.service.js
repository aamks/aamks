angular.module('wf-ui-risk-state.service', ['ngLodash'])
.factory('UiRiskState', [function() {

	function UiRiskState() {

		this.link='';

		this.setLink=function(link) {
			this.link=link;
		}

		this.general={
			tab:0
		}

		this.geometry={
			tab:0,
			mvent:{
				scrollPosition:0,
				begin:0,
				element:''	
			},
		}

		this.building={
			tab:0
		}

		this.materials={
			tab:0
		}

		this.devices={
			tab:0
		}

		this.evacuation={
			tab:0
		}

		this.settings={
			tab:0
		}


	}

	return UiRiskState;
}])
	
