import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private userId = new BehaviorSubject<string>('');
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private spinnerTurnedOn = new BehaviorSubject<boolean>(false);
  public serverRootUrl = 'http://localhost:29332/';

  constructor() {

    this.getUserIdObservable().subscribe((token: string)=>{
      if(this.isLoggedIn.value && token !== ''){
        // document.cookie += 'userId=' + token + ';';
        console.log('DATA-SERVICE: userId was added to cookies');
      }
    });
  }

  clearCookies(): void{
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      let eqPos = cookie.indexOf("=");
      let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    console.log('DATA-SERVICE: cookies cleared');
  }


  exit(){
    this.clearCookies();
    this.setLoggedIn(false);
    console.log('DATA-SERVICE: loggedIn was setted to false');
  }

  turnOnSpinner(){
    this.spinnerTurnedOn.next(true);
  }
  
  turnOffSpinner(){
    this.spinnerTurnedOn.next(false);
  }

  getSpinnerTurnedOnObservable(): Observable<boolean>{
    return this.spinnerTurnedOn.asObservable();
  }

  setLoggedIn(isLoggedIn: boolean){
    console.log('DATA-SERVICE: some component setted isLoggedIn variable to ' + isLoggedIn);
      this.isLoggedIn.next(isLoggedIn);
  }

  getIsLoggedIn(): Observable<boolean>{
      return this.isLoggedIn.asObservable();
  }

  getIsLoggedInBoolean(): boolean{
    return this.isLoggedIn.value;
  }

  
  setUserId(userId : string) {
      this.userId.next(userId);
  }
  
  public getUserIdObservable() : Observable<string> {
    return this.userId.asObservable();
}

  public getUserId() : string {
      return this.userId.value.replace('userId', '');
  }
}