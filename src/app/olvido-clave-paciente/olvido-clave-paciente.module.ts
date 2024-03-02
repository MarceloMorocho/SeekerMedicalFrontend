import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OlvidoClavePacientePageRoutingModule } from './olvido-clave-paciente-routing.module';
import { OlvidoClavePacientePage } from './olvido-clave-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OlvidoClavePacientePageRoutingModule
  ],
  declarations: [OlvidoClavePacientePage]
})

export class OlvidoClavePacientePageModule {}