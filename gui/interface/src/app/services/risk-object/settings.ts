import { get, keyBy } from 'lodash';
import { RiskEntities } from '../../enums/risk/entities/risk-entities';
import { RiskEnums } from '../../enums/risk/enums/risk-enums';
import { SettingsObject, HeatReleaseRate, OriginOfFire, EvacueesConcentration, EvacueesSpeedParams, PreEvacuationTime, WindowOpen, OutdoorTemperature, DoorOpen } from './settings-interface';

export class Settings {

    private _heatReleaseRate: HeatReleaseRate;
    private _originOfFire: OriginOfFire;
    private _evacueesConcentration: EvacueesConcentration;
    private _evacueesSpeedParams: EvacueesSpeedParams;
    private _preEvacuationTime: PreEvacuationTime;
    private _windowOpen: WindowOpen;
    private _outdoorTemperature: OutdoorTemperature;
    private _doorOpen: DoorOpen;

    constructor(jsonString: string) {

        let base: SettingsObject;
        base = <SettingsObject>JSON.parse(jsonString);

        let SETTINGS = RiskEntities.settings;

        this.heatReleaseRate = {
            comment: get(base.heatReleaseRate, 'comment', SETTINGS.heatReleaseRate.comment.default) as string,
            maxHrr: get(base.heatReleaseRate, 'max_hrr', SETTINGS.heatReleaseRate.maxHrr.default) as number[],
            alphaMinModeMax: get(base.heatReleaseRate, 'alphaMinModeMax', SETTINGS.heatReleaseRate.alphaMinModeMax.default) as number[]
        }

        this.originOfFire = {
            comment: get(base.originOfFire, 'comment', SETTINGS.originOfFire.comment.default) as string,
            fireStartsInRoomProbability: get(base.originOfFire, 'fireStartsInRoomProbability', SETTINGS.originOfFire.fireStartsInRoomProbability.default) as number,
        }
        this.evacueesConcentration = {
            comment: get(base.evacueesConcentration, 'comment', SETTINGS.evacueesConcentration.comment.default) as string,
            cor: get(base.evacueesConcentration, 'cor', SETTINGS.evacueesConcentration.cor.default) as number,
            stai: get(base.evacueesConcentration, 'stai', SETTINGS.evacueesConcentration.stai.default) as number,
            room: get(base.evacueesConcentration, 'room', SETTINGS.evacueesConcentration.room.default) as number,
            hall: get(base.evacueesConcentration, 'hall', SETTINGS.evacueesConcentration.hall.default) as number
        }
        this.evacueesSpeedParams = {
            comment: get(base.evacueesSpeedParams, 'comment', SETTINGS.evacueesSpeedParams.comment.default) as string,
            maxHSpeedMeanAndSd: get(base.evacueesSpeedParams, 'max_hSpeedMeanAndSd', SETTINGS.evacueesSpeedParams.maxHSpeedMeanAndSd.default) as number[],
            maxVSpeedMeanAndSd: get(base.evacueesSpeedParams, 'max_vSpeedMeanAndSd', SETTINGS.evacueesSpeedParams.maxVSpeedMeanAndSd.default) as number[],
            betaVMeanAndSd: get(base.evacueesSpeedParams, 'beta_vMeanAndSd', SETTINGS.evacueesSpeedParams.betaVMeanAndSd.default) as number[],
            alphaVMeanAndSd: get(base.evacueesSpeedParams, 'alpha_vMeanAndSd', SETTINGS.evacueesSpeedParams.alphaVMeanAndSd.default) as number[],
        }
        this.preEvacuationTime = {
            comment: get(base.preEvacuationTime, 'comment', SETTINGS.preEvacuationTime.comment.default) as string,
            meanAndSdOrdinaryRoom: get(base.preEvacuationTime, 'meanAndSdOrdinaryRoom', SETTINGS.preEvacuationTime.meanAndSdOrdinaryRoom.default) as number[],
            meanAndSdRoomOfFireOrigin: get(base.preEvacuationTime, 'meanAndSdRoomOfFireOrigin', SETTINGS.preEvacuationTime.meanAndSdRoomOfFireOrigin.default) as number[],
        }
        this.windowOpen = {
            comment: get(base.windowOpen, 'comment', SETTINGS.windowOpen.comment.default) as string,
            setup: get(base.windowOpen, 'setup', SETTINGS.windowOpen.setup) as any,
        }
        this.doorOpen = {
            comment: get(base.doorOpen, 'comment', SETTINGS.doorOpen.comment.default) as string,
            electroMagnetDoorIsOpenProbability: get(base.doorOpen, 'electroMagnetDoorIsOpenProbability', SETTINGS.doorOpen.electroMagnetDoorIsOpenProbability.default) as number,
            doorCloserDoorIsOpenProbability: get(base.doorOpen, 'door_closerDoorIsOpenProbability', SETTINGS.doorOpen.electroMagnetDoorIsOpenProbability.default) as number,
            standardDoorIsOpenProbability: get(base.doorOpen, 'standardDoorIsOpenProbability', SETTINGS.doorOpen.standardDoorIsOpenProbability.default) as number,
            vventsNoFailureProbability: get(base.doorOpen, 'vventsNoFailureProbability', SETTINGS.doorOpen.vventsNoFailureProbability.default) as number,
        }

    }

