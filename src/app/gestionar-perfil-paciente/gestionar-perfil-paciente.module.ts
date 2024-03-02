import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionarPerfilPacientePageRoutingModule } from './gestionar-perfil-paciente-routing.module';
import { GestionarPerfilPacientePage } from './gestionar-perfil-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarPerfilPacientePageRoutingModule
  ],
  declarations: [GestionarPerfilPacientePage]
})

export class GestionarPerfilPacientePageModule {}