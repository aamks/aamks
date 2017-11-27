angular.module('wf-validators.service', ['ngLodash', 'wf-http.service', 'wf-globals.service'])
.service('Validator', ['Globals', 'lodash', function(Globals, lodash) {
	var INT_REGEXP = /^\-?\d+$/;
	var REAL_REGEXP = /^\-?\d+\.?\d*$/;
	var REAL_REGEXP_EXP=/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/;
	var COMA_REAL_REGEXP_EXP=/[-+]?[0-9]*\,?[0-9]+([eE][-+]?[0-9]+)?/;

	var integer=function(value, pattern_message, valid_ranges, reasonable_ranges) {
		var res=true;
		if(INT_REGEXP.test(value)) {
			if(valid_ranges && valid_ranges.length>0) {
				res=lodash.every(valid_ranges, function(element) {
					var res=true;
					if(element.minExclusive!==undefined && element.minExclusive!==null && typeof element.minExclusive=='number') {
						
						res= (element.minExclusive<value*1) ? true : false;
						if(!res) return res;
					}
					if(element.minInclusive!==undefined && element.minInclusive!==null  && typeof element.minInclusive=='number') {
						
						res= (element.minInclusive<=value*1) ? true : false;
						if(!res) return res;
					}
					if(element.maxExclusive!==undefined && element.maxExclusive!==null && typeof element.maxExclusive=='number') {
						
						res= (element.maxExclusive>value*1) ? true : false;
						if(!res) return res;
					}
					if(element.maxInclusive!==undefined && element.maxInclusive!==null  && typeof element.maxInclusive=='number') {
						
						res= (element.maxInclusive<value*1) ? true : false;
						if(!res) return res;
					}
					
					if(res) {
						console.log('valid');
					}
					return res;
				});
				
				if(!res) return false;
			}

			if(reasonable_ranges && reasonable_ranges.length>0) {
				
				
			}

			return true;

		} else {

			if(pattern_message)
				console.log(pattern_message);
			return false;
		}		
	}


	var normalizeReal=function(value) {
		if(COMA_REAL_REGEXP_EXP.test(value)) {
			value=value.replace(",", ".");
		}

		return value;
	}


	var real=function(value, pattern_message, valid_ranges, reasonable_ranges) {
	
		value=normalizeReal(value);
/*
		console.log('real: '+value);
		
		console.log('test: '+REAL_REGEXP_EXP.test(value));
			
		console.log('*1: '+ value*1);
		console.log('parsed: '+parseFloat(value));
*/


		var res=true;
		if(REAL_REGEXP_EXP.test(value)) {
			if(valid_ranges && valid_ranges.length>0) {
				res=lodash.every(valid_ranges, function(element) {
					var res=true;
					if(element.minExclusive!==undefined && element.minExclusive!==null && typeof element.minExclusive=='number') {
						
						res= (element.minExclusive<value*1) ? true : false;
						if(!res) return res;
					}
					if(element.minInclusive!==undefined && element.minInclusive!==null && typeof element.minInclusive=='number') {
						res= (element.minInclusive<=value*1) ? true : false;
						if(!res) return res;
					}
					if(element.maxExclusive!==undefined && element.maxExclusive!==null  && typeof element.maxExclusive=='number') {
						
						res= (element.maxExclusive>value*1) ? true : false;
						if(!res) return res;
					}
					if(element.maxInclusive!==undefined && element.maxInclusive!==null  && typeof element.maxInclusive=='number') {
						
						res= (element.maxInclusive>value*1) ? true : false;
						if(!res) return res;
					}
					
					if(res) {
						console.log('valid!');
					}
					return res;
				});

				if(!res) return false;
			}

			if(reasonable_ranges && reasonable_ranges.length>0) {
				
			}

			return true;

		} else {
			if(pattern_message)
				console.log(pattern_message);
			return false;
		}		
	}

	var string=function(value) {
		return true;
	}
	var identificator=function(value) {
		var res=value.match(/^[a-zA-Z_]+\w*$/);
		if(res && res.length>0) {
			return true;
		} else {
			return false;
		}

	}

	var enumerator=function(value, list) {

	}	

	var attribute=function(arg, attr) {
		var result;

		switch(attr.type) {
			case "Real" : return real(arg, attr.error_messages.pattern, attr.valid_ranges, attr.reasonable_ranges);
			case "RealPair" : return real(arg, attr.error_messages.pattern, attr.valid_ranges, attr.reasonable_ranges);
			case "Realtriplet" : return real(arg, attr.error_messages.pattern, attr.valid_ranges, attr.reasonable_ranges);
			case "RealSextuplet" : return real(arg, attr.error_messages.pattern, attr.valid_ranges, attr.reasonable_ranges);
			case "Integer" : return integer(arg, attr.error_messages.pattern, attr.valid_ranges, attr.reasonable_ranges);
			case "IntegerTriplet" : return integer(arg, attr.error_messages.pattern, attr.valid_ranges, attr.reasonable_ranges);
			case "Character" : return string(arg);
		}

		return false;
	}

	return {
		attribute:attribute,
		integer:integer,
		real:real,
		normalizeReal:normalizeReal,
		string:string,
		identificator:identificator

	}
}])
	
