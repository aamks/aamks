import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

export interface Result {
  meta: {
    status:string,
    from:string,
    details:string[]
  },
  data:object
}

@Injectable()
export class HttpManagerService {

  constructor(private http: HttpClient) { }

  /**
   * Http get request
   * @param apiURL Backed api url
   */
  get(apiURL) {
    let promise = new Promise((resolve, reject) => {
      this.http.get(apiURL)
        .toPromise()
        .then(
          (result:Result) => { // Success

            console.log(result);

            if(result.meta.status == 'success') {
              console.log('Notification success');
              resolve(result);
            } else if(result.meta.status == 'info') {
              console.log('Notification info');
              resolve(result);
            } else if(result.meta.status == 'warning') {
              console.log('Notification warning');
              reject(result);
            } else if(result.meta.status == 'error') {
              console.log('Notification error');
              reject(result);
            } else {
              reject(result);
            }
            console.log(result);

          },
          error => { // Error
            reject(error);
          }
        );
    });
    return promise;
  }

  /**
   * Put api
   * @param apiURL 
   * @param object 
   */
  put(apiURL:string, object:any) {
    let promise = new Promise((resolve, reject) => {
      this.http.put(apiURL, object)
        .toPromise()
        .then(
          (result:Result) => { // Success

            console.log(result);

            if(result.meta.status == 'success') {
              console.log('Notification success');
              resolve(result);
            } else if(result.meta.status == 'info') {
              console.log('Notification info');
              resolve(result);
            } else if(result.meta.status == 'warning') {
              console.log('Notification warning');
              reject(result);
            } else if(result.meta.status == 'error') {
              console.log('Notification error');
              reject(result);
            } else {
              reject(result);
            }
            console.log(result);

          },
          error => { // Error
            reject(error);
          }
        );
    });
    return promise;
  }

  /**
   * Post api
   * @param apiURL 
   * @param object 
   */
  post(apiURL:string, object:any) {
    let promise = new Promise((resolve, reject) => {
      this.http.post(apiURL, object)
        .toPromise()
        .then(
          (result:Result) => { // Success

            console.log(result);

            if(result.meta.status == 'success') {
              console.log('Notification success');
              resolve(result);
            } else if(result.meta.status == 'info') {
              console.log('Notification info');
              resolve(result);
            } else if(result.meta.status == 'warning') {
              console.log('Notification warning');
              reject(result);
            } else if(result.meta.status == 'error') {
              console.log('Notification error');
              reject(result);
            } else {
              reject(result);
            }
            console.log(result);

          },
          error => { // Error
            reject(error);
          }
        );
    });
    return promise;
  }

  /**
   * Delete api
   * @param apiURL 
   * @param object 
   */
  delete(apiURL:string) {
    let promise = new Promise((resolve, reject) => {
      this.http.delete(apiURL)
        .toPromise()
        .then(
          (result:Result) => { // Success

            console.log(result);

            if(result.meta.status == 'success') {
              console.log('Notification success');
              resolve(result);
            } else if(result.meta.status == 'info') {
              console.log('Notification info');
              resolve(result);
            } else if(result.meta.status == 'warning') {
              console.log('Notification warning');
              reject(result);
            } else if(result.meta.status == 'error') {
              console.log('Notification error');
              reject(result);
            } else {
              reject(result);
            }
            console.log(result);

          },
          error => { // Error
            reject(error);
          }
        );
    });
    return promise;
  }

}