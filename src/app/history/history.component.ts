import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  providers: [MessageService]
})
export class HistoryComponent implements OnInit {
  resultPoints: ResultPoint[];

  constructor(private http: HttpClient, private dataService: DataService, private messageService: MessageService) { 
    this.resultPoints = [];
  }

  ngOnInit() {
    this.http.get(
      this.dataService.serverRootUrl + "history/" + this.dataService.getUserId()       
    ).subscribe(
      (data: any) => {
        this.resultPoints = (<ResultPoint[]> data).reverse();
      },
      err => this.makeErrorToast("Проверьте интернет подключение!")
    );
  }

  makeErrorToast(text: string){
    this.messageService.add({severity:'error', summary:'Ошибка', detail: text});
  }
  makeSuccessToast(text: string){
    this.messageService.add({severity:'success', summary:'Сделано', detail: text});
  }

}
export interface  ResultPoint{
  x;
  y;
  r;
  entered;
}
