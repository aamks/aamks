import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { defColors } from './colors';
import { forEach } from 'lodash';
import { HttpManagerService, Result } from '../../../../../services/http-manager/http-manager.service';
import { MainService } from '../../../../../services/main/main.service';
import { PaperScope, Project, View, Point, Group, Path, Size, PointText, Event } from 'paper';
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent implements OnInit {
  @ViewChild('canvasElement') canvasElement: ElementRef;
  // Scrool event listener
  @HostListener('wheel', ['$event'])
  onWheel(event) {
    // TODO: Add zooming under the cursor
    let oldZoom = this.project.view.zoom;
    let oldCenter = this.project.view.center;
    let viewPos = this.project.view.viewToProject(event.point);
    let newZoom = event.deltaY > 0 ? oldZoom / 1.1 : oldZoom * 1.1;
    this.project.view.zoom = newZoom;

    event.stopPropagation();
    //let zoomScale = oldZoom / newZoom;
    //let centerAdjust = viewPos.subtract(oldCenter);
    //let offset = viewPos.subtract(centerAdjust.multiply(newZoom)).subtract(oldCenter);
    //this.project.view.center = this.project.view.center.add(offset);
  }

  // PaperJs
  scope: PaperScope;
  project: Project;

  private subscribe: boolean = true;
  main: Main;

  objectKeys = Object.keys;

  scale = 1; fireScale; intervalId; fireScaleCounter; colors; colorsDb;
  staticGeoms: Group;
  burningFireLocation; wallsSize; doorsSize; ballsSize; velocitiesSize; evacBalls; evacLabels; evacVelocities; burningFire; evacueesData; numberOfEvacuees;
  rooms = {};
  doors = {};
  obstacles; dd_geoms;
  lerps; lastFrame = 1; deltaTime = 0; timeShift = 0; labelsSize = 40; sliderPos = 0; lerpFrame = 0; frame = 0;
  visContainsAnimation = 0; animationIsRunning = 0;
  speed = 10;

  chooseVisArray = [];
  chooseVis;
  dstatic = {};
  visTitle = "";
  style = "dark";
  setupBox = true;

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

    // Get anims
    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/getAnims/' + this.main.currentProject.id + '/' + this.main.currentRiskScenario.id).then((result: Result) => {
      this.chooseVisArray = JSON.parse(result.data['anims']);
      this.chooseVis = this.chooseVisArray[0];
    });

    // Get static geom
    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/getStatic/' + this.main.currentProject.id + '/' + this.main.currentRiskScenario.id).then((result: Result) => {
      this.dstatic = JSON.parse(result.data['static'])
      this.showStaticImage(this.chooseVis);
    });

    // Initializing events
    // onMouseDrag
    this.project.view.onMouseDrag = (event) => {
      let offset = new Point(this.project.view.center.x - event.delta.x, this.project.view.center.y - event.delta.y)
      this.project.view.center = offset;

      // Move geometry group 
      //let offset = new Point(this.staticGeoms.position.x + event.delta.x, this.staticGeoms.position.y + event.delta.y)
      //this.evacVelocities.position = offset;
      //this.evacBalls.position = offset;
      //this.evacLabels.position = offset;
      //this.staticGeoms.position = offset;
    }

    this.fireScale = 0.9;
    this.fireScaleCounter = 1;

    // onFrame
    this.project.view.onFrame = (event) => {
      // Main animation loop
      if (this.animationIsRunning == 1) {
        for (var i = 0; i < this.numberOfEvacuees; i++) {
          this.updateAnimatedElement(i);
        }

        // The slider moves after each frame. The slider is a collection of 100 svg rectangles. We need to clear the previous rectangle and mark the current rectangle
        this.sliderPos = Math.round(this.lerpFrame / (this.lerps * this.lastFrame) * 100);
        this.lerpFrame++;

        if (this.lerpFrame % this.lerps == 0) {
          this.frame++;

          // Change fire object scale
          this.fireScaleCounter++;
          if (this.fireScaleCounter % 20 == 0) {
            this.fireScale = 1 / this.fireScale;
          }
          this.burningFire.children[0].scale(this.fireScale);

        }

        // We need to rewind animation to the beginning before someone calls [frame+1]
        if (this.frame >= this.lastFrame) {
          this.frame = 0;
          this.lerpFrame = 0;
        }
      }
    }

    // onClick
    this.project.view.onClick = (event) => {
      this.pause(event)
    }

    // onDoubleClick
    this.project.view.onDoubleClick = (event) => {
      this.play(event);
    }
  }

  ngOnDestroy() {
    this.subscribe = false;
    clearInterval(this.intervalId);
  }

  public play(event?: any) {
    this.lerps = Math.round(1 / ((this.speed / 100) + 0.00000000000000001)) + 1;
    //$("canvas-mouse-coords").delay(1500).fadeOut('slow');
    this.evacLabels.removeChildren();
    this.animationIsRunning = 1;
  }

  public pause(event?: any) {
    this.animationIsRunning = 0;
    this.lerps = 9999999999; // pause
    var x;
    var y;
    for (var i = 0; i < this.numberOfEvacuees; i++) {
      x = this.evacBalls.children[i].position.x;
      y = this.evacBalls.children[i].position.y;
      this.evacLabels.addChild(new Path.Circle({ center: new Point(x, y), radius: this.ballsSize * 1.4, fillColor: "#f80" }));
      this.evacLabels.addChild(new PointText({ point: new Point(x - this.ballsSize / 1, y - this.ballsSize / 3), fillColor: "#000", content: "e" + i, fontFamily: 'Play', fontSize: this.ballsSize * 0.7 }));
      this.evacLabels.addChild(new PointText({ point: new Point(x - this.ballsSize / 1, y + this.ballsSize / 2), fillColor: "#000", content: [Math.round(x / 100), Math.round(y / 100)], fontFamily: 'Play', fontSize: this.ballsSize * 0.7 }));
    }
  }

  public stop() {
    this.pause();
    this.frame = 0;
    this.lerpFrame = 0;
    this.sliderPos = 0;
    this.resetCanvas();
  }

  public rewind(event?: any) {
    console.log(event);
    console.log(event.clientX - event.target.offsetLeft);
  }

  /**
   * Choose visualization to show in select element
   */
  public changeChooseVis() {
    this.lerpFrame = 0;
    this.frame = 0;
    this.visContainsAnimation = 0;
    this.animationIsRunning = 0;
    this.showStaticImage(this.chooseVis);
  }

  /**
   * After we read a record from anims.json we reset the current visualization and setup a new one.
   * We can only start animation after we are done with static rooms, doors etc.
   * Paperjs can only scale relative to current size, so we must always return to the previous scale in view.scale().
   * @param chosenAnim 
   */
  public showStaticImage(chosenAnim) {

    var floor = chosenAnim.floor;

    var newScale = this.dstatic[floor]['meta']['scale'];
    this.project.view.scale(newScale / this.scale);
    this.scale = newScale;
    this.project.view.center = new Point(this.dstatic[floor].meta.translate);

    this.visTitle = chosenAnim.title;
    this.animTimeFormat();

    this.burningFireLocation = chosenAnim.fire_origin;
    this.wallsSize = Math.round(2 / this.scale);
    this.ballsSize = Math.round(5 / this.scale);
    this.velocitiesSize = Math.round(1 / this.scale);
    this.doorsSize = 2 * this.wallsSize;

    this.rooms = this.dstatic[floor].rooms;
    this.doors = this.dstatic[floor].doors;
    this.obstacles = this.dstatic[floor].obstacles;
    this.dd_geoms = this.dstatic[floor].dd_geoms;

    this.resetCanvas();

    if (chosenAnim.highlight_geom != null) { this.highlightGeom(chosenAnim["highlight_geom"]); }

    if (chosenAnim.anim != '') {
      this.showAnimation(chosenAnim);
    }
  }

  /**
   * Restet on new visualization, on scaling walls, etc.
   */
  public resetCanvas() {
    this.paperjsDisplayImage();
    this.append_dd_geoms();
    this.paperjsDisplayAnimation();
  }

  /**
   * Format time label
   */
  public animTimeFormat() {
    var date = new Date(null);
    var t = this.timeShift + this.deltaTime * this.sliderPos / 100
    date.setSeconds(t);
    return date.toISOString().substr(14, 5);
  }

  /**
   * Show static geometry
   */
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

    // Fire localization
    if (this.burningFire == undefined) {
      this.burningFire = new Group();
    } else {
      this.burningFire.removeChildren();
    }
    this.burningFire.addChild(new Path.Circle({ center: new Point(this.burningFireLocation[0], -this.burningFireLocation[1]), radius: this.ballsSize * 4, fillColor: this.colors["firefill"], strokeColor: this.colors["firestroke"], strokeWidth: this.ballsSize }));
  }

  /**
   * Attach dd to static geom
   */
  public append_dd_geoms() {
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
    if (this.evacueesData[this.frame][i][4] != 'H') {
      this.evacBalls.children[i].opacity = this.evacVelocities.children[i].opacity = this.evacueesData[this.frame + 1][i][5];
      this.evacBalls.children[i].fillColor = this.colors['dose' + this.evacueesData[this.frame][i][4]];

      this.evacBalls.children[i].position.x = this.evacueesData[this.frame][i][0] + (this.evacueesData[this.frame + 1][i][0] - this.evacueesData[this.frame][i][0]) * (this.lerpFrame % this.lerps) / this.lerps;
      this.evacBalls.children[i].position.y = - this.evacueesData[this.frame][i][1] - (this.evacueesData[this.frame + 1][i][1] - this.evacueesData[this.frame][i][1]) * (this.lerpFrame % this.lerps) / this.lerps;

      this.evacVelocities.children[i].segments[0].point.x = this.evacBalls.children[i].position.x;
      this.evacVelocities.children[i].segments[0].point.y = this.evacBalls.children[i].position.y;
      this.evacVelocities.children[i].segments[1].point.x = this.evacBalls.children[i].position.x + this.evacueesData[this.frame][i][2];
      this.evacVelocities.children[i].segments[1].point.y = this.evacBalls.children[i].position.y - this.evacueesData[this.frame][i][3];
    }
    else {
      this.evacBalls.children[i].fillColor = this.colors['doseH'];
    }
  }

  public showAnimation(chosenAnim) {
    // After static data is loaded to paperjs we can run animations.
    // 0.000001 & friends prevent divisions by 0.
    var promise = new JSZip.external.Promise((resolve, reject) => {
      JSZipUtils.getBinaryContent(this.main.hostAddres + '/aamks_users/' + this.main.email + '/' + this.main.currentProject.id + '/risk/' + this.main.currentRiskScenario.id + '/workers/' + chosenAnim.anim, function (err, data) {
        console.log(err);
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    promise.then(JSZip.loadAsync)
      .then(function (zip) {
        return zip['files']['anim.json'].async('string');
      })
      .then((chosenAnim) => {
        var animJson = JSON.parse(chosenAnim);
        this.timeShift = animJson.time_shift;
        this.deltaTime = animJson.simulation_time - this.timeShift;
        this.animTimeFormat();
        this.evacueesData = animJson.data;
        this.lastFrame = animJson.data.length - 1;
        this.numberOfEvacuees = animJson.data[0].length;
        this.speed = Math.round(this.lastFrame / 5)
        this.lerps = Math.round(1 / ((this.speed / 100) + 0.0000000000000000001)) + 1;


        this.visContainsAnimation = 1;
        this.animationIsRunning = 1;
        this.paperjsDisplayAnimation();

      }, function error(e) {
        console.log(e);
      });
  }

  public changeSpeed() {
    this.lerps = Math.round(1 / ((this.speed / 100) + 0.0000000000000000001)) + 1;
    this.lerpFrame = Math.floor(this.sliderPos * this.lastFrame * this.lerps / 100);
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


  /*
  public listenEvents() {
    $('canvas-mouse-coords').click(function () {
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