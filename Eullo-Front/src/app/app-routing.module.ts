import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {ChatListComponent} from "./pages/chat/chat-list/chat-list.component";
import {ConversationComponent} from "./pages/chat/conversation/conversation.component";
import {ChatComponent} from "./pages/chat/chat.component";
import {AuthGuard} from "./core/guards/auth.guard";

const routes: Routes = [{
    path:'login',
    component:LoginComponent
  }, {
    path:'register',
    component: RegisterComponent
  },{
    path:'',
    component: ChatComponent,
    canActivate: [AuthGuard],
    pathMatch:'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
