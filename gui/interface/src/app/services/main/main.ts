import { Project } from '../project/project';
import { FdsScenario } from '../fds-scenario/fds-scenario';
import { RiskScenario } from '../risk-scenario/risk-scenario';
import { Category } from '../category/category';

export interface MainObject {
    userId:number,
    userName:string,
    editor:string,
    //_lib=new Library(), - sprawdzic jak to dziala ...
    projects:Project[],
    websocket:object, // ?? chyba nie potrzbne - wszystkie zmienne mam w websocketservice
    timeout:number,
    currentProject:Project,
    currentFdsScenario:FdsScenario,
    currentRiskScenario:RiskScenario,
    categories:Category[]
}
export class Main {
    private _userId:number;
    private _userName:string;
    private _editor:string;
    private //_lib=new Library(); - sprawdzic jak to dziala ...
    private _projects:Project[];
    private _websocket:object = {};
    private _timeout:number;
    private _currentProject:Project;
    private _currentFdsScenario:FdsScenario;
    private _currentRiskScenario:RiskScenario;
    private _categories:Category[];

    constructor(jsonString:string) { 

        let base:MainObject;
        base = <MainObject>JSON.parse(jsonString); 

        this.userId = base.userId || undefined;
        this.userName = base.userName || undefined;
        this.editor = base.editor || "text";
        //this._lib=new Library(); - sprawdzic jak to dziala ...
        this.projects = [];
        this.websocket = base.websocket || {
            host: "localhost",
            port: "2012",
            //messages =  Websocket.messages,
            //connection  =  Websocket.connection
        };
        this.timeout = base.timeout || 3600;
        this.currentProject = undefined;
        this.currentFdsScenario = undefined;
        this.currentRiskScenario = undefined;
        this.categories = [];
    }

    /** getter/setter userId */
    public get userId(){
        return this._userId;
    }
    public set userId(userId:number){
        this._userId = userId;
    }

    /** getter/setter userName */
    public get userName(){
        return this._userName;
    }
    public set userName(userName:string){
        this._userName = userName;
    }

    /** getter/setter editor */
    public get editor(){
        return this._editor;
    }
    public set editor(editor:string){
        this._editor = editor;
    }

    /** getter/setter projects */
    public get projects(){
        return this._projects;
    }
    public set projects(projects:Project[]){
        this._projects = projects;
    }

    /** getter/setter websocket */
    public get websocket(){
        return this._websocket;
    }
    public set websocket(websocket:object){
        this._websocket = websocket;
    }

    /** getter/setter timeout */
    public get timeout(){
        return this._timeout;
    }
    public set timeout(timeout:number){
        this._timeout = timeout;
    }

    /** getter/setter currentProject */
    public get currentProject(){
        return this._currentProject;
    }
    public set currentProject(currentProject:Project){
        this._currentProject = currentProject;
    }
    /** getter/setter currentFdsScenario */
    public get currentFdsScenario(){
        return this._currentFdsScenario;
    }
    public set currentFdsScenario(currentFdsScenario:FdsScenario){
        this._currentFdsScenario = currentFdsScenario;
    }

    /** getter/setter currentRiskScenario */
    public get currentRiskScenario(){
        return this._currentRiskScenario;
    }
    public set currentRiskScenario(currentRiskScenario:RiskScenario){
        this._currentRiskScenario = currentRiskScenario;
    }

	public get categories(): Category[] {
		return this._categories;
	}

	public set categories(value: Category[]) {
		this._categories = value;
	}


}
