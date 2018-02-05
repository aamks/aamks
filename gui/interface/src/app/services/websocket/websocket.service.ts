import { Injectable } from '@angular/core';
import { Observable, Observer, Subject, BehaviorSubject } from 'rxjs';
import { WebsocketMessage } from './websocket-message';
import { DefaultRouteReuseStrategy } from '@angular/router/src/route_reuse_strategy';
import { Main } from '../main/main';
import { MainService } from '../main/main.service';
import * as _ from 'lodash';
import { timeout } from 'rxjs/operators/timeout';
import { CadService } from '../cad/cad.service';
import { resolve } from 'q';
import { MeshObject } from '../fds-object/mesh';

@Injectable()
export class WebsocketService {
  // change to user variable
  WS_URL:string = "ws://localhost:2012";
  wsObservable:Observable<any>;
  wsObserver:Observer<any>;
  private ws;
  public dataStream:BehaviorSubject<any>;
  isConnected:boolean;
  main:Main;

  requestCallbacks:object = {};
  requestStatus = new Subject<string>();

  constructor(private mainService:MainService, private cadService:CadService) {
    this.mainService.getMain().subscribe(main => this.main = main);
  }

   /** Generates random id for websocket messages */
  idGenerator() {
    var id=Date.now()+'';
    var rand=Math.round(1000*Math.random())+'';
    id=id+rand;
    return id;
  }

   /** Method initalize websocket connection */
   initializeWebSocket() {
      console.log("Initializing CAD connection ...");
      this.isConnected = false;

      this.wsObservable = Observable.create((observer) => {
        this.ws = new WebSocket(this.WS_URL);
        this.ws.onopen = (e) => {
          this.isConnected = true;
          console.log("CAD connection opened ...");
        };

        this.ws.onclose = (e) => {
          if (e.wasClean) {
            observer.complete();
          } else {
            observer.error(e);
          }
          this.isConnected = false;
        };
      
        this.ws.onerror = (e) => {
          observer.error(e);
          this.isConnected = false;
        }
      
        this.ws.onmessage = (e) => {
          // manage CAD requests
          // tutaj trzeba to obczaic
          observer.next(JSON.parse(e.data));

          let message:WebsocketMessage = JSON.parse(e.data);
          if (message.requestID) {
            // answer from CAD
            this.answerMessage(message);
          }
          else {
            // new request from CAD
            this.requestMessage(message);
          }

        }
      
        return () => {
          console.log("CAD Connection closed ...");
          this.ws.close();
          this.isConnected = false;
        };
      }).share().retry();

      this.wsObserver = {
        next: (data: Object) => {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
          }
        },
        error: (err) => {
          console.log("Error sending data:");
          console.log(err);
        },
        complete: () => {

        }
      }

      this.dataStream = Subject.create(this.wsObserver, this.wsObservable);
   }

  /** Method sends message to CAD software */ 
  public sendMessage(message:WebsocketMessage) {
    console.log("\nMessage sent to CAD:")
    console.log(message);
    console.log("====================\n")

    // Add new request to requestCallbacs object
    this.requestCallbacks[message.id] = message;
    // Send message to CAD
    this.dataStream.next(message);

    return;
  }

   /** Method register answer/confirmation from CAD software */
  private answerMessage(message:WebsocketMessage) {
    console.log("\nAnswer from CAD:");
    console.log(message);
    console.log("====================\n")

    // Register & replace answer object in requestCallbacs
    this.requestCallbacks[message.requestID] = message;

    // Announce CAD message status
    this.requestStatus.next(message.status);

    return;
  }

   /** 
    * Method processes message from CAD software.
    * Creates new fds object with new geometry.
    */
  private requestMessage(message:WebsocketMessage) {
    console.log("Request from CAD ...");
    console.log(message);

    switch(message.method) {
      case "fExport": {
        console.log("fExport");
        this.fExport(message.data);

        break;
      }
      case "fSelect": {

        break;
      }
      default: {

        break;
      }
    }

    // Send answer to CAD software;
    let answer:WebsocketMessage = {
      method: message.method,
      id: this.idGenerator(),
      requestID: message.id,
      data: {},
      status: "success"
    }
    this.sendMessage(answer);
    return;
  }

  /** Importing CAD geometry */
  private fExport(data) {

    // Meshes
    // Delete old elements
    _.remove(this.main.currentFdsScenario.fdsObject.geometry.meshes, (mesh) => {
      return true;
    });
    // Transform CAD elements
    let newMeshes = this.cadService.transformMeshes(data.geometry.meshes, this.main.currentFdsScenario.fdsObject.geometry.meshes);
    // Set new meshes to current scenario
    _.each(newMeshes, (mesh) => {
      this.main.currentFdsScenario.fdsObject.geometry.meshes.push(mesh);
    });


  }

  /** Sync CAD object with GUI form */
  syncUpdateItem(elementType:string, element:object) {
    
    let method;
    let data = { };
    
    switch(elementType) {

      case "mesh":
        method = "updateMeshWeb";
        data['idAC'] = element['idAC'];
        data['xb'] = element['xb'];
        break;

      case "obst":
        method = "updateObstWeb";
        data['idAC'] = element['idAC'];
        data['xb'] = element['xb'];
        break;

      default:
        data = undefined;
    }

    if(this.isConnected && data != undefined) {
      // Create message
      let message:WebsocketMessage = {
        method: method,
        data: data,
        id: this.idGenerator(),
        requestID: '',
        status: "waiting"
      }
      // Send message to CAD
      this.sendMessage(message);

    }
    // Register offline changes ... if needed ??
    else {
      console.log("No CAD connected ...");

    }

  }


}
