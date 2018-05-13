import { Main } from '../../../../services/main/main';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { defColors } from './colors';
import { forEach } from 'lodash';
import { HttpManagerService, Result } from '../../../../services/http-manager/http-manager.service';
import { MainService } from '../../../../services/main/main.service';
import { PaperScope, Project, View, Point, Group, Path, Size, PointText, Event } from 'paper';
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  @ViewChild('canvasElement') canvasElement: ElementRef;

  @HostListener('wheel', ['$event'])
  onWheel(event) {
    console.log(event);
    console.log(this.project.view.zoom);
    if (event.deltaY < 0) { 
      this.project.view.scale(0.9);
      //this.project.view.zoom -= 0.1;
    } else {
      this.project.view.scale(1.1);
      //this.project.view.zoom += 0.1;
    }
  }

  scope: PaperScope;
  project: Project;

  objectKeys = Object.keys;

  private subscribe: boolean = true;
  main: Main;

  scale = 1; fireScale; intervalId; fireScaleCounter; colors; colorsDb;
  staticGeoms: Group;
  burningFireLocation; wallsSize; doorsSize; ballsSize; velocitiesSize; evacBalls; evacLabels; evacVelocities; burningFire; evacueesData; numberOfEvacuees;
  rooms = {};
  doors = {};
  obstacles; dd_geoms; lerps; lastFrame = 1; deltaTime = 0; timeShift = 0; labelsSize = 40; sliderPos = 0; lerpFrame = 0; frame = 0; visContainsAnimation = 0; animationIsRunning = 0;

  chooseVisArray = [];
  chooseVis;
  dstatic = {};
  visTitle = "";
  animationControls = Array.apply(null, { length: 100 }).map(Number.call, Number);
  style = "Dark";

  constructor(
    private httpManager: HttpManagerService,
    private mainService: MainService,
  ) {
    this.colorsDb = defColors;
    this.colors = this.colorsDb.darkColors;
  }

  ngOnInit() {
    console.clear();
    this.mainService.getMain().takeWhile(() => this.subscribe).subscribe(main => this.main = main);

    // Init paperjs
    this.scope = new PaperScope();
    this.project = new Project(this.canvasElement.nativeElement);

    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/getAnims/' + this.main.currentProject.id + '/' + this.main.currentRiskScenario.id).then((result: Result) => {
      this.chooseVisArray = JSON.parse(result.data['anims']);
      this.chooseVis = this.chooseVisArray[0];
      //this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });

    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/getStatic/' + this.main.currentProject.id + '/' + this.main.currentRiskScenario.id).then((result: Result) => {
      this.dstatic = JSON.parse(result.data['static'])
      this.showStaticImage(this.chooseVis);
    });

    // Initializing
    this.project.view.onMouseDrag = (event) => {
      let offset = new Point(this.staticGeoms.position.x + event.delta.x, this.staticGeoms.position.y + event.delta.y)
      this.staticGeoms.position = offset;
    }






  }
  ngOnDestroy() {
    this.subscribe = false;
  }


  public zoom(event) {
    console.log(event);
  }

  public changeChooseVis() {
    this.lerpFrame = 0;
    this.frame = 0;
    this.visContainsAnimation = 0;
    this.animationIsRunning = 0;
    this.showStaticImage(this.chooseVis);
  }

  public changeStyle() {
    if (this.style == "Light") {
      this.doorsSize = 0;
      this.labelsSize = 0;
      this.resetCanvas();
      this.colors = this.colorsDb['lightColors']
    } else {
      this.colors = this.colorsDb['darkColors']
    }
    this.resetCanvas();
    this.canvasElement.nativeElement.style.background = this.colors['bg'];
  }

  public showStaticImage(chosenAnim) {
    // After we read a record from anims.json we reset the current visualization and setup a new one.
    // We can only start animation after we are done with static rooms, doors etc.
    // Paperjs can only scale relative to current size, so we must always return to the previous scale in view.scale().

    var floor = chosenAnim["floor"];
    var newScale = this.dstatic[floor]['meta']['scale'];

    this.project.view.scale(newScale / this.scale);
    this.scale = newScale;
    this.project.view.center = new Point(this.dstatic[floor]['meta']['translate']);

    this.visTitle = chosenAnim['title'];
    this.animTimeFormat();
    this.burningFireLocation = chosenAnim['fire_origin']
    this.wallsSize = Math.round(2 / this.scale);
    this.ballsSize = Math.round(5 / this.scale);
    this.velocitiesSize = Math.round(1 / this.scale);
    this.doorsSize = 2 * this.wallsSize;

    this.rooms = this.dstatic[floor].rooms;
    this.doors = this.dstatic[floor].doors;
    this.obstacles = this.dstatic[floor].obstacles;
    this.dd_geoms = this.dstatic[floor].dd_geoms;

    //  listenEvents();
    this.resetCanvas();

    if (chosenAnim["highlight_geom"] != null) { this.highlightGeom(chosenAnim["highlight_geom"]); }

    if (chosenAnim["anim"] != '') {
      this.showAnimation(chosenAnim);
    }
  }

  public animTimeFormat() {
    var date = new Date(null);
    var t = this.timeShift + this.deltaTime * this.sliderPos / 100
    date.setSeconds(t);
    return date.toISOString().substr(14, 5);
  }

  public resetCanvas() {
    // Reset on new visualization, on scaling walls, etc.
    this.paperjsDisplayImage();
    this.append_dd_geoms();
    this.paperjsLetItBurn();
    this.paperjsDisplayAnimation();
  }

  public paperjsDisplayImage() {
    if (this.staticGeoms == undefined) {
      this.staticGeoms = new Group();
    } else {
      this.staticGeoms.removeChildren();
    }

    for (var key in this.rooms) {
      this.staticGeoms.addChild(new Path.Rectangle({ point: new Point(this.rooms[key]["x0"], -this.rooms[key]["y0"]), size: new Size(this.rooms[key]["width"], -this.rooms[key]["depth"]), strokeColor: this.colors['stroke'], strokeWidth: 0.2, fillColor: this.colors[this.rooms[key]["type_sec"]] }));
    }

    for (var i = 0; i < this.obstacles.length; i++) {
      this.staticGeoms.addChild(new Path.Rectangle({ point: new Point(this.obstacles[i]["x0"], -this.obstacles[i]["y0"]), size: new Size(this.obstacles[i]["width"], -this.obstacles[i]["depth"]), strokeColor: this.colors['obsts'], strokeWidth: this.wallsSize }));
    }

    if (this.labelsSize != 0) {
      for (var key in this.rooms) {
        this.staticGeoms.addChild(new PointText({ point: new Point(this.rooms[key]["x0"] + 10, -this.rooms[key]["y0"] - 30), fillColor: this.colors["fg"], content: this.rooms[key]["name"], fontFamily: 'Play', fontSize: this.labelsSize }));
      }
    }

    for (var key in this.doors) {
      if (this.doorsSize != 0) {
        this.staticGeoms.addChild(new Path.Rectangle({ point: new Point(this.doors[key]["x0"], -this.doors[key]["y0"]), size: new Size(this.doors[key]["width"], -this.doors[key]["depth"]), strokeColor: this.colors['door'], strokeWidth: this.doorsSize }));
      }
      if (this.labelsSize != 0) {
        this.staticGeoms.addChild(new PointText({ point: new Point(this.doors[key]["center_x"] - 10, -this.doors[key]["center_y"] + 10), fillColor: this.colors["fg"], content: this.doors[key]["name"], opacity: 0.7, fontFamily: 'Play', fontSize: this.labelsSize * 0.75 }));
      }
    }

  }

  public append_dd_geoms() {
    // We attach to the static geoms
    var g;

    for (var i = 0; i < this.dd_geoms['rectangles'].length; i++) {
      g = this.dd_geoms['rectangles'][i];
      this.staticGeoms.addChild(new Path.Rectangle({ point: new Point(g["xy"][0], -g["xy"][1]), size: new Size(g["width"], -g["depth"]), strokeColor: g['strokeColor'], strokeWidth: g['strokeWidth'], fillColor: g['fillColor'], opacity: g['opacity'] }));
    }

    for (var i = 0; i < this.dd_geoms['lines'].length; i++) {
      g = this.dd_geoms['lines'][i];
      this.staticGeoms.addChild(new Path.Line({ from: new Point(g["xy"][0], -g["xy"][1]), to: new Point(g["x1"], -g["y1"]), strokeColor: g['strokeColor'], strokeWidth: g['strokeWidth'], opacity: g['opacity'] }));
    }

    for (var i = 0; i < this.dd_geoms['circles'].length; i++) {
      g = this.dd_geoms['circles'][i];
      this.staticGeoms.addChild(new Path.Circle({ center: new Point(g["xy"][0], -g["xy"][1]), radius: g["radius"], fillColor: g['fillColor'], opacity: g['opacity'] }));
    }
    for (var i = 0; i < this.dd_geoms['texts'].length; i++) {
      g = this.dd_geoms['texts'][i];
      this.staticGeoms.addChild(new PointText({ point: new Point(g["xy"][0], -g["xy"][1]), content: g["content"], fontFamily: 'Play', fontSize: g["fontSize"], fillColor: g['fillColor'], opacity: g['opacity'] }));
    }
  }

  public paperjsLetItBurn() {
    // The animated fire is displayed in a separate setInterval loop. Perhaps onFrame() suits more.
    if (this.burningFire == undefined) {
      this.burningFire = new Group();
    } else {
      this.burningFire.removeChildren();
    }

    if (this.burningFireLocation.length < 2) {
      clearInterval(this.intervalId);
      return;
    }
    this.burningFire.addChild(new Path.Circle({ center: new Point(this.burningFireLocation[0], -this.burningFireLocation[1]), radius: this.ballsSize * 4, fillColor: this.colors["firefill"], strokeColor: this.colors["firestroke"], strokeWidth: this.ballsSize }));

    clearInterval(this.intervalId);
    this.fireScale = 0.9;
    this.fireScaleCounter = 1;
    this.intervalId = setInterval(function () {
      this.fireScaleCounter++;
      if (this.fireScaleCounter % 20 == 0) {
        this.fireScale = 1 / this.fireScale;
      }
      this.burningFire.children[0].scale(this.fireScale);
    }, 100);
  }

  public paperjsDisplayAnimation() {
    // evacVelocities are the ---------> vectors attached to each ball
    // evacLabels are (e1 x,y) displayed on top of each ball
    // Old elements must be removed on various occassions, so we cannot return to early.

    if (this.evacVelocities == undefined) {
      this.evacVelocities = new Group();
      this.evacBalls = new Group();
      this.evacLabels = new Group();
    } else {
      this.evacVelocities.removeChildren();
      this.evacBalls.removeChildren();
      this.evacLabels.removeChildren();
    }

    if (this.visContainsAnimation == 0) { return; }

    for (var i = 0; i < this.numberOfEvacuees; i++) {
      this.evacVelocities.addChild(new Path.Line({ from: new Point(this.evacueesData[0][i][0], -this.evacueesData[0][i][1]), to: new Point(this.evacueesData[0][i][2], -this.evacueesData[0][i][3]), strokeColor: this.colors['fg'], strokeCap: 'round', dashArray: [2, 10], strokeWidth: this.velocitiesSize }));
    }

    for (var i = 0; i < this.numberOfEvacuees; i++) {
      this.evacBalls.addChild(new Path.Circle({ center: new Point(this.evacueesData[0][i][0], -this.evacueesData[0][i][1]), radius: this.ballsSize, fillColor: this.colors['doseN'] }));
    }
  }

  public highlightGeom(key) {
    try {
      new Path.Rectangle({ point: new Point(Math.round(this.rooms[key]["x0"]), -Math.round(this.rooms[key]["y0"])), size: new Size(Math.round(this.rooms[key]["width"]), -Math.round(this.rooms[key]["depth"])), opacity: 0.4, fillColor: "#0f0" });
    } catch (e) {
      new Path.Circle({ center: new Point(Math.round(this.doors[key]["center_x"]), -Math.round(this.doors[key]["center_y"])), radius: 100, opacity: 0.4, fillColor: "#0f0" });
    }
  }

  public updateAnimatedElement(i) {
    // Lerps are Linear Interpolations. 
    // There is data for each frame. Within each frame there are evacBalls positions. We take first frame and loop thru each evacuee. But we are not done with this frame yet:
    // We can have say 1 or 1000 of lerps (invented positions) between each two frames. This is for both smoothening animations and for slow/fast playbacks. 
    // We remove an evacuee by making it transparent. When we rewind, then we initialize all opacities with 1 again.

    // todo performance? 
    // if(frame == 0 || evacueesData[frame][i][5] != evacueesData[frame-1][i][5] ) {  evacBalls.children[i].opacity=evacVelocities.children[i].opacity=evacueesData[frame][i][5]; }
    // if(frame == 0 || evacueesData[frame][i][4] != evacueesData[frame-1][i][4] ) {  evacBalls.children[i].fillColor=colors['dose'+evacueesData[frame][i][4]]; } 
    this.evacBalls.children[i].opacity = this.evacVelocities.children[i].opacity = this.evacueesData[this.frame + 1][i][5];
    this.evacBalls.children[i].fillColor = this.colors['dose' + this.evacueesData[this.frame][i][4]];

    this.evacBalls.children[i].position.x = this.evacueesData[this.frame][i][0] + (this.evacueesData[this.frame + 1][i][0] - this.evacueesData[this.frame][i][0]) * (this.lerpFrame % this.lerps) / this.lerps;
    this.evacBalls.children[i].position.y = - this.evacueesData[this.frame][i][1] - (this.evacueesData[this.frame + 1][i][1] - this.evacueesData[this.frame][i][1]) * (this.lerpFrame % this.lerps) / this.lerps;

    this.evacVelocities.children[i].segments[0].point.x = this.evacBalls.children[i].position.x;
    this.evacVelocities.children[i].segments[0].point.y = this.evacBalls.children[i].position.y;
    this.evacVelocities.children[i].segments[1].point.x = this.evacBalls.children[i].position.x + this.evacueesData[this.frame][i][2];
    this.evacVelocities.children[i].segments[1].point.y = this.evacBalls.children[i].position.y - this.evacueesData[this.frame][i][3];
  }

  public afterLerpFrame() {
    // The slider moves after each frame. The slider is a collection of 100 svg rectangles. We need to clear the previous rectangle and mark the current rectangle
    //$('#slider_' + (sliderPos)).css("fill", "#000");
    //$("sim-time").html(animTimeFormat());
    this.sliderPos = Math.round(this.lerpFrame / (this.lerps * this.lastFrame) * 100);
    this.lerpFrame++;
    //$('#slider_' + (sliderPos - 0)).css("fill", "#555");

    if (this.lerpFrame % this.lerps == 0) {
      this.frame++;
    }

    // We need to rewind animation to the beginning before someone calls [frame+1]
    if (this.frame >= this.lastFrame) {
      this.frame = 0;
      this.lerpFrame = 0;
    }
  }


  public onMouseDown(event) {
    this.animationIsRunning = 0;
    this.lerps = 9999999999; // pause
    var x;
    var y;
    //$("canvas-mouse-coords").text(Math.floor(event.downPoint['x']/100)+","+Math.floor(event.downPoint['y']/100));
    //$("canvas-mouse-coords").text(Math.floor(event.downPoint['x']) + "," + -Math.floor(event.downPoint['y']));
    //$("canvas-mouse-coords").css({ 'display': 'block', 'left': event.event.pageX, 'top': event.event.pageY });
    for (var i = 0; i < this.numberOfEvacuees; i++) {
      x = this.evacBalls.children[i].position.x;
      y = this.evacBalls.children[i].position.y;
      this.evacLabels.addChild(new Path.Circle({ center: new Point(x, y), radius: this.ballsSize * 1.4, fillColor: "#f80" }));
      this.evacLabels.addChild(new PointText({ point: new Point(x - this.ballsSize / 1, y - this.ballsSize / 3), fillColor: "#000", content: "e" + i, fontFamily: 'Play', fontSize: this.ballsSize * 0.7 }));
      this.evacLabels.addChild(new PointText({ point: new Point(x - this.ballsSize / 1, y + this.ballsSize / 2), fillColor: "#000", content: [Math.round(x / 100), Math.round(y / 100)], fontFamily: 'Play', fontSize: this.ballsSize * 0.7 }));
    }
  };

  public onFrame(event) {
    // Main animation loop
    if (this.animationIsRunning == 1) {
      for (var i = 0; i < this.numberOfEvacuees; i++) {
        this.updateAnimatedElement(i);
      }
      this.afterLerpFrame();
    }
  }




  public showAnimation(chosenAnim) {
    // After static data is loaded to paperjs we can run animations.
    // 0.000001 & friends prevent divisions by 0.
    var promise = new JSZip.external.Promise(function (resolve, reject) {
      JSZipUtils.getBinaryContent("../" + chosenAnim["anim"], function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    promise.then(JSZip.loadAsync)
      .then(function (zip) {
        console.log(zip);
        return zip.catch.toString();
        //return zip.file("anim.json").async("string");
      })

      .then(function success(chosenAnim) {
        var animJson = JSON.parse(chosenAnim);
        this.timeShift = animJson.time_shift;
        this.deltaTime = animJson.simulation_time - this.timeShift;
        this.animTimeFormat();
        this.evacueesData = animJson.data;
        this.lastFrame = animJson.data.length - 1;
        this.numberOfEvacuees = animJson.data[0].length;
        var speedProposal = Math.round(this.lastFrame / 5)
        //$("animation-speed").html("<input type=text size=2 name=speed id=speed value=" + speedProposal + ">");
        this.lerps = Math.round(1 / ((speedProposal / 100) + 0.0000000000000000001)) + 1;

        //$("#speed").on("keyup", function () {
        //  this.lerps = Math.round(1 / (($('#speed').val() / 100) + 0.0000000000000000001)) + 1;
        //  this.lerpFrame = Math.floor(this.sliderPos * this.lastFrame * this.lerps / 100);
        //  $('.canvas_slider_rect').css("fill", "#000000");
        //});

        this.visContainsAnimation = 1;
        this.animationIsRunning = 1;
        this.paperjsDisplayAnimation();

      }, function error(e) {
        console.log(e);
      });
  }






  /*


  public listenEvents() {
    $('#labels-size').on('keyup', function () { labelsSize = this.value; resetCanvas(); })
    $('#walls-size').on('keyup', function () { wallsSize = this.value; resetCanvas(); })
    $('#doors-size').on('keyup', function () { doorsSize = this.value; resetCanvas(); })
    $('#balls-size').on('keyup', function () { ballsSize = this.value; resetCanvas(); })
    $('#velocities-size').on('keyup', function () { velocitiesSize = this.value; resetCanvas(); })

    $('canvas-mouse-coords').click(function () {
      lerps = Math.round(1 / (($('#speed').val() / 100) + 0.00000000000000001)) + 1;
      $("canvas-mouse-coords").delay(1500).fadeOut('slow');
      evacLabels.removeChildren();
      animationIsRunning = 1;
    });


    $('#canvas').on('DOMMouseScroll mousewheel', function (event) {
      if (event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0) { //alternative options for wheelData: wheelDeltaX & wheelDeltaY
        view.scale(0.6);
      } else {
        view.scale(1.4);
      }
      //prevent page fom scrolling
      return false;
    });



    $('#highlight-geoms').on('change', function () {
      if (this.value.length > 0) { highlightGeom(this.value); }
    });

    $('.canvas_slider_rect').click(function () {
      evacLabels.removeChildren();
      animationIsRunning = 1;
      sliderPos = $(this).data('id');
      lerpFrame = Math.floor(sliderPos * lastFrame * lerps / 100);
      frame = Math.floor(lerpFrame / lerps);
      $('.canvas_slider_rect').css("fill", "#000");
    });
  }

  //$('show-animation-setup-box').click(function() {
  //  $('animation-setup-box').toggle(400);
  //});


  */

  /** It's nesescery to add node_modules/@types/paper/index.d.ts
   * Scales the item by the given value from its center point, or optionally from a supplied point.
   * @param scale - the scale factor
   * @param center [optional] - default: item.position
  scale(scale: number, center?: Point): void;
   */

}