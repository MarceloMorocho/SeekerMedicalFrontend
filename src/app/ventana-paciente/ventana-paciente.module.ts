import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VentanaPacientePageRoutingModule } from './ventana-paciente-routing.module';
import { VentanaPacientePage } from './ventana-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentanaPacientePageRoutingModule
  ],
  declarations: [VentanaPacientePage]
})

export class VentanaPacientePageModule {}