import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { RegDialogComponent } from '../reg-dialog/reg-dialog.component';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from "../data.service";
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  providers: [DialogService, MessageService, CookieService]
})
export class AuthComponent implements OnInit {
  
  clientSidePasswordPart: string = "AgwFC$";
  username: string = "";
  password: string = "";

  constructor(public dialogService: DialogService, private messageService: MessageService, public http: HttpClient,
              private dataService: DataService, private router: Router, private cookieService: CookieService) {}

  ngOnInit() {
    if (this.dataService.getIsLoggedInBoolean()) {
      this.router.navigate(['home']);
    }
  }


  onLoginClick(event){
    this.dataService.turnOnSpinner();
    this.http.post(this.dataService.serverRootUrl + "auth/login",
    {headers: new HttpHeaders({ timeout: `${5000}` }), username: this.username, password: this.clientSidePasswordPart + this.password})
    .subscribe((data: string) => {
      let json = <any>data;
      if(json.authStatus === 'login-failed'){
        if(json.message === 'unknown username'){
          this.makeErrorToast('Не удалось авторизироваться', 'Пользователь с таким именем не существует')
        }
        if(json.message === 'invalid password'){
          this.makeErrorToast('Не удалось авторизироваться', 'Неправильный пароль')
        }
      }
      else{
        this.dataService.setLoggedIn(true);
        this.dataService.setUserId(json.userId);
        this.cookieService.set('userId', json.userId);
        this.makeSuccessToast('Вы успешно авторизировались', 'Сейчас вы будете перенаправлены на вкладку "Панель"')
        setTimeout(()=>{
          this.router.navigate(['home']);
        }, 2000);
      }
    }, err => {
        console.error(err);
        this.dataService.turnOffSpinner();
        this.makeErrorToast('Ошибка: Время ожидания превышено', 'Не удалось подключить к серверу. Проверьте интернет соединение.');
      }, 
      ()=>this.dataService.turnOffSpinner());
  }

  show() {
    const ref = this.dialogService.open(RegDialogComponent, {
        header: 'Зарегистрироваться',
        width: '70%',
        contentStyle: {"max-height": "50vh", "overflow": "auto"}
    });

    ref.onClose.subscribe((authStatus: string) => {
      if (authStatus === 'created') {
          this.makeSuccessToast('Вы успешно зарегистрировались!', 'Теперь можете войти в учётную запись.');
      }
      
      if (authStatus === 'exist') {
          this.makeErrorToast('Не удалось зарегистрироваться', 'Пользователь с таким именем уже существует');
      }

      if(authStatus === 'error'){
        this.makeErrorToast('Ошибка: Время ожидания превышено', 'Не удалось подключить к серверу. Проверьте интернет соединение.');
      }
  });
  }
  
  makeErrorToast(topic: string, text: string){
    this.messageService.add({severity:'error', summary:topic, detail: text});
  }

  makeSuccessToast(topic: string, text: string){
    this.messageService.add({severity:'success', summary: topic, detail: text});
  }

}
