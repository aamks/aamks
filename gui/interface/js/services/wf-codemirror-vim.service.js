angular.module('wf-codemirror-vim.service', ['wf-help.service'])
.service('CodemirrorVim', ['HelpManager', '$window', function(HelpManager, $window) {

// Gutter
	function ampersNumbers(cm){//{{{
		var ampers = {};
		var word = /&\w+/;
		var re = new RegExp(word), match;
		var reRampId = new RegExp(/id.+?'(.+)?'/i), matchRampId;
		var rampId;
		var lineNumber = 0;
		cm.eachLine(function(line) { 
			match = re.exec(line.text);
			if(match != null){
				var info = cm.lineInfo(line);
				// Ramp handling
				if(match.toString().toUpperCase() == '&RAMP' && !(match.toString() in ampers)){
					ampers[match.toString()] = 1;
					matchRampId = reRampId.exec(line.text);
					rampId = matchRampId[1].toString();
					cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
				} else if(match.toString().toUpperCase() == '&RAMP' && (match.toString() in ampers)) {
					matchRampId = reRampId.exec(line.text);
					if(rampId != matchRampId[1].toString()){
						ampers[match.toString()] += 1;
						rampId = matchRampId[1].toString();
						cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
					}
				} else {
				// Other ampers handling
					if(!(match.toString() in ampers)){
						ampers[match.toString()] = 1;
						cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
					} else {
						ampers[match.toString()] += 1;
						cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
					}
				}
			}
			lineNumber++;
		});
	}//}}}
	function gutterClick(cm, n) {//{{{
		var ampers = {};
		var word = /&\w+/;
		var re = new RegExp(word), match;
		var reRampId = new RegExp(/id.+?'(.+)?'/i), matchRampId;
		var rampId;
		var lineNumber = 0;
		cm.eachLine(0, n + 1, function(line) { 
			match = re.exec(line.text)
			if(match != null){
				var info = cm.lineInfo(line);
				// Ramp handling
				if(match.toString().toUpperCase() == '&RAMP' && !(match.toString() in ampers)){
					ampers[match.toString()] = 1;
					matchRampId = reRampId.exec(line.text);
					rampId = matchRampId[1].toString();
					if(lineNumber == n) cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
				} else if(match.toString().toUpperCase() == '&RAMP' && (match.toString() in ampers)) {
					matchRampId = reRampId.exec(line.text);
					if(rampId != matchRampId[1].toString()){
						ampers[match.toString()] += 1;
						rampId = matchRampId[1].toString();
						if(lineNumber == n) cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
					} else if(lineNumber == n) cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
				} else {
				// Other ampers handling
					if(!(match.toString() in ampers)){
						ampers[match.toString()] = 1;
						if(lineNumber == n) cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
					} else {
						ampers[match.toString()] += 1;
						if(lineNumber == n) cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : makeMarker(match.toString().substr(1,4) + ampers[match.toString()].toString()));
					}
				}
			}
			lineNumber++;
		});
	};//}}}
	function makeMarker(amper) {//{{{
		var marker = document.createElement('div');
		marker.style.color = '#99cc00';
		marker.style.paddingLeft = '5px';
		marker.innerHTML = amper;
		return marker;
	}//}}}
	function makeMarkerError(amper) {//{{{
		var marker = document.createElement('div');
		marker.className = 'CodeMirror-line-error';
		//marker.style.color = 'red';
		//marker.style.paddingLeft = '5px';
		marker.innerHTML = amper;
		return marker;
	}//}}}

// Autocomplete fds-hint
	var ExcludedIntelliSenseTriggerKeys =//{{{
	{
		//'8': 'backspace',
		//'9': 'tab',
		'13': 'enter',
		'16': 'shift',
		'17': 'ctrl',
		'18': 'alt',
		'19': 'pause',
		'20': 'capslock',
		'27': 'escape',
		'33': 'pageup',
		'34': 'pagedown',
		'35': 'end',
		'36': 'home',
		'37': 'left',
		'38': 'up',
		'39': 'right',
		'40': 'down',
		'45': 'insert',
		'46': 'delete',
		'91': 'left window key',
		'92': 'right window key',
		'93': 'select',
		'107': 'add',
		'109': 'subtract',
		'110': 'decimal point',
		'111': 'divide',
		'112': 'f1',
		'113': 'f2',
		'114': 'f3',
		'115': 'f4',
		'116': 'f5',
		'117': 'f6',
		'118': 'f7',
		'119': 'f8',
		'120': 'f9',
		'121': 'f10',
		'122': 'f11',
		'123': 'f12',
		'144': 'numlock',
		'145': 'scrolllock',
		'186': 'semicolon',
		'187': 'equalsign',
		'188': 'comma',
		'189': 'dash',
		'190': 'period',
		'191': 'slash',
		'192': 'graveaccent',
		'220': 'backslash',
		'222': 'quote'
	}//}}}
	function keyUp(cm, event) {//{{{
		var __Cursor = cm.getDoc().getCursor();
		var __Token = cm.getTokenAt(__Cursor);

		if (!cm.state.completionActive &&
			!ExcludedIntelliSenseTriggerKeys[(event.keyCode || event.which).toString()] &&
			((__Token.type != 'comment' && __Token.type != null) || (__Token.state.inAmper == true)))
		{
			if(cm.options.keyMap == 'vim-insert' && CodeMirror.Vim.maybeInitVimState_(cm).insertMode == true) {
				CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
			} else if(cm.options.keyMap == 'default') {
				CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
			}
		}
	};//}}}
	function autoComplete(cm) {//{{{
		var __Cursor = cm.getDoc().getCursor();
		var __Token = cm.getTokenAt(__Cursor);
		CodeMirror.commands.autocomplete(cm, null, { completeSingle: false, ac: true });
	}//}}}

// Tabularize
function tabularize(editor) {//{{{
	var match, k = 0;
	var commaMax = {};
	var commaLines = {};
	var commaPos = [];
	
	var anchor = editor.listSelections()[0].anchor.line;
	var head = editor.listSelections()[0].head.line;
	var i = anchor;

	if (anchor > head){
		anchor = head;
		head = i;
		i = anchor;
	}

	// Wyszukuje maksymalne lokalizacje przecinkow
	editor.eachLine((anchor != head) ? anchor : null, (anchor != head) ? head + 1 : null, function(line) {
		for(var j = 0; j < line.text.length; j++){
			match = line.text[j].indexOf(',');
			if(match > -1){
				//console.log(i + ': ' + j);
				k++;
				if(commaMax[k] == null){
					commaMax[k] = j;
					//editor.setCursor({line: i, ch: j});
				} else {
					if(commaMax[k] < j){
						commaMax[k] = j;
						//editor.setCursor({line: i, ch: j});
					}
				}
				commaPos.push(j);
			}
		}
		if(k > 0) commaLines[i] = commaPos;
		commaPos = [];
		i++;
		k = 0;
	});

	//console.log(commaMax);
	//console.log(commaLines);
	var commaArray;
	var actualPos;
	var maxPos;
	var lineInt;

	// Sprawdzanie, czy po przesunieciu actualPos nie bedzie wieksza niz
	// maxPos, jezeli tak to uaktualnia obiekt commaMax
	for(var line in commaLines){
		commaArray = commaLines[line];
		//console.log(commaArray);
		lineInt = parseInt(line);
		for(i = 0; i < commaArray.length; i++){
			if(i == 0){
				actualPos = commaArray[i];
				//console.log('actualPos: ' + actualPos);
				maxPos = commaMax[i + 1];
				//console.log('maxPos: ' + maxPos);
			} else {
				actualPos = commaMax[i] + (commaArray[i] - commaArray[i - 1]);
				//console.log('actualPos: ' + actualPos);
				maxPos = commaMax[i + 1];
				//console.log('maxPos: ' + maxPos);
				if(actualPos > maxPos) commaMax[i + 1] = actualPos;
			}
		}
	}

	//console.log(commaMax);
	//console.log(commaLines);

	// Dodaje spacje tak aby wyrownac do commaMax
	for(var line in commaLines){
		commaArray = commaLines[line];
		//console.log(commaArray);
		lineInt = parseInt(line);
		for(i = 0; i < commaArray.length; i++){
			if(i == 0){
				actualPos = commaArray[i];
				//console.log('actualPos: ' + actualPos);
				maxPos = commaMax[i + 1];
				//console.log('maxPos: ' + maxPos);
				editor.setCursor({line: lineInt, ch: actualPos});
				if(maxPos > actualPos) editor.replaceSelection(" ".repeat(maxPos - actualPos));
			} else {
				actualPos = commaMax[i] + (commaArray[i] - commaArray[i - 1]);
				//console.log('actualPos: ' + actualPos);
				maxPos = commaMax[i + 1];
				//console.log('maxPos: ' + maxPos);
				editor.setCursor({line: lineInt, ch: actualPos});
				if(maxPos > actualPos) editor.replaceSelection(" ".repeat(maxPos - actualPos));
				if(actualPos > maxPos) commaMax[i + 1] = actualPos; // Dodane drugie sprawdzenie pozycji maxPos
			}
		}
	}
}//}}}

// findHelp
function getHelp(editor){//{{{

	var cursor = editor.getCursor();
	var token = editor.getTokenAt(cursor);
	
	// If in amper line
	if(token.state.inAmper == true){
		if(token.type == 'keyword'){
			var fullToken=token.state.amper + ':' + token.state.amper;
			HelpManager.getHelpForToken(fullToken).then(function(helpUrl) {
				$window.open('/views/mimooh/'+helpUrl);
				// obsługa braku pomocy	
			}, function() {

			});
		} else if(token.type == token.state.amper.toLowerCase().substr(1,4)){
			var attribute = token.string.match(/[\w\d]+/);
			
			var fullToken=token.state.amper + ':' + attribute;
			HelpManager.getHelpForToken(fullToken).then(function(helpUrl) {
				$window.open('/views/mimooh/'+helpUrl);
				// obsługa braku pomocy	
			}, function() {

			});

		}
	}
}//}}}

// Folding
function foldAll(editor){//{{{
	for (var l = editor.firstLine(); l <= editor.lastLine(); ++l)
		editor.foldCode({line: l, ch: 0}, null, "fold");
}//}}}
function unfoldAll(editor) {//{{{
	for (var i = 0; i < editor.lineCount() ; i++) {
		editor.foldCode({ line: i, ch: 0 }, null, "unfold");
	}
}//}}}

// Errors highlighting
function highlightErrors(cm) {//{{{
	var lines = [3, 13, 18, 6, 55];
	for(var i = 0; i < lines.length; i++){
		//editor.addLineClass(lines[i], 'background', 'CodeMirror-line-error');

		var ampers = {};
		var word = /&\w+/;
		var re = new RegExp(word), match;
		var reRampId = new RegExp(/id.+?'(.+)?'/i), matchRampId;
		var rampId;
		var lineNumber = 0;
		cm.eachLine(0, lines[i] + 1, function(line) { 
			match = re.exec(line.text)
			if(match != null){
				var info = cm.lineInfo(line);
				// Ramp handling
				if(match.toString().toUpperCase() == '&RAMP' && !(match.toString() in ampers)){
					ampers[match.toString()] = 1;
					matchRampId = reRampId.exec(line.text);
					rampId = matchRampId[1].toString();
					if(lineNumber == lines[i]) cm.setGutterMarker(lineNumber, 'ampers', makeMarkerError('!&nbsp;' + match.toString().substr(1,4) + ampers[match.toString()].toString()));
				} else if(match.toString().toUpperCase() == '&RAMP' && (match.toString() in ampers)) {
					matchRampId = reRampId.exec(line.text);
					if(rampId != matchRampId[1].toString()){
						ampers[match.toString()] += 1;
						rampId = matchRampId[1].toString();
						if(lineNumber == lines[i]) cm.setGutterMarker(lineNumber, 'ampers', makeMarkerError('!&nbsp;' + match.toString().substr(1,4) + ampers[match.toString()].toString()));
					} else if(lineNumber == lines[i]) cm.setGutterMarker(lineNumber, 'ampers', makeMarkerError('!&nbsp;' + match.toString().substr(1,4) + ampers[match.toString()].toString()));
				} else {
				// Other ampers handling
					if(!(match.toString() in ampers)){
						ampers[match.toString()] = 1;
						if(lineNumber == lines[i]) cm.setGutterMarker(lineNumber, 'ampers', makeMarkerError('!&nbsp;' + match.toString().substr(1,4) + ampers[match.toString()].toString()));
					} else {
						ampers[match.toString()] += 1;
						if(lineNumber == lines[i]) cm.setGutterMarker(lineNumber, 'ampers', makeMarkerError('!&nbsp;' + match.toString().substr(1,4) + ampers[match.toString()].toString()));
					}
				}
			}
			lineNumber++;
		});
	}

}//}}}
function findNextError(editor){//{{{
	currentLine = editor.getCursor().line;
	for (var l = currentLine; l <= editor.lastLine() + 1; l++){
		try {
			if(editor.lineInfo(l).gutterMarkers.ampers.className == 'CodeMirror-line-error'){
				editor.setCursor({line: l, ch: 0});
				if(l != currentLine) break;
			}
			else {
				if(l == editor.lastLine()) l = 0;
			}
		}
		catch(err) { }
	//	editor.foldCode({line: l, ch: 0}, null, "fold");
	}
}//}}}

// Protect ID
function beforeChange(cm, obj) {//{{{
	//console.log(cm);
	//console.log(obj);
	var begin=obj.from;
	var end=obj.to;

	var text=cm.doc.getRange(begin, end);
	var token=cm.getTokenAt(begin);
	//console.log(token);
	if(token.type=="id") {
		obj.cancel();
	}

	var docValue=cm.doc.getValue();
	//console.log(docValue);
	
	//var re=/&\w+(.|\n)[^&]* \//;

	var match=docValue.match(/&\w+(.|\n)[^&]* \//g);
	if(match){
		//console.log(match.length);
	}
}//}}}

// MATLs autocoplete
function getFromMatlsLibrary() {//{{{
	

}//}}}
// SURFs autocoplete
function getFromMatlsLibrary() {//{{{


}//}}}

	var editorOptions={
			lineNumbers: true,
			styleActiveLine: true,
			theme: 'fds',
			extraKeys: {
				'Ctrl-Space': function(cm) { autoComplete(cm); },
				'F11': function(cm) { 
					if (!cm.getOption("fullScreen")) cm.setOption('fullScreen', true);
					else if (cm.getOption("fullScreen")) cm.setOption('fullScreen', false);
				},
				'F10': function(cm) { ampersNumbers(cm) },
				'F9': function(cm) { tabularize(cm) },
				'Ctrl-Q': function(cm) { cm.foldCode(cm.getCursor(), { scanUp: true}); },
				'Ctrl-1': function(cm) { foldAll(cm) },
				'Ctrl-2': function(cm) { unfoldAll(cm) },
				'F1': function(cm) { getHelp(cm) },
				'Ctrl-3': function(cm) { highlightErrors(cm) },
				'Ctrl-4': function(cm) { findNextError(cm) },
			},
			mode: {name: 'fds', globalVars: true},
			keyMap: 'vim',
			matchBrackets: true,
			showCursorWhenSelecting: true,
			tabSize: 6,
			indentUnit: 6,
			lineWrapping: true,
			completeSingle: false,
			viewportMargin: 10,
			//scrollbarStyle: 'simple',
			foldGutter: true,
			gutters: ['ampers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
	}

	function onLoad(editor) {
		//editor.on('gutterClick', gutterClick);
		//editor.on('keyup', keyUp);
		editor.on('beforeChange', beforeChange);	
	}

	function changeMode(modeName, editor) {
		if('vim'==modeName) {
			editor.setOption('keyMap', 'vim');
		} else if('default'==modeName) {
			editor.setOption('keyMap','default');
		}
	}

	
	return {
		//autoComplete : autoComplete,
		//ampersNumbers: ampersNumbers,
		editorOptions: editorOptions,
		onLoad : onLoad,
		//tabularize : tabularize,
		//changeMode: changeMode
	}
}]);




// Help form pdf
// TODO: zmienic podejscie i wykorzystac token.state.amper
//editor.setOption('extraKeys', {//{{{
//	';': function(editor) {
//
//		var line = editor.getCursor().line,
//			char = editor.getCursor().char;
//		var cursor = editor.getCursor();
//		var token = editor.getTokenAt(cursor);
//
//
//
//		if(token.type == 'keyword'){
//			console.log('Szukaj: ' + token.string);
//
//			if(typeof(winRef) == 'undefined' || winRef.closed){
//				  //create new
//					//winRef = window.open('FDS_User_Guide.pdf#section.7.1');
//			} else {
//				  //it exists, load new content
//					//winRef.location.href = 'FDS_User_Guide.pdf#section.7.3';
//					//winRef.focus(); // Nie działa w FireFox - trzeba konfigurować przeglądarkę, żeby pozwalała na takie coś
//
//					// Można to rozwiązać w poniższy sposób, jednak wymaga to każdorazowego przeładowania dokumentu - a to trochę trwa, wcześniejsza metoda jest dużo szybsza!!!
//					//winRef.close();
//					//winRef = window.open('FDS_User_Guide.pdf#section.7.4');
//
//					// Najlepiej będzie zrobić jakiegoś dialog boxa i wyświetlać jako iframe lub coś takiego - pytanie, czy moża będzie wtedy nawigować po dokumencie bez ponownego przeładowania zawartości.
//			}
//
//		}
//		else if(token.type == 'builtin'){
//			amper = editor.getSearchCursor('&', {line, char}); 
//			amper.findPrevious();
//			slash = editor.getSearchCursor('\/', {line, ch: amper.pos.to.ch}); 
//			slash.findPrevious();
//
//			if(amper.pos.to.line > slash.pos.to.line){
//				var tokenAmper = editor.getTokenAt(amper.pos.to);
//				console.log('Szukaj: ' + token.string + ' w: ' + tokenAmper.string);
//				//window.open('FDS_User_Guide.pdf#section.7.1');
//			}
//			else {
//				console.log('Błedna linijka, którą przeszukujesz ...');
//			}
//		}
//		else {
//			console.log('Brak pomocy dla danego elementu ...');
//		}
//	}
//});//}}}
	
