import { Main } from '../../../../../services/main/main';
import { MainService } from '../../../../../services/main/main.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Ramp } from '../../../../../services/fds-object/ramp/ramp';
import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';

import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { forEach, sortBy, round, find } from 'lodash';
import { LibraryService } from '../../../../../services/library/library.service';
import { Library } from '../../../../../services/library/library';

@Component({
  selector: 'ramp-chart',
  templateUrl: './ramp-chart.component.html',
  styleUrls: ['./ramp-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RampChartComponent implements OnInit, OnChanges {

  @ViewChild('rampChart') private chartContainer: ElementRef;
  @Input() private rampId: string;
  @Input() private xLabel: string;
  @Input() private yLabel: string;
  @Input() private units: string[];
  @Input() private value: any;
  @Input() private objectType: string;
  @Input() private containerWidth: string;
  @Input() private editor: boolean;

  private main: Main;
  private lib: Library;
  private ramps: Ramp[];
  private libRamps: Ramp[];
  public ramp: Ramp;

  private margin = { top: 10, right: 30, bottom: 40, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  constructor(private mainService: MainService, private libraryService: LibraryService) { }

  ngOnInit() {
    this.mainService.getMain().subscribe(main => this.main = main);
    this.libraryService.getLibrary().subscribe(lib => this.lib = lib);

    this.ramps = this.main.currentFdsScenario.fdsObject.ramps.ramps;
    this.libRamps = this.lib.ramps;

    if (!this.svg) {
      this.createChart();
      this.updateChart();
    }

  }

  ngOnChanges() {
    if (this.svg) {
      this.updateChart();
    }
  }

  /** Get ramp f value without calc */
  private getPureF(stepIndex: number) {
    return this.ramp.steps[stepIndex].f;
  }

  /** Set ramp f value without calc */
  private setPureF(fValue: number, stepIndex: number) {
    this.ramp.steps[stepIndex].f = fValue;
  }

  /** Get ramp f value */
  private getF(stepIndex: number) {
    return round(this.ramp.steps[stepIndex].f * this.value, 6);
  }

  /** Set ramp f value */
  private setF(fValue: number, stepIndex: number) {
    this.ramp.steps[stepIndex].f = fValue / this.value;
  }

  /** Prepare data befor ploting */
  private prepareData(): any[] {
    // Find ramp using id (rampId)
    if (this.objectType == 'current') {
      this.ramp = find(this.ramps, (ramp) => {
        return ramp.id == this.rampId;
      });
    }
    else if (this.objectType == 'library') {
      this.ramp = find(this.libRamps, (ramp) => {
        return ramp.id == this.rampId;
      });
    }

    // Value times F
    let value = 1.0;
    if (this.value) {
      value = this.value
    }
    //Prepare data steps
    let steps = []
    forEach(this.ramp.steps, data => {
      steps.push([data['t'], data['f'] * value]);
    });
    return steps;
  }

  /** Create chart */
  private createChart() {
    // Init chart
    const element = this.chartContainer.nativeElement;
    element.style.width = this.containerWidth == undefined ? '400px' : this.containerWidth;

    // Prepare data - convert object array to nuber array
    let steps = this.prepareData();

    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    this.svg = d3Selection.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    // Init axis
    this.x = d3Scale.scaleLinear()
      .domain(d3Array.extent(steps, (d) => d[0]))
      .range([0, this.width]);
    this.y = d3Scale.scaleLinear()
      .domain(d3Array.extent(steps, (d) => d[1]))
      .range([this.height, 0]);

    this.xAxis = d3Axis.axisBottom(this.x);
    this.yAxis = d3Axis.axisLeft(this.y);

    // Draw axis
    this.svg.append("g")
      .attr("class", "axis axis-x")
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "axis axis-y")
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(this.yAxis);

    // Add labels
    this.svg.append("text")
      .attr("class", "x label")
      .attr("fill", "rgb(250,250,250)")
      .attr("text-anchor", "middle")
      .attr("x", (this.width + this.margin.left + this.margin.right) / 2)
      .attr("y", this.height + this.margin.top + this.margin.bottom - 5)
      .text(this.xLabel);

    this.svg.append("text")
      .attr("class", "y label")
      .attr("fill", "rgb(250,250,250)")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", (this.height + this.margin.top + this.margin.bottom) / -2)
      .attr("y", 15)
      .text(this.yLabel);
  }

  /** Update chart */
  public updateChart() {
    // Prepare data
    let steps = this.prepareData();

    // Sort data
    steps = sortBy(steps, (step) => {
      return step[0];
    });

    // Create points
    let points = [];
    forEach(steps, function (step) {
      points.push({ x: step[0], y: step[1] });
    });

    // Remove previous plot and axis
    this.svg.selectAll('.line').remove();
    this.svg.selectAll('.axis').remove();
    this.svg.selectAll('g').remove();

    // Init axis
    this.x = d3Scale.scaleLinear()
      .domain(d3Array.extent(steps, (d) => d[0]))
      .range([0, this.width]);
    this.y = d3Scale.scaleLinear()
      .domain(d3Array.extent(steps, (d) => d[1]))
      .range([this.height, 0]);

    // Draw axis
    this.svg.append("g")
      .attr("class", "axis axis-x")
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3Axis.axisBottom(this.x));
    this.svg.append("g")
      .attr("class", "axis axis-y")
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3Axis.axisLeft(this.y));

    // Draw line
    this.line = d3Shape.line()
      .x((d: any) => this.x(d[0]))
      .y((d: any) => this.y(d[1]));
    this.svg.append("path")
      .datum(steps)
      .attr("class", "line")
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .attr("d", this.line)
      .attr('stroke-width', 6)
      .attr('stroke', 'rgb(120,120,145)')
      .attr('fill', 'none');

    // Draw dots with y values
    let gdots = this.svg.selectAll("g.dot")
      .data(points)
      .enter().append('g');

    gdots.append("circle")
      .attr("class", "dot")
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .attr("r", 6)
      .attr("fill", "rgb(20,250,50)")
      .attr("cx", (d) => { return this.x(d.x); })
      .attr("cy", (d) => { return this.y(d.y); });

    gdots.append("text")
      .text((d) => { return round(d.y, 2); })
      .attr('transform', `translate(${this.margin.left - 10}, ${this.margin.top - 10})`)
      .attr("x", (d) => { return this.x(d.x); })
      .attr("y", (d) => { return this.y(d.y); });

  }

}
