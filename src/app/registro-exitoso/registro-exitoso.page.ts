import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registro-exitoso',
  templateUrl: './registro-exitoso.page.html',
  styleUrls: ['./registro-exitoso.page.scss'],
})
export class RegistroExitosoPage implements OnInit {

  constructor(
    private router: Router, 
    private route: ActivatedRoute) { }

  ngOnInit() {
  }

  goHome(){
    localStorage.setItem('backvalue','Home');
    this.router.navigateByUrl('/home');
  }
}
