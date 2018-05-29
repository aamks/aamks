import { Injectable } from '@angular/core';
import { Observable, Observer, Subject, BehaviorSubject } from 'rxjs';
import { WebsocketMessageObject } from './websocket-message';
import { DefaultRouteReuseStrategy } from '@angular/router/src/route_reuse_strategy';
import { Main } from '../main/main';
import { MainService } from '../main/main.service';
import { timeout } from 'rxjs/operators/timeout';
import { CadService } from '../cad/cad.service';
import { resolve } from 'q';
import { cloneDeep, remove, each, isArray, forEach } from 'lodash';
import { Risk } from '../risk-object/risk-object';
import { NotifierService } from 'angular-notifier';

@Injectable()
export class WebsocketService {
  // change to user variable
  WS_URL: string = "ws://localhost:2012";
  wsObservable: Observable<any>;
  wsObserver: Observer<any>;
  ws;
  public dataStream: BehaviorSubject<any>;
  isConnected: boolean;

  main: Main;
  risk: Risk;

  requestCallbacks: object = {};
  requestStatus = new Subject<string>();

  constructor(
    private mainService: MainService,
    private cadService: CadService,
    private readonly notifierService: NotifierService
  ) {
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  /** Generates random id for websocket messages */
  public idGenerator() {
    var id = Date.now() + '';
    var rand = Math.round(1000 * Math.random()) + '';
    id = id + rand;
    return id;
  }

  /** Method initalize websocket connection */
  public initializeWebSocket() {

    this.isConnected = false;

    this.wsObservable = Observable.create((observer) => {
      this.ws = new WebSocket(this.WS_URL);
      this.ws.onopen = (e) => {
        this.isConnected = true;
        this.notifierService.notify('success', 'CAD connection opened');
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

        let message: WebsocketMessageObject = JSON.parse(e.data);
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
        this.notifierService.notify('warning', 'CAD connection closed');
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
  public sendMessage(message: WebsocketMessageObject) {
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
  private answerMessage(message: WebsocketMessageObject) {
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
   */
  private requestMessage(message: WebsocketMessageObject) {

    console.clear();
    console.log("Request from CAD ...");
    console.log(message);

    // Send answer to CAD software;
    let answer: WebsocketMessageObject = {
      id: this.idGenerator(),
      requestID: message.id,
      status: "success",
      method: message.method,
      data: "",
    }

    try {
      switch (message.method) {
        case 'cExport': {
          console.log('cExport');
          if (this.main.currentRiskScenario != undefined) {
            this.main.currentRiskScenario.riskObject.geometry = JSON.parse(message.data);
          }
          else {
            answer.status = "error";
          }
          break;
        }

        default: {

          break;
        }
      }
    } catch (e) {
      if (e instanceof EvalError) {
        console.log(e.name + ': ' + e.message);
      } else if (e instanceof RangeError) {
        console.log(e.name + ': ' + e.message);
      }
      else {
        console.log(e.name + ': ' + e.message);
      }
      answer.status = "error";
    }

    this.sendMessage(answer);
    return;
  }

}
