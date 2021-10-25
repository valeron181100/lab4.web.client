import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  baseUrl: string = environment.baseUrl;

  loginUrl: string = this.baseUrl + "auth/login";

  historyUrl: string = this.baseUrl + "history/";

  historyCreateUrl: string = this.baseUrl + "history/c";

  historyClearUrl: string = this.baseUrl + "history/clear/";



  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl,
    {headers: new HttpHeaders({ timeout: `${5000}` }), username: username, password: password})
  }

  listHistory(userId: string): Observable<any> {
    return this.http.get(this.historyUrl + userId)
  }

  postPoint(userId: string, x: number, y: string, r: number): Observable<any> {
    return this.http.post(
      this.historyCreateUrl,
      {headers: new HttpHeaders({ timeout: `${5000}` }), userId: userId, r: r, x: x, y: y}
    )
  }

  clearHistory(userId: string): Observable<any> {
    return this.http.post(
      this.historyClearUrl + userId,
     {}
    )
  }
}
