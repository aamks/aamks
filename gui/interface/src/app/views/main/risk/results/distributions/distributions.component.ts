import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../../services/main/main';
import { MainService } from '../../../../../services/main/main.service';
import { RiskScenarioService } from '../../../../../services/risk-scenario/risk-scenario.service';
import { NotifierService } from 'angular-notifier';
import { Result } from '../../../../../services/http-manager/http-manager.service';

@Component({
  selector: 'app-distributions',
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {

  main: Main;

  generatedResults = false;

  path: string;
  wcbe: string;
  dcbe: string;
  vis: string;
  ccdf: string;
  height: string;
  lossesdead: string;
  lossesheavy: string;
  losseslight: string;
  lossesneglegible: string;
  pie_fault: string;
  temp: string;
  tree: string;
  tree_steel: string;
  vis_cor: string;
  hgt_cor: string;
  constructor(
    private mainService: MainService,
    private riskScenarioService: RiskScenarioService,
    private readonly notifierService: NotifierService
  ) { }

  ngOnInit() {
    this.mainService.getMain().subscribe(main => this.main = main);

    // Check if results are already generated
    this.riskScenarioService.isGeneratedResults().then(
      (result: Result) => {
        if (result.meta.status == 'success') {
          this.generatedResults = true;
          this.notifierService.notify(result.meta.status, result.meta.details[0]);
        }
      },
      (error: Result) => {
        this.generatedResults = false;
        this.notifierService.notify(error.meta.status, error.meta.details[0]);
      }
    );

    this.path = this.main.hostAddres + '/aamks_users/' + this.main.email + '/' + this.main.currentProject.id + '/risk/' + this.main.currentRiskScenario.id + '/picts/';
    this.wcbe = this.path + 'wcbe.png';
    this.dcbe = this.path + 'dcbe.png';
    this.vis = this.path + 'vis.png';
    this.lossesdead = this.path + 'lossesdead.png';
    this.lossesheavy = this.path + 'lossesheavy.png';
    this.losseslight = this.path + 'losseslight.png';
    this.ccdf = this.path + 'ccdf.png';
    this.height = this.path + 'height.png';
    this.pie_fault = this.path + 'pie_fault.png';
    this.temp = this.path + 'temp.png';
    this.tree = this.path + 'tree.png';
    this.tree_steel = this.path + 'tree_steel.png';
    this.vis_cor = this.path + 'vis_cor.png';
    this.hgt_cor = this.path + 'hgt_cor.png';
  }

  /** Run risk scenario */
  public generateResults() {
    this.riskScenarioService.generateResults().then(result => {
      if (result['meta']['status'] == 'success') this.generatedResults = true;
      else this.generatedResults == false;
    });
    this.notifierService.notify('success', 'Generating results. Wait for message from server.');
  }
}
