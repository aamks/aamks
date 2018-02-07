import { Component, OnInit, ViewChild } from '@angular/core';
import * as CodeMirror from 'codemirror';
import 'codemirror/keymap/vim';
import 'codemirror/mode/fds/fds';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/fds-hint';
import 'codemirror/addon/display/fullscreen';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/fds-fold';

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss']
})
export class InputFileComponent implements OnInit {

  @ViewChild('host') host;

  private value = " \
  # ---- General ---- \
&HEAD TITLE='Simulation title', CHID='Chid_out' / \n\
&TIME T_END=1200 / \n\
 \n\
# ---- Mesh ---- \n\
&MESH IJK=64,54,16, XB=-86.4,-60.8,6,27.6,-0.2,6 / \n\
&MESH IJK=58,54,16, XB=-60.8,-37.6,6,27.6,-0.2,6 / \n\
&MESH IJK=58,54,16, XB=-37.6,-14.4,6,27.6,-0.2,6 / \n\
&MESH IJK=58,54,16, XB=-14.4,8.8,6,27.6,-0.2,6 / \n\
&MESH IJK=56,54,16, XB=8.8,31.2,6,27.6,-0.2,6 / \n\
&MESH IJK=54,54,16, XB=31.2,52.8,6,27.6,-0.2,6 / \n\
&MESH IJK=54,54,16, XB=52.8,74.4,6,27.6,-0.2,6 / \n\
&MESH IJK=122,72,32, XB=-86.4,-37.6,-0.8,28,6,18.8 / \n\
&MESH IJK=148,90,32, XB=37.2,96.4,2.4,38.4,6,18.8 / \n\
&MESH IJK=144,60,32, XB=-20.4,37.2,27.2,51.2,6,18.8 / \n\
&MESH IJK=523,54,13, XB=74.4,283.6,6,27.6,-0.2,5 / \n\
&MESH IJK=517,54,13, XB=-293.2,-86.4,6,27.6,-0.2,5 / \n\
 ";

  private config = {};
  private editorOptions = {
    lineNumbers: true,
    styleActiveLine: true,
    theme: 'fds',
    extraKeys: {
      //  'Ctrl-Space': function (cm) { autoComplete(cm); },
      'F11': (cm) => {
        if (!cm.getOption("fullScreen")) cm.setOption('fullScreen', true);
        else if (cm.getOption("fullScreen")) cm.setOption('fullScreen', false);
      },
      //'F10': (cm) => { this.ampersNumbers(cm) },
      //  'F9': function (cm) { tabularize(cm) },
      //  'Ctrl-Q': function (cm) { cm.foldCode(cm.getCursor(), { scanUp: true }); },
      //  'Ctrl-1': function (cm) { foldAll(cm) },
      //  'Ctrl-2': function (cm) { unfoldAll(cm) },
      //  'F1': function (cm) { getHelp(cm) },
      //  'Ctrl-3': function (cm) { highlightErrors(cm) },
      //  'Ctrl-4': function (cm) { findNextError(cm) },
    },
    mode: { name: 'fds', globalVars: true },
    keyMap: 'vim',
    matchBrackets: true,
    showCursorWhenSelecting: true,
    tabSize: 6,
    indentUnit: 6,
    lineWrapping: true,
    completeSingle: false,
    viewportMargin: 10,
    scrollbarStyle: 'simple',
    foldGutter: true,
    gutters: ['ampers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  }
  test() {
    console.log("dupaaa");
  }

  private cm = null;

  constructor() { }

  ngOnInit() {
  }

  /**
   * On component view init
   */
  ngAfterViewInit() {
    this.config = this.editorOptions || {};
    this.codemirrorInit(this.config);
  }

  /**
   * Initialize codemirror
   */
  codemirrorInit(config) {
    this.cm = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.cm.setValue(this.value);
  }


  /**
   * 
   * @param cm CodeMirror instance
   */
  public ampersNumbers(cm) {
    let ampers = {};
    let word = /&\w+/;
    let re = new RegExp(word), match;
    let reRampId = new RegExp(/id.+?'(.+)?'/i), matchRampId;
    let rampId;
    let lineNumber = 0;
    cm.eachLine(function (line) {
      match = re.exec(line.text);
      if (match != null) {
        var info = cm.lineInfo(line);
        // Ramp handling
        if (match.toString().toUpperCase() == '&RAMP' && !(match.toString() in ampers)) {
          ampers[match.toString()] = 1;
          matchRampId = reRampId.exec(line.text);
          rampId = matchRampId[1].toString();
          cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : this.makeMarker(match.toString().substr(1, 4) + ampers[match.toString()].toString()));
        } else if (match.toString().toUpperCase() == '&RAMP' && (match.toString() in ampers)) {
          matchRampId = reRampId.exec(line.text);
          if (rampId != matchRampId[1].toString()) {
            ampers[match.toString()] += 1;
            rampId = matchRampId[1].toString();
            cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : this.makeMarker(match.toString().substr(1, 4) + ampers[match.toString()].toString()));
          }
        } else {
          // Other ampers handling
          if (!(match.toString() in ampers)) {
            ampers[match.toString()] = 1;
            cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : this.makeMarker(match.toString().substr(1, 4) + ampers[match.toString()].toString()));
          } else {
            ampers[match.toString()] += 1;
            cm.setGutterMarker(lineNumber, 'ampers', info.gutterMarkers ? null : this.makeMarker(match.toString().substr(1, 4) + ampers[match.toString()].toString()));
          }
        }
      }
      lineNumber++;
    });
  }

  public makeMarker(amper) {
    let marker = document.createElement('div');
    marker.style.color = '#99cc00';
    marker.style.paddingLeft = '5px';
    marker.innerHTML = amper;
    return marker;
  }

}
