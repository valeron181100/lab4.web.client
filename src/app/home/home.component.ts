import { Component, OnInit, SimpleChanges, OnChanges, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, FormControl, Validators, ControlContainer, FormControlDirective } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { CookieService } from "ngx-cookie-service";
import { NetworkService } from '../network.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MessageService, FormControlDirective, CookieService]
})
export class HomeComponent implements OnInit {
  
  userform: FormGroup;

  xCoord: number = 0;
  yCoord: string = '';
  rCoord: number = 0;

  xCoordGraph: number = 0;

  arrowLength: number = 7;
  lineWidth: number = 2;
  pointScale: number = 3;
  signSpace: number = 9;
  pointRadius: number = 1.5;

  axisesColor: string = "black";
  signsColor: string = this.axisesColor;

  signsFont: string = "14px monospace";
  R: number = this.rCoord;
  chartWidth: number = 220;
  chartHeight: number = this.chartWidth;
  rCoefficient: number = 0.4;

  constructor(private messageService: MessageService,
      private networkService: NetworkService, private fb: FormBuilder, private http: HttpClient, private dataService: DataService) { 
    this.userform = this.fb.group({
      'yinput': new FormControl('', Validators.compose([
          Validators.pattern('^(((\-[0-4])|[0-2])([\\.|\\,][0-9]+)?)$'),
          Validators.required])),
        'xradio-group': new FormControl('', Validators.required),
        'rradio-group': new FormControl('', Validators.required)
  });
  }


  onSubmitButtonClick(){
    this.networkService.postPoint(this.dataService.getUserId(), this.xCoord, this.yCoord, this.rCoord)
    .subscribe(
      (data: string) => {
        let json = <any>data;
        if(json.response === 'ok'){
          this.makeSuccessToast("Точка добавлена!")
        }else if(json.response === 'unknown userId'){
          this.makeErrorToast("Сессия устарела. Авторизируйтесь заново!");
          this.dataService.exit();
        }
      },
      err => this.makeErrorToast("Проверьте интернет подключение!"),
      ()=>this.redraw()
    );
  }

  clearHistory(){
    this.networkService.clearHistory(this.dataService.getUserId()).subscribe(
      (data: any) => {
        if(data.response === 'OK'){
          this.makeSuccessToast('История была очищена');
        }else{
          this.makeErrorToast('Проверьте подключение к интернету');
        }
      },
      error => this.makeErrorToast('Проверьте подключение к интернету'),
      () => this.redrawAxises()
    );
  }

  changeGraph(){
    let graphImage = $("#task-graph")[0];
    if(this.rCoord >= 0){
      graphImage.src = "./assets/images/graph-positive-r.png";
    }else{
      graphImage.src = "./assets/images/graph-negative-r.png";
    }
  }

  makeErrorToast(text: string){
    this.messageService.add({severity:'error', summary:'Ошибка', detail: text});
  }
  makeSuccessToast(text: string){
    this.messageService.add({severity:'success', summary:'Сделано', detail: text});
  }

  ngOnInit() {
    var self = this;
    let canvas = $("#task-chart")[0];
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.width;
    this.chartWidth = canvas.offsetWidth;
    this.chartHeight = this.chartWidth;
    this.draw();

    window.onresize = (event)=>{
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.width;
        this.chartWidth = canvas.offsetWidth;
        this.chartHeight = this.chartWidth;
        this.redrawAxises();
    };
  }

  draw() {
    let canvas = $("#task-chart")[0];
    this.drawAxises(canvas);
    this.drawAxisesSigns(canvas);
    this.drawPointsSigns(canvas, this.rCoord);
  }

