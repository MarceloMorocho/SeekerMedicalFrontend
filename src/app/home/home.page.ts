import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  // Normalmente se usa el constructor para inicializar variables, 
  // y el ngOnInit para inicializar o ejecutar tareas que tienen que ver con Angular.
  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private navCtrl: NavController,
    private router: Router 
    ) { }

  ngOnInit() {
    this.botonNativoAtras();
  }

  botonNativoAtras() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      console.log('Botón de retroceso presionado');
      this.confirmarSalirApp();
    });
  }
  
  confirmarSalirApp() {
    console.log('URL actual:', this.router.url);
    if (this.router.url !== '/home') {
      // Si no estás en la página raíz, retrocede en la pila de navegación
      this.router.navigate(['..']);
    } else {
      // Si estás en la página raíz, muestra la alerta y cierra la aplicación
      this.presentAlert();
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Salir de la aplicación',
      message: '¿Estás seguro de que quieres salir de la aplicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salir',
          handler: () => {
            // Cierra la aplicación
            (navigator as any).app.exitApp();
          },
        },
      ],
    });
    await alert.present(); // Utiliza await para esperar a que se muestre la alerta
  }
}