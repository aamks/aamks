angular.module('wf-calc.service', ['wf-http.service', 'wf-globals.service', 'ngLodash'])
.service('Calc', ['$q', 'HttpManager', 'Globals', 'lodash', function($q, HttpManager, Globals, lodash) {

var MyMath = {};

MyMath.round = function(number, precision) {
	var factor = Math.pow(10, precision);
	var tempNumber = number * factor;
	var roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
};

	var ventArea=function(x1, x2, y1, y2, z1, z2) {//{{{
		var area;
		
		return area;
	}
//}}}
	var xyz=function(args){//{{{
		var xyz = parseFloat(args.dim1) + parseFloat((args.dim2 - args.dim1)/2);
		return {
			dim1: args.dim1,
			xyz: xyz
		};
	}
//}}}

	var meshXB1=function(args) {//{{{
		if(args.dim1>args.dim2) {
			return {
				dim1: args.dim1_old
			}	
		} else if(args.dim1==args.dim2) {
			return {
				dim1: args.dim1_old
			}
		} else {

			var number=Math.abs(args.dim2-args.dim1)/args.size;
			if(number%1===0) {
				return {
					dim1: args.dim1,
					number: number
				}
			} else {
				return {
					dim1: args.dim1_old
				}

			}
		}	
	}
//}}}
	var meshXB2=function(args) {//{{{
		if(args.dim1>args.dim2) {
			return {
				dim2: args.dim2_old
			}	
		} else if(args.dim1==args.dim2) {
			return {
				dim2: args.dim2_old
			}
		} else {

			var number=Math.abs(args.dim2-args.dim1)/args.size;
			if(number%1===0) {
				return {
					dim2: args.dim2,
					number: number
				}
			} else {
				return {
					dim2: args.dim2_old
				}

			}
		
		}	
	}
//}}}
	var meshNumber=function(args) {//{{{
		var size=MyMath.round(Math.abs(args.dim2-args.dim1)/args.number,3);
		return {
			size: size,
			number: args.number
		}
	}
//}}}
	var meshSize=function(args) {//{{{
		var number=MyMath.round(Math.abs(args.dim2-args.dim1)/args.size, 2);
		if(number%1===0) {
			return {
				size: args.size,
				number: number
			}
		} else {
			return {
				size: args.size_old
			}
		}

	}
//}}}

	var timeBegin=function(args) {//{{{
		
		if(args.t_begin<args.t_end) {
			
			return {t_begin: args.t_begin};
		} else if(args.t_begin>=args.t_end) {

			if(args.t_begin_old<args.t_end){
				return {t_begin:args.t_begin_old};
			} else {
				return {t_begin:0};
			}

		}
	}
//}}}
	var timeEnd=function() {//{{{

	}
//}}}

	var matlFraction=function(args) {//{{{
		console.log(args)
		if(lodash.reduce(args.fractions, function(sum, element) {
			console.log('element');
			console.log(element);
			return sum+element.fraction;
		}, 0)+args.fraction>1) {
			console.log('calc over');
			return {fraction: args.fraction_old}
		} else {
			console.log('calc ok');
			return {fraction: args.fraction}
		}
	}
//}}}

	var volumeFlowPerHour=function(args){//{{{
		var volumeFlowPerHour = (args.dim1 * 3600).toFixed(0);
		return {
			dim1: args.dim1,
			volumeFlowPerHour: volumeFlowPerHour
		};
	}
//}}}
	var volumeFlowPerSecond=function(args){//{{{
		var volumeFlowPerSecond = (args.dim1 / 3600).toFixed(2);
		return {
			dim1: args.dim1,
			volumeFlowPerSecond: volumeFlowPerSecond
		};
	}
//}}}

	var hrrChange=function(args){//{{{
		var radius1 = Math.sqrt(((args.alpha*Math.pow(10,2))/(Math.PI*args.hrrpua)));
		var radius2 = Math.sqrt(((args.alpha*Math.pow(11,2))/(Math.PI*args.hrrpua)));
		var spread_rate = (radius2 - radius1).toFixed(6);
		var tauq = (Math.sqrt((args.hrrpua*args.area)/args.alpha) * (-1)).toFixed(2);

		return {
			hrrpua: args.hrrpua,
			alpha: args.alpha,
			area: args.area,
			spread_rate: spread_rate,
			tauq: tauq
		};
	}
//}}}
	var spreadRateChange=function(args){//{{{
		var alpha = ( Math.pow(args.spread_rate,2) * Math.PI * args.hrrpua ).toFixed(6);
		var tauq = (Math.sqrt((args.hrrpua*args.area)/alpha) * (-1)).toFixed(2);

		return {
			hrrpua: args.hrrpua,
			alpha: alpha,
			area: args.area,
			spread_rate: args.spread_rate,
			tauq: tauq
		};
	}
//}}}
	var alphaChange=function(args){//{{{
		var radius1 = Math.sqrt(((args.alpha*Math.pow(10,2))/(Math.PI*args.hrrpua)));
		var radius2 = Math.sqrt(((args.alpha*Math.pow(11,2))/(Math.PI*args.hrrpua)));
		var spread_rate = (radius2 - radius1).toFixed(6);
		var tauq = (Math.sqrt((args.hrrpua*args.area)/args.alpha) * (-1)).toFixed(2);

		return {
			alpha: args.alpha,
			hrrpua: args.hrrpua,
			area: args.area,
			spread_rate: spread_rate,
			tauq: tauq
		};
	}
//}}}
	var tauqChange=function(args){//{{{
		var alpha = ((args.hrrpua*area)/(Math.pow(args.tauq,2))).toFixed(6);
		return {
			tauq: args.tauq,
			hrrpua: args.hrrpua,
			area: args.area,
			alpha: alpha
		};
	}
//}}}
	var ventChange=function(args){//{{{
		var radius1 = Math.sqrt(((args.alpha*Math.pow(10,2))/(Math.PI*args.hrrpua)));
		var radius2 = Math.sqrt(((args.alpha*Math.pow(11,2))/(Math.PI*args.hrrpua)));
		var spread_rate = (radius2 - radius1).toFixed(6);
		var tauq = (Math.sqrt((args.hrrpua*args.area)/args.alpha) * (-1)).toFixed(2);

		return {
			hrrpua: args.hrrpua,
			alpha: args.alpha,
			area: args.area,
			spread_rate: spread_rate,
			tauq: tauq
		};
	}
//}}}
//}}}

	return {
		ventArea: ventArea,
		timeBegin: timeBegin,
		meshXB1:meshXB1,
		meshXB2:meshXB2,
		meshNumber:meshNumber,
		meshSize:meshSize,
		matlFraction:matlFraction,
		xyz:xyz,
		volumeFlowPerHour:volumeFlowPerHour,
		volumeFlowPerSecond:volumeFlowPerSecond,
		alphaChange:alphaChange,
		hrrChange:hrrChange,
		spreadRateChange:spreadRateChange,
		tauqChange:tauqChange,
		ventChange:ventChange,
	}
}])

