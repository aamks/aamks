import { Component, OnInit, ViewChild } from '@angular/core';
import * as CodeMirror from 'codemirror';

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss']
})
export class InputFileComponent implements OnInit {

  @ViewChild('host') host;

  private value = '';
  private config = {};
  private editorOptions = {
    lineNumbers: true,
    styleActiveLine: true,
    theme: 'fds',
    extraKeys: {
    //  'Ctrl-Space': function (cm) { autoComplete(cm); },
    //  'F11': function (cm) {
    //    if (!cm.getOption("fullScreen")) cm.setOption('fullScreen', true);
    //    else if (cm.getOption("fullScreen")) cm.setOption('fullScreen', false);
    //  },
    //  'F10': function (cm) { ampersNumbers(cm) },
      'F10': (cm) => { this.test() },
    //  'F9': function (cm) { tabularize(cm) },
    //  'Ctrl-Q': function (cm) { cm.foldCode(cm.getCursor(), { scanUp: true }); },
    //  'Ctrl-1': function (cm) { foldAll(cm) },
    //  'Ctrl-2': function (cm) { unfoldAll(cm) },
    //  'F1': function (cm) { getHelp(cm) },
    //  'Ctrl-3': function (cm) { highlightErrors(cm) },
    //  'Ctrl-4': function (cm) { findNextError(cm) },
    },
    //mode: { name: 'fds', globalVars: true },
    //keyMap: 'vim',
    matchBrackets: true,
    showCursorWhenSelecting: true,
    tabSize: 6,
    indentUnit: 6,
    lineWrapping: true,
    //completeSingle: false,
    //viewportMargin: 10,
    //scrollbarStyle: 'simple',
    //foldGutter: true,
    //gutters: ['ampers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  }
   test () {
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


}