    /**
     * Getter heatReleaseRate
     * @return {HeatReleaseRate}
     */
    public get heatReleaseRate(): HeatReleaseRate {
        return this._heatReleaseRate;
    }

    /**
     * Setter heatReleaseRate
     * @param {HeatReleaseRate} value
     */
    public set heatReleaseRate(value: HeatReleaseRate) {
        this._heatReleaseRate = value;
    }

    /**
     * Getter originOfFire
     * @return {OriginOfFire}
     */
    public get originOfFire(): OriginOfFire {
        return this._originOfFire;
    }

    /**
     * Setter originOfFire
     * @param {OriginOfFire} value
     */
    public set originOfFire(value: OriginOfFire) {
        this._originOfFire = value;
    }

    /**
     * Getter evacueesConcentration
     * @return {EvacueesConcentration}
     */
    public get evacueesConcentration(): EvacueesConcentration {
        return this._evacueesConcentration;
    }

    /**
     * Setter evacueesConcentration
     * @param {EvacueesConcentration} value
     */
    public set evacueesConcentration(value: EvacueesConcentration) {
        this._evacueesConcentration = value;
    }

    /**
     * Getter evacueesSpeedParams
     * @return {EvacueesSpeedParams}
     */
    public get evacueesSpeedParams(): EvacueesSpeedParams {
        return this._evacueesSpeedParams;
    }

    /**
     * Setter evacueesSpeedParams
     * @param {EvacueesSpeedParams} value
     */
    public set evacueesSpeedParams(value: EvacueesSpeedParams) {
        this._evacueesSpeedParams = value;
    }

    /**
     * Getter preEvacuationTime
     * @return {PreEvacuationTime}
     */
    public get preEvacuationTime(): PreEvacuationTime {
        return this._preEvacuationTime;
    }

    /**
     * Setter preEvacuationTime
     * @param {PreEvacuationTime} value
     */
    public set preEvacuationTime(value: PreEvacuationTime) {
        this._preEvacuationTime = value;
    }

    /**
     * Getter windowOpen
     * @return {WindowOpen}
     */
    public get windowOpen(): WindowOpen {
        return this._windowOpen;
    }

    /**
     * Setter windowOpen
     * @param {WindowOpen} value
     */
    public set windowOpen(value: WindowOpen) {
        this._windowOpen = value;
    }

    /**
     * Getter outdoorTemperature
     * @return {OutdoorTemperature}
     */
    public get outdoorTemperature(): OutdoorTemperature {
        return this._outdoorTemperature;
    }

    /**
     * Setter outdoorTemperature
     * @param {OutdoorTemperature} value
     */
    public set outdoorTemperature(value: OutdoorTemperature) {
        this._outdoorTemperature = value;
    }

    /**
     * Getter doorOpen
     * @return {DoorOpen}
     */
    public get doorOpen(): DoorOpen {
        return this._doorOpen;
    }

    /**
     * Setter doorOpen
     * @param {DoorOpen} value
     */
    public set doorOpen(value: DoorOpen) {
        this._doorOpen = value;
    }

    /** Export to json */
    public toJSON(): object {
        let settings = {
            heatReleaseRate: this.heatReleaseRate,
            originOfFire: this.originOfFire,
            evacueesConcentration: this.evacueesConcentration,
            evacueesSpeedParams: this.evacueesSpeedParams,
            preEvacuationTime: this.preEvacuationTime,
            windowOpen: this.windowOpen,
            doorOpen: this.doorOpen
        }
        return settings;
    }

}