import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string | undefined

  constructor(private authService: AuthService, private router: Router) {
  }

  panelOpenState: boolean = false;

  ngOnInit(): void {
    this.username = this.authService.credentials?.username
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
