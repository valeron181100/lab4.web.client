import { Component, ViewChild, ElementRef } from '@angular/core';
import { DataService } from "./data.service";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CookieService]
})
export class AppComponent {
  title = 'my-app';
  spinnerTurnedOn: boolean = false;
  @ViewChild('panelLink', {static: false}) panelLinkRef:ElementRef;
  @ViewChild('historyLink', {static: false}) historyLinkRef:ElementRef;
  @ViewChild('authLink', {static: false}) authLinkRef:ElementRef;
  @ViewChild('username', {static: false}) usernameRef:ElementRef;
  @ViewChild('usernameContainer', {static: false}) usernameContainerRef:ElementRef;

  constructor(private dataService: DataService, private router: Router, private http: HttpClient,
    private cookieService: CookieService){}

  compatSaysWho(){
    var ua= navigator.userAgent, tem,
          M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if(/trident/i.test(M[1])){
          tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
          return 'IE '+(tem[1] || '');
      }
      if(M[1]=== 'Chrome'){
          tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
          if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
      M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
      return M.join(' ');
  }

  compatApply(){
    var broserInfo = this.compatSaysWho();
    var browserName = broserInfo.split(' ')[0];
    var browserVer = broserInfo.split(' ')[1];
    if( browserName == 'Firefox' && parseInt(browserVer) <= 52){
      $('#mainHeaderCodeImg').remove();
      $('#authorNameBackground').remove();
      $('#authorName').css('position', 'relative');
      $('#authorName').css('margin-left', 'calc(5vw * 0.5)');
    }
  }

  ngOnInit(){
    window.addEventListener('scroll', this.onScroll, true);
    
  }

  ngAfterViewInit(): void {
    this.dataService.getIsLoggedIn().subscribe((isLoggedIn)=>{
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
    if(this.cookieService.check('userId')){
      let urlArr = location.href.split('/');
      this.dataService.setLoggedIn(true);
      this.dataService.setUserId(this.cookieService.get('userId'));
      let requestUrl = urlArr.pop();
      console.log('APP-COMPONENT: requestUrl = ' + requestUrl);
      if(requestUrl === ''){
        this.router.navigate(['home']);
      }else{
        this.router.navigate([requestUrl]);
      }
      
      
    }

    this.compatApply();
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
