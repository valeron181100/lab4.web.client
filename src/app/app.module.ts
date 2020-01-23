import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { PasswordModule } from 'primeng/password';
import {ButtonModule} from 'primeng/button';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import { RegDialogComponent } from './reg-dialog/reg-dialog.component';
import { InputTextModule } from "primeng/inputtext";
import {RadioButtonModule} from 'primeng/radiobutton';
import {ToastModule} from 'primeng/toast';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TableModule} from 'primeng/table';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { HistoryComponent } from './history/history.component';

const appRoutes: Routes = [
  {path: "", component: AuthComponent},
  {path: "home", component: HomeComponent, canActivate: [AuthGuard]},
  {path: "history", component: HistoryComponent, canActivate: [AuthGuard]}
]

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    RegDialogComponent,
    HomeComponent,
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    PasswordModule,
    ButtonModule,
    DynamicDialogModule,
    BrowserAnimationsModule,
    InputTextModule,
    RadioButtonModule,
    FormsModule,
    ToastModule,
    MessageModule,
    MessagesModule,
    ReactiveFormsModule,
    HttpClientModule,
    ProgressSpinnerModule,
    TableModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent],
  entryComponents: [
    RegDialogComponent
  ]
})
export class AppModule { }
