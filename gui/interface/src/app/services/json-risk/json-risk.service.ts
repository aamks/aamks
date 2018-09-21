import { Injectable } from '@angular/core';
import { Main } from '../main/main';
import { MainService } from '../main/main.service';
import { HttpManagerService } from '../http-manager/http-manager.service';
import { NotifierService } from 'angular-notifier';
import { JsonRiskInterface } from './json-risk-interface';
import { RiskObject } from '../risk-object/risk-object';
import { toNumber } from 'lodash';


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
        project_id: toNumber(this.main.currentProject.id),
        scenario_id: toNumber(this.main.currentRiskScenario.id),
        number_of_simulations: toNumber(this.riskObject.general.numberOfSimulations),
        simulation_time: toNumber(this.riskObject.general.simulationTime),
        indoor_temperature: [toNumber(this.riskObject.general.indoorTemperature), toNumber(this.riskObject.general.indoorTemperatureSd)],
        outdoor_temperature: [toNumber(this.riskObject.general.outdoorTemperature), toNumber(this.riskObject.general.outdoorTemperatureSd)],
        indoor_pressure: toNumber(this.riskObject.general.indoorPressure),
        auto_stircaser: false,
      },
      characteristic: {
        geometry_type: this.riskObject.buildingCharacteristic.type,
        material_ceiling: this.riskObject.buildingCharacteristic.materials.ceiling,
        ceiling_thickness: toNumber(this.riskObject.buildingCharacteristic.materials.thicknessCeiling),
        material_floor: this.riskObject.buildingCharacteristic.materials.floor,
        floor_thickness: toNumber(this.riskObject.buildingCharacteristic.materials.thicknessFloor),
        material_wall: this.riskObject.buildingCharacteristic.materials.wall,
        wall_thickness: toNumber(this.riskObject.buildingCharacteristic.materials.thicknessWall)
      },
      infrastructure: {
        has_detectors: this.riskObject.buildingInfrastructure.hasDetectors,
        detectors: {
          comment: this.riskObject.buildingInfrastructure.detectors.comment,
          type: this.riskObject.buildingInfrastructure.detectors.type,
          trigger_temperature_mean_and_sd: [toNumber(this.riskObject.buildingInfrastructure.detectors.activationTemperature), toNumber(this.riskObject.buildingInfrastructure.detectors.activationTemperatureSd)],
          trigger_obscuration_mean_and_sd: [toNumber(this.riskObject.buildingInfrastructure.detectors.activationObscuration), toNumber(this.riskObject.buildingInfrastructure.detectors.activationObscurationSd)],
          not_broken_probability: this.riskObject.buildingInfrastructure.detectors.notBrokenProbability,
        },
        has_sprinklers: this.riskObject.buildingInfrastructure.hasSprinklers,
        sprinklers: {
          comment: this.riskObject.buildingInfrastructure.sprinklers.comment,
          trigger_temperature_mean_and_sd: [toNumber(this.riskObject.buildingInfrastructure.sprinklers.activationTemperature), toNumber(this.riskObject.buildingInfrastructure.sprinklers.activationTemperatureSd)],
          not_broken_probability: this.riskObject.buildingInfrastructure.sprinklers.notBrokenProbability,
          spray_density_mean_and_sd: [toNumber(this.riskObject.buildingInfrastructure.sprinklers.sprayDensity), toNumber(this.riskObject.buildingInfrastructure.sprinklers.sprayDensitySd)],
          rti: toNumber(this.riskObject.buildingInfrastructure.sprinklers.rti)
        },
        has_nshevs: this.riskObject.buildingInfrastructure.hasNshevs,
        nshevs: {
          activation_time: toNumber(this.riskObject.buildingInfrastructure.nshevs.activationTime)
        },
        cfast_static_records: this.riskObject.buildingInfrastructure.cfastStaticRecords
      },
      settings: {
        heat_release_rate: {
          comment: this.riskObject.settings.heatReleaseRate.comment,
          hrrpua_min_mode_max: [toNumber(this.riskObject.settings.heatReleaseRate.hrrpuaMinModeMax[0]), toNumber(this.riskObject.settings.heatReleaseRate.hrrpuaMinModeMax[1]), toNumber(this.riskObject.settings.heatReleaseRate.hrrpuaMinModeMax[2])],
          alpha_min_mode_max: [toNumber(this.riskObject.settings.heatReleaseRate.alphaMinModeMax[0]), toNumber(this.riskObject.settings.heatReleaseRate.alphaMinModeMax[1]), toNumber(this.riskObject.settings.heatReleaseRate.alphaMinModeMax[2])],
        },
        window_open: {
          comment: this.riskObject.settings.windowOpen.comment,
          setup: this.riskObject.settings.windowOpen.setup
        },
        door_open: {
          comment: this.riskObject.settings.doorOpen.comment,
          electro_magnet_door_is_open_probability: toNumber(this.riskObject.settings.doorOpen.electroMagnetDoorIsOpenProbability),
          door_closer_door_is_open_probability: toNumber(this.riskObject.settings.doorOpen.doorCloserDoorIsOpenProbability),
          standard_door_is_open_probability: toNumber(this.riskObject.settings.doorOpen.standardDoorIsOpenProbability),
          vvents_no_failure_probability: toNumber(this.riskObject.settings.doorOpen.vventsNoFailureProbability)
        },
        c_const: toNumber(this.riskObject.settings.cConst),
        //c_const: 8,
        pre_evacuation_time: {
          comment: this.riskObject.settings.preEvacuationTime.comment,
          mean_and_sd_room_of_fire_origin: [toNumber(this.riskObject.settings.preEvacuationTime.meanAndSdRoomOfFireOrigin[0]), toNumber(this.riskObject.settings.preEvacuationTime.meanAndSdRoomOfFireOrigin[1])],
          mean_and_sd_ordinary_room: [toNumber(this.riskObject.settings.preEvacuationTime.meanAndSdOrdinaryRoom[0]), toNumber(this.riskObject.settings.preEvacuationTime.meanAndSdOrdinaryRoom[1])]
        },
        evacuees_concentration: {
          comment: this.riskObject.settings.evacueesConcentration.comment,
          COR: toNumber(this.riskObject.settings.evacueesConcentration.cor),
          STAI: toNumber(this.riskObject.settings.evacueesConcentration.stai),
          ROOM: toNumber(this.riskObject.settings.evacueesConcentration.room),
          HALL: toNumber(this.riskObject.settings.evacueesConcentration.hall)
        },
        evacuees_speed_params: {
          comment: this.riskObject.settings.evacueesSpeedParams.comment,
          max_h_speed_mean_and_sd: [toNumber(this.riskObject.settings.evacueesSpeedParams.maxHSpeedMeanAndSd[0]), toNumber(this.riskObject.settings.evacueesSpeedParams.maxHSpeedMeanAndSd[1])],
          max_v_speed_mean_and_sd: [toNumber(this.riskObject.settings.evacueesSpeedParams.maxVSpeedMeanAndSd[0]), toNumber(this.riskObject.settings.evacueesSpeedParams.maxVSpeedMeanAndSd[1])],
          beta_v_mean_and_sd: [toNumber(this.riskObject.settings.evacueesSpeedParams.betaVMeanAndSd[0]), toNumber(this.riskObject.settings.evacueesSpeedParams.betaVMeanAndSd[1])],
          alpha_v_mean_and_sd: [toNumber(this.riskObject.settings.evacueesSpeedParams.alphaVMeanAndSd[0]), toNumber(this.riskObject.settings.evacueesSpeedParams.alphaVMeanAndSd[1])]
        },
        origin_of_fire: {
          comment: this.riskObject.settings.originOfFire.comment,
          fire_starts_in_room_probability: toNumber(this.riskObject.settings.originOfFire.fireStartsInRoomProbability)
        }
      },
      geometry: this.riskObject.geometry
    }
    return json;
  }

}
