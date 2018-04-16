import { FdsScenario, FdsScenarioObject } from '../fds-scenario/fds-scenario';
import { RiskScenario } from '../risk-scenario/risk-scenario';
import * as _ from 'lodash';

export interface ProjectObject {
    id: number,
    name: string,
    description: string,
    category: string,
    fdsScenarios: FdsScenario[],
    riskScenarios: RiskScenario[]
}

export class Project {
    _id: number;
    _name: string;
    _description: string;
    _category: string;
    _fdsScenarios: FdsScenario[];
    _riskScenarios: RiskScenario[];

    constructor(jsonString: string) {

        let base: ProjectObject;
        base = <ProjectObject>JSON.parse(jsonString);

        this._id = base.id || 0;
        this._name = base.name || '';
        this._description = base.description || '';
        this._category = base.category || '';
        this._fdsScenarios = [];
        if (base.fdsScenarios) {
            _.forEach(base.fdsScenarios, (scenario) => {
                this._fdsScenarios.push(new FdsScenario(JSON.stringify(scenario)));
                //this._fdsScenarios.push(new FdsScenario(JSON.stringify(scenario)));
            });
        }
        this._riskScenarios = [];
        if (base.riskScenarios) {
            _.forEach(base.riskScenarios, (scenario) => {
                console.log(scenario);
                this._riskScenarios.push(new RiskScenario(JSON.stringify(scenario)));
            });
        }
    }

    /** getter/setter id */
    get id() {
        return this._id;
    }
    set id(id: number) {
        this._id = id;
    }

    /** getter/setter name */
    get name() {
        return this._name;
    }
    set name(name: string) {
        this._name = name;
    }

    /** getter/setter description */
    get description() {
        return this._description;
    }
    set description(description: string) {
        this._description = description;
    }

    /** getter/setter category */
    get category() {
        return this._category;
    }
    set category(category: string) {
        this._category = category;
    }

    /** getter/setter fdsScenarios */
    get fdsScenarios() {
        return this._fdsScenarios;
    }
    set fdsScenarios(fdsScenarios: FdsScenario[]) {
        this._fdsScenarios = fdsScenarios;
    }

    /** getter/setter riskScenario */
    get riskScenarios() {
        return this._riskScenarios;
    }
    set riskScenarios(riskScenarios: RiskScenario[]) {
        this._riskScenarios = riskScenarios;
    }

    /** Return json object to DB */
    public toJSON(): string {
        let project: object = {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category
        }
        return JSON.stringify(project);
    }

}
