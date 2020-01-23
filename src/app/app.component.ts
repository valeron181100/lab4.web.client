import { Component, ViewChild, ElementRef } from '@angular/core';
import { DataService } from "./data.service";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { url } from 'inspector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-app';
  spinnerTurnedOn: boolean = false;
  @ViewChild('panelLink', {static: false}) panelLinkRef:ElementRef;
  @ViewChild('historyLink', {static: false}) historyLinkRef:ElementRef;
  @ViewChild('authLink', {static: false}) authLinkRef:ElementRef;
  @ViewChild('username', {static: false}) usernameRef:ElementRef;
  @ViewChild('usernameContainer', {static: false}) usernameContainerRef:ElementRef;

  constructor(private dataService: DataService, private router: Router, private http: HttpClient){}



  ngOnInit(){
    window.addEventListener('scroll', this.onScroll, true);
    
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.dataService.getIsLoggedIn().subscribe((isLoggedIn)=>{
      console.log('styling');
      if(isLoggedIn){
        this.panelLinkRef.nativeElement.style = 'display: block';
        this.historyLinkRef.nativeElement.style = 'display: block';
        this.authLinkRef.nativeElement.innerText = 'Выход';
      }
    });

    this.dataService.getUserIdObservable().subscribe((userId)=>{
      if(userId !== ''){
        this.http.get(this.dataService.serverRootUrl + "auth/nameof?userId=" + this.dataService.getUserId()).subscribe(
        (data: any)=>{
          if(data.response === 'OK'){
            this.usernameContainerRef.nativeElement.style = 'display: block';
            this.usernameRef.nativeElement.innerText = data.username;
          }
          if(data.response === 'ERROR'){
            this.usernameRef.nativeElement.innerText = ' ####';
            this.dataService.exit();
          }
        },
        err => console.log(err)
      );
      }
    });

    this.dataService.getSpinnerTurnedOnObservable().subscribe(spinnerTurnedOn => this.spinnerTurnedOn = spinnerTurnedOn);
    if(this.dataService.isUserIdCached()){
      let urlArr = location.href.split('/');
      this.dataService.setLoggedIn(true);
      this.dataService.setUserId(this.dataService.getUserIdFromCookies());
      let requestUrl = urlArr.pop();
      if(requestUrl === ''){
        this.router.navigate(['home']);
      }else{
        this.router.navigate([requestUrl]);
      }
      
      
    }
  }

  onExitButtonClick(){
    this.authLinkRef.nativeElement.innerText = 'Вход';
    this.dataService.setLoggedIn(false);
    this.panelLinkRef.nativeElement.style = 'display: none';
    this.historyLinkRef.nativeElement.style = 'display: none';
    this.usernameContainerRef.nativeElement.style = 'display: none';
    this.dataService.exit();
  }

  onScroll(event){
    const scrolled = window.scrollY;
    var headerHeight = $('#mainHeader').height() + $('#loginDisplay').height();
    if(scrolled >= headerHeight){
        $('#header').css({'position' : 'fixed',
            'margin-top': -headerHeight});
        $('#sidePanel').css({'position' : 'fixed',
            'margin-top': -headerHeight});
    }
    else{
        $('#header').css({'position' : 'static',
            'margin-top': 0});
        $('#sidePanel').css({'position' : 'absolute',
            'margin-top': '-4vh'});
    }
  }
}
