import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registro-erroneo',
  templateUrl: './registro-erroneo.page.html',
  styleUrls: ['./registro-erroneo.page.scss'],
})

export class RegistroErroneoPage implements OnInit {
  mensajeError: string[] = [];
  
  constructor(
    private router: Router, 
    private route: ActivatedRoute,) { }

  ngOnInit() {
    // Obtener el mensaje de error de los parámetros de la URL
    this.route.params.subscribe(params => {
      this.mensajeError = params['mensajeError'];
    });
  }

  goHome(){
    localStorage.setItem('backvalue','Home');
    this.router.navigateByUrl('/home');
  }
}