  drawAxises(canvas) {
    let context = canvas.getContext("2d");

    context.beginPath();
    context.strokeStyle = this.axisesColor;
    context.lineWidth = this.lineWidth;

    context.moveTo(canvas.width / 2, canvas.height);
    context.lineTo(canvas.width / 2, 0);

    context.lineTo(canvas.width / 2 - this.arrowLength / 2, this.arrowLength);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2 + this.arrowLength / 2, this.arrowLength);

    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);

    context.lineTo(canvas.width - this.arrowLength, canvas.height / 2 + this.arrowLength / 2);
    context.moveTo(canvas.width, canvas.height / 2);
    context.lineTo(canvas.width - this.arrowLength, canvas.height / 2 - this.arrowLength / 2);


    context.moveTo(canvas.width * 0.1, canvas.height / 2 - this.pointScale);
    context.lineTo(canvas.width * 0.1, canvas.height / 2 + this.pointScale);

    context.moveTo(canvas.width * 0.3, canvas.height / 2 - this.pointScale);
    context.lineTo(canvas.width * 0.3, canvas.height / 2 + this.pointScale);

    context.moveTo(canvas.width * 0.7, canvas.height / 2 - this.pointScale);
    context.lineTo(canvas.width * 0.7, canvas.height / 2 + this.pointScale);

    context.moveTo(canvas.width * 0.9, canvas.height / 2 - this.pointScale);
    context.lineTo(canvas.width * 0.9, canvas.height / 2 + this.pointScale);

    context.moveTo(canvas.width / 2 - this.pointScale, canvas.height * 0.1);
    context.lineTo(canvas.width / 2 + this.pointScale, canvas.height * 0.1);

    context.moveTo(canvas.width / 2 - this.pointScale, canvas.height * 0.3);
    context.lineTo(canvas.width / 2 + this.pointScale, canvas.height * 0.3);

    context.moveTo(canvas.width / 2 - this.pointScale, canvas.height * 0.7);
    context.lineTo(canvas.width / 2 + this.pointScale, canvas.height * 0.7);

    context.moveTo(canvas.width / 2 - this.pointScale, canvas.height * 0.9);
    context.lineTo(canvas.width / 2 + this.pointScale, canvas.height * 0.9);

    context.stroke();
  }

  drawAxisesSigns(canvas) {
    let context = canvas.getContext("2d");
    context.font = this.signsFont;
    context.fillStyle = this.signsColor;

    context.fillText("Y", canvas.width / 2 + this.signSpace / 2, this.signSpace);
    context.fillText("X", canvas.width - this.signSpace, canvas.height / 2 - this.signSpace / 2);
  }

  drawPointsSigns(canvas, r) {
    let context = canvas.getContext("2d");
    context.font = this.signsFont;
    context.fillStyle = this.signsColor;

    let rIsNumber = !isNaN(Number(r));

    let sign;
    rIsNumber ? sign = -r + "" : sign = "-" + r;
    if (rIsNumber && (Math.abs(sign) - Math.floor(Math.abs(sign))) == 0) {
        sign = Number(sign).toFixed(1);
    }
    context.fillText(sign, canvas.width * 0.1 - 0.5 * sign.length * this.signSpace, canvas.height / 2 - this.signSpace / 2);
    context.fillText(sign, canvas.width / 2 + this.signSpace / 2, canvas.height * 0.9 + this.signSpace / 2);
    rIsNumber ? sign = -r / 2 + "" : sign = "-" + r + "/2";
    if (rIsNumber && (Math.abs(sign) - Math.floor(Math.abs(sign))) == 0) {
        sign = Number(sign).toFixed(1);
    }
    context.fillText(sign, canvas.width * 0.3 - 0.5 * sign.length * this.signSpace, canvas.height / 2 - this.signSpace / 2);
    context.fillText(sign, canvas.width / 2 + this.signSpace / 2, canvas.height * 0.7 + this.signSpace / 2);
    rIsNumber ? sign = r / 2 + "" : sign = r + "/2";
    if (rIsNumber && (Math.abs(sign) - Math.floor(Math.abs(sign))) == 0) {
        sign = Number(sign).toFixed(1);
    }
    context.fillText(sign, canvas.width * 0.7 - 0.5 * sign.length * this.signSpace, canvas.height / 2 - this.signSpace / 2);
    context.fillText(sign, canvas.width / 2 + this.signSpace / 2, canvas.height * 0.3 + this.signSpace / 2);
    sign = r + "";
    if (rIsNumber && (Math.abs(sign) - Math.floor(Math.abs(sign))) == 0) {
        sign = Number(sign).toFixed(1);
    }
    context.fillText(sign, canvas.width * 0.9 - 0.5 * sign.length * this.signSpace, canvas.height / 2 - this.signSpace / 2);
    context.fillText(sign, canvas.width / 2 + this.signSpace / 2, canvas.height * 0.1 + this.signSpace / 2);
  }

  drawPoint(canvas, x, y, pointColor) {
    let context = canvas.getContext("2d");
    context.beginPath();
    context.strokeStyle = pointColor;
    context.fillStyle = pointColor;

    context.arc(x, y, this.pointRadius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.stroke();
  }

  click(event) {
    this.R = this.rCoord;
    let canvas = event.target;
    let originalX = event.pageX - canvas.offsetLeft;
    let originalY = event.pageY - canvas.offsetTop;
    let compY = String(this.toComputingY(originalY, this.R)).substring(0, 10);
    let compX = String(this.toComputingX(originalX, this.R)).substring(0, 10);

    let roundedX = parseFloat(compX);
    let roundedY = parseFloat(compY).toFixed(4);

    if(+roundedY < 3 && +roundedY > -5 && roundedX <= 5 && roundedX >= -3){
        this.xCoordGraph = roundedX;
        this.yCoord = String(+roundedY);
        this.http.post(
          this.dataService.serverRootUrl + "history/c",
          {headers: new HttpHeaders({ timeout: `${5000}` }), userId: this.dataService.getUserId(), r: this.rCoord, x: this.xCoordGraph, y: this.yCoord}          
        ).subscribe(
          (data: string) => {
            let json = <any>data;
            if(json.response === 'ok'){
              this.makeSuccessToast("Точка добавлена!")
            }else if(json.response === 'unknown userId'){
              this.makeErrorToast("Сессия устарела. Авторизируйтесь заново!");
              this.dataService.exit();
            }
          },
          err => this.makeErrorToast("Проверьте интернет подключение!"),
          ()=>this.redraw()
        );
    } else{
        this.makeErrorToast("Неверные данные!");
    }
  }

  redrawAxises(){
    let canvas = $("#task-chart")[0];
    canvas.getContext('2d').clearRect(0, 0, $("#task-chart")[0].width, $("#task-chart")[0].height);
    this.draw();
    this.redraw();
  }

  redraw(){
    console.log('HOME-COMPONENT: redrawing points');
    this.http.get(
      this.dataService.serverRootUrl + "history/" + this.dataService.getUserId()       
    ).subscribe(
      (data: string) => {

        JSON.parse(JSON.stringify(data)).forEach((p, i)=>{
          if(p.r == this.rCoord){
            if(p.entered){
                this.drawPoint($('#task-chart')[0], this.toOriginalX(p.x, this.rCoord), this.toOriginalY(p.y, this.rCoord), "green");
            }else{
              this.drawPoint($('#task-chart')[0], this.toOriginalX(p.x, this.rCoord), this.toOriginalY(p.y, this.rCoord), "red");
            }
          }else{
            this.drawPoint($('#task-chart')[0], this.toOriginalX(p.x, this.rCoord), this.toOriginalY(p.y, this.rCoord), "black");
          }
        });
        
      },
      err => this.makeErrorToast("Проверьте интернет подключение!")
    );
  }

  toOriginalX(computingX, R) {
    let X = computingX / R;
    X *= this.rCoefficient * this.chartWidth;
    X += this.chartWidth / 2;

    return X;
  }

  toOriginalY(computingY, R) {
      let Y = computingY / R;
      Y *= this.rCoefficient * this.chartHeight;
      Y = -Y + this.chartHeight / 2;

      return Y;
  }

  toComputingX(originalX, R) {
      let X = originalX - this.chartWidth / 2;
      X /= this.rCoefficient * this.chartWidth;
      X *= R;

      return X;
  }

  toComputingY(originalY, R) {
      let Y = -originalY + this.chartHeight / 2;
      Y /= this.rCoefficient * this.chartHeight;
      Y *= R;

      return Y;
  }
}
