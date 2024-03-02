import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistrarPacientePageRoutingModule } from './registrar-paciente-routing.module';
import { RegistrarPacientePage } from './registrar-paciente.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AgmCoreModule, // Módulo principal de angular-google-maps
    IonicModule,
    RegistrarPacientePageRoutingModule
  ],
  declarations: [RegistrarPacientePage]
})

export class RegistrarPacientePageModule {}