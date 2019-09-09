function cgPolyCreate() {//{{{
	cgInit();
	svg.on('mousedown', function() {
		if(d3.event.which==1) {
			m=scaleMouse(d3.mouse(this));
			cg.growing=1;
			cgDecidePoints(m);
			cgSvgPoly();
			delete cg.infant;
		} else if(d3.event.which==3) {
			cgEscapeCreate();
		}
	});
	svg.on('mousemove', function() {
		m=scaleMouse(d3.mouse(this));
		polySnap(m);
		cgDecidePoints(m);
		updatePosInfo();
		if('growing' in cg) { cgUpdatePoly(); }
	});  

	svg.on('mouseup', function() {
		if(cg.polypoints.length>1 && cg.polypoints[0].join()==cg.polypoints.slice(-1)[0].join()) { 
			cgAcceptPoly();
			cgDb();
			cgInit(); 
			showBuildingLabels(); 
		}
		updateSnapLinesPoly();
	});
}
//}}}
function cgSvgPoly(pparent='auto') { //{{{
	cg.polySegmentOrigin=[cg.x1, cg.y1];
	cg.polypoints.push([cg.x1, cg.y1]);

	if(pparent=='auto') { pparent="#floor"+cg.floor; }
	$("#"+cg.name).remove();
	d3.select(pparent)
		.append('circle')
		.attr('class', 'temp-poly').attr('cx', cg.x1).attr('cy', cg.y1).attr('r',20).attr('fill', "#00ffff")
	d3.select(pparent)
		.append('polyline')
		.attr('id', cg.name)
		.attr('points', cg.polypoints.join(" "))
		.attr('fill-opacity', 0)
		.attr('stroke', '#088')
		.attr('stroke-width', '6px')
	d3.select(pparent)
		.append('polyline')
		.attr('id', 'last-segment')
		.attr('class', 'temp-poly')
		.attr('fill-opacity', 0)
		.attr('stroke', '#088')
		.attr('stroke-width', '2px')
}
//}}}
function updateSnapLinesPoly() {//{{{
	snapLinesArr['horiz']=[];
	snapLinesArr['vert']=[];
	d3.select("#snapLinesSvg").selectAll("line").remove();
	_.each(cg.polypoints, function(point) { 
		snapLinesArr['horiz'].push(point[1]);
		snapLinesArr['vert'].push(point[0]);
		snapLinesSvg.append('line').attr('id' , 'sh_'+point[1]).attr('class' , 'snap_v').attr('y1' , point[1]).attr('y2' , point[1]).attr('x1' , -100000).attr('x2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sv_'+point[0]).attr('class' , 'snap_h').attr('x1' , point[0]).attr('x2' , point[0]).attr('y1' , -100000).attr('y2' , 100000).attr("visibility", "hidden");
	});
}
//}}}
function polyKeepOrtho(m) {//{{{
	if ('polySegmentOrigin' in cg && !(event.ctrlKey)) { 
		if(Math.abs(m.x-cg.polySegmentOrigin[0]) > Math.abs(m.y-cg.polySegmentOrigin[1])) {
			m.y=cg.polySegmentOrigin[1];
		} else {
			m.x=cg.polySegmentOrigin[0];
		}
	}
	return m;
}
//}}}
function polySnap(m) {//{{{
	cg.x1=m.x;
	cg.y1=m.y;
	
	m=polyKeepOrtho(m);

	activeSnap={};
	snappingHide(0);

	activeSnapX(m); 
	activeSnapY(m); 

	if(isEmpty(activeSnap)) { snappingHide();  } else { snappingShow(m); }
}
//}}}
function cgUpdatePoly() {//{{{
	points=[cg.polySegmentOrigin.join(","), [cg.x1, cg.y1].join(",")].join(" ");
	d3.select("#last-segment").attr('points', points) 
}
//}}}
function cgAcceptPoly() {//{{{
	$("#"+cg.name).attr('class', gg[cg.letter].t + " " +gg[cg.letter].x).attr('fill-opacity', 0.4).attr('stroke', '#088');
	$(".temp-poly").remove();
}
//}}}
