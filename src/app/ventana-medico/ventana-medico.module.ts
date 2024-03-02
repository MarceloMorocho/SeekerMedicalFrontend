import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VentanaMedicoPageRoutingModule } from './ventana-medico-routing.module';
import { VentanaMedicoPage } from './ventana-medico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentanaMedicoPageRoutingModule
  ],
  declarations: [VentanaMedicoPage]
})

export class VentanaMedicoPageModule {}