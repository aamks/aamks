import { Injectable } from '@angular/core';
import { Main } from '../main/main';
import { MainService } from '../main/main.service';
import { HttpManagerService } from '../http-manager/http-manager.service';
import { NotifierService } from 'angular-notifier';
import { JsonRiskInterface } from './json-risk-interface';
import { RiskObject } from '../risk-object/risk-object';


@Injectable()
export class JsonRiskService {

  private main: Main;
  private riskObject: RiskObject;

  constructor(
    private mainService: MainService,
    private httpManager: HttpManagerService,
    private readonly notifierService: NotifierService
  ) {
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  ngOnInit() {
  }

  /**
   * Create json input file
   */
  public createInputFile(): JsonRiskInterface {
    this.riskObject = this.main.currentRiskScenario.riskObject;

    let json: JsonRiskInterface;
    json = {
      general: {
        project_id: this.main.currentProject.id,
        scenario_id: this.main.currentRiskScenario.id,
        number_of_simulations: this.riskObject.general.numberOfSimulations,
        simulation_time: this.riskObject.general.simulationTime,
        indoor_temperature: [this.riskObject.general.indoorTemperature, this.riskObject.general.indoorTemperatureSd],
        outdoor_temperature: [this.riskObject.general.outdoorTemperature, this.riskObject.general.outdoorTemperatureSd],
        indoor_pressure: this.riskObject.general.indoorPressure,
        auto_stircaser: false,
      },
      characteristic: {
        geometry_type: this.riskObject.buildingCharacteristic.type,
        material_ceiling: this.riskObject.buildingCharacteristic.materials.ceiling,
        ceiling_thickness: this.riskObject.buildingCharacteristic.materials.thicknessCeiling,
        material_floor: this.riskObject.buildingCharacteristic.materials.floor,
        floor_thickness: this.riskObject.buildingCharacteristic.materials.thicknessFloor,
        material_wall: this.riskObject.buildingCharacteristic.materials.wall,
        wall_thickness: this.riskObject.buildingCharacteristic.materials.thicknessWall
      },
      infrastructure: {
        has_detectors: this.riskObject.buildingInfrastructure.hasDetectors,
        detectors: {
          comment: this.riskObject.buildingInfrastructure.detectors.comment,
          type: this.riskObject.buildingInfrastructure.detectors.type,
          trigger_temperature_mean_and_sd: [this.riskObject.buildingInfrastructure.detectors.activationTemperature, this.riskObject.buildingInfrastructure.detectors.activationTemperatureSd],
          trigger_obscuration_mean_and_sd: [this.riskObject.buildingInfrastructure.detectors.activationObscuration, this.riskObject.buildingInfrastructure.detectors.activationObscurationSd],
          not_broken_probability: this.riskObject.buildingInfrastructure.detectors.notBrokenProbability,
        },
        has_sprinklers: this.riskObject.buildingInfrastructure.hasSprinklers,
        sprinklers: {
          comment: this.riskObject.buildingInfrastructure.sprinklers.comment,
          trigger_temperature_mean_and_sd: [this.riskObject.buildingInfrastructure.sprinklers.activationTemperature, this.riskObject.buildingInfrastructure.sprinklers.activationTemperatureSd],
          not_broken_probability: this.riskObject.buildingInfrastructure.sprinklers.notBrokenProbability,
          spray_density_mean_and_sd: [this.riskObject.buildingInfrastructure.sprinklers.sprayDensity, this.riskObject.buildingInfrastructure.sprinklers.sprayDensitySd],
          rti: this.riskObject.buildingInfrastructure.sprinklers.rti
        },
        has_nshevs: this.riskObject.buildingInfrastructure.hasNshevs,
        nshevs: {
          activation_time: this.riskObject.buildingInfrastructure.nshevs.activationTime
        },
        cfast_static_records: this.riskObject.buildingInfrastructure.cfastStaticRecords
      },
      settings: {
        heat_release_rate: {
          comment: this.riskObject.settings.heatReleaseRate.comment,
          hrrpua_min_mode_max: this.riskObject.settings.heatReleaseRate.hrrpuaMinModeMax,
          alpha_min_mode_max: this.riskObject.settings.heatReleaseRate.alphaMinModeMax
        },
        window_open: {
          comment: this.riskObject.settings.windowOpen.comment,
          setup: this.riskObject.settings.windowOpen.setup
        },
        door_open: {
          comment: this.riskObject.settings.doorOpen.comment,
          electro_magnet_door_is_open_probability: this.riskObject.settings.doorOpen.electroMagnetDoorIsOpenProbability,
          door_closer_door_is_open_probability: this.riskObject.settings.doorOpen.doorCloserDoorIsOpenProbability,
          standard_door_is_open_probability: this.riskObject.settings.doorOpen.standardDoorIsOpenProbability,
          vvents_no_failure_probability: this.riskObject.settings.doorOpen.vventsNoFailureProbability
        },
        c_const: this.riskObject.settings.cConst,
        pre_evacuation_time: {
          comment: this.riskObject.settings.preEvacuationTime.comment,
          mean_and_sd_room_of_fire_origin: this.riskObject.settings.preEvacuationTime.meanAndSdRoomOfFireOrigin,
          mean_and_sd_ordinary_room: this.riskObject.settings.preEvacuationTime.meanAndSdOrdinaryRoom
        },
        evacuees_concentration: {
          comment: this.riskObject.settings.evacueesConcentration.comment,
          COR: this.riskObject.settings.evacueesConcentration.cor,
          STAI: this.riskObject.settings.evacueesConcentration.stai,
          ROOM: this.riskObject.settings.evacueesConcentration.room,
          HALL: this.riskObject.settings.evacueesConcentration.hall
        },
        evacuees_speed_params: {
          comment: this.riskObject.settings.evacueesSpeedParams.comment,
          max_h_speed_mean_and_sd: this.riskObject.settings.evacueesSpeedParams.maxHSpeedMeanAndSd,
          max_v_speed_mean_and_sd: this.riskObject.settings.evacueesSpeedParams.maxVSpeedMeanAndSd,
          beta_v_mean_and_sd: this.riskObject.settings.evacueesSpeedParams.betaVMeanAndSd,
          alpha_v_mean_and_sd: this.riskObject.settings.evacueesSpeedParams.alphaVMeanAndSd
        },
        origin_of_fire: {
            comment: this.riskObject.settings.originOfFire.comment,
            fire_starts_in_room_probability: this.riskObject.settings.originOfFire.fireStartsInRoomProbability
        }
      },
      geometry: this.riskObject.geometry
    }
    return json;
  }

}
