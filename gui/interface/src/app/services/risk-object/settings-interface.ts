export interface HeatReleaseRate {
    comment?: string,
    hrrpuaMinModeMax: number[],
    alphaMinModeMax: number[]
}

export interface OriginOfFire {
    comment?: string,
    fireStartsInRoomProbability: number
}

export interface EvacueesConcentration {
    comment?: string,
    cor: number,
    stai: number,
    room: number,
    hall: number
}
export interface EvacueesSpeedParams {
    comment?: string,
    maxHSpeedMeanAndSd: number[],
    maxVSpeedMeanAndSd: number[],
    betaVMeanAndSd: number[],
    alphaVMeanAndSd: number[]
}
export interface PreEvacuationTime {
    comment?: string,
    meanAndSdRoomOfFireOrigin: number[],
    meanAndSdOrdinaryRoom: number[]
}
export interface WindowOpen {
    comment?: string,
    setup: any[]
}
export interface OutdoorTemperature {
    comment?: string,
    meanAndSd: number[]
}
export interface DoorOpen {
    comment?: string,
    electroMagnetDoorIsOpenProbability: number,
    doorCloserDoorIsOpenProbability: number,
    standardDoorIsOpenProbability: number,
    vventsNoFailureProbability: number
}

export interface SettingsObject {
    heatReleaseRate: HeatReleaseRate,
    originOfFire: OriginOfFire,
    cConst: number,
    preEvacuationTime: PreEvacuationTime,
    evacueesConcentration: EvacueesConcentration,
    evacueesSpeedParams: EvacueesSpeedParams,
    windowOpen: WindowOpen,
    outdoorTemperature: OutdoorTemperature,
    doorOpen: DoorOpen,
}
