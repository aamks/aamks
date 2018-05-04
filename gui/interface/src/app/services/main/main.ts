import { Project } from '../project/project';
import { RiskScenario } from '../risk-scenario/risk-scenario';
import { Category } from '../category/category';

export interface MainObject {
    userId: number,
    userName: string,
    editor: string,
    projects: Project[],
    websocket: {
        host: string,
        port: number
    }
    timeout: number,
    currentProject: Project,
    currentRiskScenario: RiskScenario,
    categories: Category[],
    hostAddres: string
}
export class Main {
    private _userId: number;
    private _userName: string;
    private _editor: string;
    private _projects: Project[];
    private _websocket: object = {};
    private _timeout: number;
    private _currentProject: Project;
    private _currentRiskScenario: RiskScenario;
    private _categories: Category[];
    private _hostAddres: string;

    constructor(jsonString: string) {

        let base: MainObject;
        base = <MainObject>JSON.parse(jsonString);

        this.userId = base.userId || undefined;
        this.userName = base.userName || undefined;
        this.editor = base.editor || "text";
        this.projects = [];
        this.websocket = base.websocket || {
            host: "localhost",
            port: "2012",
        };
        this.timeout = base.timeout || 3600;
        this.currentProject = undefined;
        this.currentRiskScenario = undefined;
        this.categories = [];
        this.hostAddres = base.hostAddres || 'https://aamks.inf.sgsp.edu.pl';
    }

    /**
     * Getter userId
     * @return {number}
     */
	public get userId(): number {
		return this._userId;
	}

    /**
     * Setter userId
     * @param {number} value
     */
	public set userId(value: number) {
		this._userId = value;
	}

    /**
     * Getter userName
     * @return {string}
     */
	public get userName(): string {
		return this._userName;
	}

    /**
     * Setter userName
     * @param {string} value
     */
	public set userName(value: string) {
		this._userName = value;
	}

    /**
     * Getter editor
     * @return {string}
     */
	public get editor(): string {
		return this._editor;
	}

    /**
     * Setter editor
     * @param {string} value
     */
	public set editor(value: string) {
		this._editor = value;
	}

    /**
     * Getter projects
     * @return {Project[]}
     */
	public get projects(): Project[] {
		return this._projects;
	}

    /**
     * Setter projects
     * @param {Project[]} value
     */
	public set projects(value: Project[]) {
		this._projects = value;
	}

    /**
     * Getter websocket
     * @return {object }
     */
	public get websocket(): object  {
		return this._websocket;
	}

    /**
     * Setter websocket
     * @param {object } value
     */
	public set websocket(value: object ) {
		this._websocket = value;
	}

    /**
     * Getter timeout
     * @return {number}
     */
	public get timeout(): number {
		return this._timeout;
	}

    /**
     * Setter timeout
     * @param {number} value
     */
	public set timeout(value: number) {
		this._timeout = value;
	}

    /**
     * Getter currentProject
     * @return {Project}
     */
	public get currentProject(): Project {
		return this._currentProject;
	}

    /**
     * Setter currentProject
     * @param {Project} value
     */
	public set currentProject(value: Project) {
		this._currentProject = value;
	}

    /**
     * Getter currentRiskScenario
     * @return {RiskScenario}
     */
	public get currentRiskScenario(): RiskScenario {
		return this._currentRiskScenario;
	}

    /**
     * Setter currentRiskScenario
     * @param {RiskScenario} value
     */
	public set currentRiskScenario(value: RiskScenario) {
		this._currentRiskScenario = value;
	}

    /**
     * Getter categories
     * @return {Category[]}
     */
	public get categories(): Category[] {
		return this._categories;
	}

    /**
     * Setter categories
     * @param {Category[]} value
     */
	public set categories(value: Category[]) {
		this._categories = value;
	}

    /**
     * Getter hostAddres
     * @return {string}
     */
	public get hostAddres(): string {
		return this._hostAddres;
	}

    /**
     * Setter hostAddres
     * @param {string} value
     */
	public set hostAddres(value: string) {
		this._hostAddres = value;
	}
}
