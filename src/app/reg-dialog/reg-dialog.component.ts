import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reg-dialog',
  templateUrl: './reg-dialog.component.html',
  styleUrls: ['./reg-dialog.component.css'],
  providers: [MessageService]
})
export class RegDialogComponent implements OnInit {
  clientSidePasswordPart: string = "AgwFC$";
  username: string = "";
  password: string = "";
  repeatedPassword: string = "";

  isUserNameExists: boolean = false;
  isPasswordsEquals: boolean = true;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, public http: HttpClient, 
    private dataService: DataService, private messageService: MessageService) { }

  ngOnInit() {
  }

  onReg(event){
    this.dataService.turnOnSpinner();
    this.http.post(this.dataService.serverRootUrl + "auth/c", 
    {username: this.username, password: this.clientSidePasswordPart + this.password})
    .subscribe((data: string) => {
      let json = <any>data;
      console.log(JSON.stringify(json));
      this.ref.close(json.authStatus);
    }, err => {
      console.error(err);
      this.dataService.turnOffSpinner();
      this.ref.close('error');
    },
    ()=> this.dataService.turnOffSpinner());
  }

  onLoginInput(event){
    console.log('sending');
    this.http.get(this.dataService.serverRootUrl + "auth/exists?username="+this.username)
    .subscribe((data: string) => {
      console.log("response data: " + (<any>data).response);
      this.isUserNameExists = (<any>data).response;
    });
  }

  makeErrorToast(topic: string, text: string){
    this.messageService.add({severity:'error', summary:topic, detail: text});
  }

  makeSuccessToast(topic: string, text: string){
    this.messageService.add({severity:'success', summary: topic, detail: text});
  }

}
