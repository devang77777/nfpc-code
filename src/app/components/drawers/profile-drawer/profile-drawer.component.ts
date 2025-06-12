import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-drawer',
  templateUrl: './profile-drawer.component.html',
  styleUrls: ['./profile-drawer.component.scss']
})
export class ProfileDrawerComponent implements OnInit {
  firstname;
  lastname;
  email;
  id;
  public avatarImage: string = 'assets/images/p1.ico';
  domain = window.location.host;
  allSoftware = JSON.parse(localStorage.getItem('allSoftware'));
  access_token = localStorage.getItem('token');
  subdomains = [
  ];
  constructor(private fds: FormDrawerService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    if (this.domain.split(':')[0] == 'localhost') {
      this.subdomains.push(
        // { name: 'Pre Sale', url: 'https://prodmobiato.nfpc.net', img: '/assets/img/pre-logo.png' },
        // { name: 'Vansales Hybrid', url: 'https://vansales.mobiato-msfa.com', img: '/assets/img/van-logo.png' },
        // { name: 'Invoice', url: 'https://invoice.mobiato-msfa.com', img: '/assets/img/invoice.png' },
        { name: 'Merchandising', url: 'https://prodmobiato.nfpc.net', img: '/assets/img/mar-logo@2x.png' }
      )
    } else if (this.domain.split('.')[0] == 'presales-prodmobiato') {
      this.subdomains.push({ name: 'Merchandising', url: 'https://presales-prodmobiato.nfpc.net', img: '/assets/img/mar-logo@2x.png' },
      )
    } else {
      this.subdomains.push(
        { name: 'Pre Sale', url: 'https://presales-prodmobiato.nfpc.net/', img: '/assets/img/pre-logo.png' }
      )
    }
    this.avatarImage = this.authService.avatar_img ? this.authService.avatar_img : this.avatarImage;
    this.firstname = localStorage.getItem("firstname");
    this.lastname = localStorage.getItem("lastname");
    this.email = localStorage.getItem("email");
    this.id = localStorage.getItem("id")
  }
  close() {
    this.fds.closeNav();
  }
  signOut() {
    this.authService.logout().subscribe((res) => {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('token');
      window.location.reload();
    });


  }

  checkApp(name) {
   
    let obj = this.allSoftware.filter(
      (x) => {
        return x.name.toLowerCase().replace(/\s/g, '') == name.toLowerCase().replace(/\s/g, '')
      });
    return obj.length > 0 ? false : true;
  }

  getAppUrl(app) {
    if (app == 'local') {
      window.open(`http://localhost:4400?is_active=0&access_token=${this.access_token}`, "_blank");
      return false;
    }
    let obj = this.allSoftware.filter(
      (x) => {
        return x.name.toLowerCase().replace(/\s/g, '') == app.name.toLowerCase().replace(/\s/g, '')
      });
    let url = '';
    if (obj.length > 0) {
      url = `${app.url}?is_active=${obj[0].is_active}&access_token=${this.access_token}`;
      window.open(url, "_blank");
    }
    //return url;
  }

  checkAppActive(name) {
    let obj = this.allSoftware.filter(
      (x) => {
        return x.name.toLowerCase().replace(/\s/g, '') == name.toLowerCase().replace(/\s/g, '')
      });
    let url = true;
    if (obj.length > 0) {
      url = obj[0].is_active == 1 ? false : true;
    }
    return url;
  }
}
