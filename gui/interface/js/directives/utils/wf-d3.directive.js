angular.module('wf-d3.directive', ['wf-globals.service','wf-safe-apply.service', 'ngLodash'])
.directive('wfD3', function($state, $stateParams, Globals, $window, SafeApply, lodash) {
		
	function link(scope, element, attrs) {

		if(attrs.type && attrs.type=='curve') {
			scope.type='curve';

		} else {
			scope.type='ramp';
		}

		scope.xunit=attrs.xunit;
		scope.yunit=attrs.yunit;

		scope.functions={
			addPoint:function() {
			},
			points:function(steps, value, type) {
				var points=[];
				var sortedSteps=lodash.sortBy(steps, function(step) {
					return step.t;
				});
				if(type=='ramp') {
					lodash.forEach(sortedSteps, function(o) {
						points.push({x:o.t*1, y:o.f*1*value});
					});

				} else if(type=='curve') {
					lodash.forEach(sortedSteps, function(elem, index, collection) {
						if(collection.length>1) {
							if(index==0) {

								points.push({x:elem.t*1, y:elem.f*1*value});
							} else {

								var tdiff=elem.t*1-collection[index-1].t*1;
								var fdiff=elem.f*1*value-collection[index-1].f*1*value;
								
								var h_coeff=collection[index-1].t*1;
								var k_coeff=collection[index-1].f*1*value;
								var x_coeff=elem.t*1;
								var y_coeff=elem.f*1*value;
							
								if(fdiff>0) {
									var a_coeff=(y_coeff+k_coeff)/((x_coeff-h_coeff)*(x_coeff-h_coeff));
								}

								if(fdiff==0) {
									var a_coeff=0;
								}

								for(var i=0; i<=10; i++) {
									var current_t=collection[index-1].t*1+0.1*tdiff*i;
									//var current_f=collection[index-1].f*1*value+0.1*fdiff*i;
									if(fdiff>=0) {
										var current_f=a_coeff*(current_t-h_coeff)*(current_t-h_coeff)+k_coeff;
									} else {
										var current_f=collection[index-1].f*1*value+0.1*fdiff*i;
									}

									points.push({x:current_t, y:current_f});
								}
							}
						} else {
							points.push({x:elem.t*1, y:elem.f*1*value});
						}
					});
				}
				return points;
			},
			boundary_points:function(steps, value, type) {
				var points=[];
				var sortedSteps=lodash.sortBy(steps, function(step) {
					return step.t;
				});
				lodash.forEach(sortedSteps, function(o) {
					points.push({x:o.t*1, y:o.f*1*value});
				});

				return points;
			}
		}

		function findRange(arr, type, key) {
			if(type=='max') {	
				res=lodash.chain(arr).sortBy(function(o){return o[key]*1}).reverse().head().value()[key];
				console.log(res);
			} else if(type=='min') {
				res=lodash.chain(arr).sortBy(function(o){return o[key]*1}).head().value()[key];
			} else {
				res=0;
			}

			return res;
		}

		scope.plotData=[];
		scope.boundaryData=[];


			//lodash.sortBy(scope.points, 'x', function(o) {return o.x*1});
		var padding = 40;
		var pathClass = "path";
		var xScale, yScale, xAxisGen, yAxisGen, lineFun;
			
		var d3 = $window.d3;
		var rawSvg = element.find("svg");
		var svg = d3.select(rawSvg[0]);

		scope.width=rawSvg.attr("width");
		scope.height=rawSvg.attr("height");

		function setChartParameters(){
			// domain - przedzial wartosci zmiennych
			// range - przedzial wymiarow w pikselach
			// poczatki i konce pokrywaja sie, pomiedzy - interpolacja okreslona
			// w rodzaju skali
			scope.plotData=scope.functions.points(scope.steps, scope.value, scope.type);
			scope.boundaryData=scope.functions.boundary_points(scope.steps, scope.value, scope.type);
			
			xScale = d3.scale.linear()
			.domain([findRange(scope.boundaryData, 'min', 'x'), findRange(scope.boundaryData, 'max', 'x')])
			.range([padding + 5, rawSvg.attr("width") - padding]);
			yScale = d3.scale.linear()
			.domain([0, d3.max(scope.boundaryData, function (d) {
				return 1.2*d.y;
			})])
			.range([rawSvg.attr("height") - padding, padding]);
			xAxisGen = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(scope.plotData.length - 1);
			yAxisGen = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(5);
			lineFun = d3.svg.line()
			.x(function (d) {
				return xScale(d.x);
			})
			.y(function (d) {
				return yScale(d.y);
			})
			.interpolate('linear');
		}
         
		function drawLineChart() {
			svg.selectAll("*").remove();
	  		setChartParameters();

	    	svg.append("svg:g")
			.attr("class", "x axis")
			.attr("fill", "rgb(250,250,250)")
			.attr("transform", "translate(0,"+(rawSvg.attr("height")-padding)+")")
			.call(xAxisGen);

			svg.append("text")
			.attr("class", "x label")
			.attr("fill", "rgb(250,250,250)")
			.attr("text-anchor", "middle")
			.attr("x", (scope.width-padding)/2)
			.attr("y", scope.height - 6)
			.text(scope.xunit);

			svg.append("svg:g")
			.attr("class", "y axis")
			.attr("fill", "rgb(250,250,250)")
			.attr("transform", "translate(45,0)")
			.call(yAxisGen);
	
			svg.append("text")
	    	.attr("class", "y label")
			.attr("fill", "rgb(250,250,250)")
			.attr("transform", "rotate(-90)")
		    .attr("text-anchor", "middle")
			.attr("y", 0)
			.attr("x", -1*(scope.height-padding)/2)
			.attr("dy", ".75em")
			.text(scope.yunit);

			svg.append("svg:path")
			.attr({
				d: lineFun(scope.plotData),
				"stroke": "rgb(250,250,250)",
				"stroke-width": 1,
				"fill": "none", 
				"class": pathClass
			});

 			svg.selectAll("dot")
	        .data(scope.boundaryData)
			.enter().append("circle")
			.attr("r", 4)
			.attr("fill", "rgb(250,250,250)")
			.attr("cx", function(d) { return xScale(d.x); })
			.attr("cy", function(d) { return yScale(d.y); });

		}

		drawLineChart();

		scope.$watch('steps', function(newValue, oldValue) {
			drawLineChart();
		}, true);

		scope.$watch('value', function(newValue, oldValue) {
			drawLineChart();
		}, true);

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/utils/wf-d3',
		link : link,
		constroller: controller,
		scope : {
			steps:'=',
			value:'='
		}
	}



})

