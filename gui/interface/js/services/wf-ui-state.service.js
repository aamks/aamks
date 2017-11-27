angular.module('wf-ui-state.service', ['ngLodash'])
.factory('UiState', [function() {

	function UiState() {

		this.link='';

		this.general={
			tab:0,
			list:0,
			element:0
		}

		this.geometry={
			tab:0,
			mesh:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			open:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			matl:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libMatl:{
				scrollPosition:0,
				begin:0,
				element:''	
			},
			surf:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libSurf:{
				scrollPosition:0,
				begin:0,
				element:''	
			},
			obst:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'

			},
			hole:{
				scrollPosition:0,
				begin:0,
				element:''	
			}

				
		}

		this.fires={
			tab:0,
			fire:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libFire:{
				scrollPosition:0,
				begin:0,
				element:''	
			},
			group:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			fuel:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			libFuel:{
				scrollPosition:0,
				begin:0,
				element:''	
			}
		}

		this.output={
			tab:0,
			slcf:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libSlcf:{
				scrollPosition:0,
				begin:0,
				element:'',
			},
			isof:{
				scrollPosition:0,
				begin:0,
				element:'',	
				help:'closed'
			},
			prop:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libProp:{
				scrollPosition:0,
				begin:0,
				element:''	
			},
			devc:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libDevc:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			ctrl:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			}

		}

		this.species={
			tab:0,
			specie:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libSpecie:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			vent:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libVent:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			},
			surf:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libSurf:{
				scrollPosition:0,
				begin:0,
				element:'',
				help:'closed'
			}


		}

		this.parts={
			tab:0,
			part:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libPart:{
				scrollPosition:0,
				begin:0,
				element:''	
			}

		}

		this.ramps={
			tab:0,
			ramp:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libRamp:{
				scrollPosition:0,
				begin:0,
				element:''	
			}

		}

		this.ventilation={
			surf:{
				scrollPosition:0,
				begin:0,
				element:'',
				lib:'closed',
				help:'closed'
			},
			libSurf:{
				scrollPosition:0,
				begin:0,
				element:''	
			},
			vent:{
				scrollPosition:0,
				begin:0,
				element:'',	
				help:'closed'
			},
			jetfan:{
				scrollPosition:0,
				begin:0,
				element:'',	
				lib:'closed',
				help:'closed'
			},
			libJetfan:{
				scrollPosition:0,
				begin:0,
				element:'',	
			}
		}


		this.setLink=function(link) {
			this.link=link;
		}


 		this.drawers={
			visual:true,
			geometry:false,
			ventilation:false,
			fire:false,
			output:false,
			species:false

		}

	}

	return UiState;
}])
	
