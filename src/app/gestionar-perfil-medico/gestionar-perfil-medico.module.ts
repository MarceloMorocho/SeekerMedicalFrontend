import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionarPerfilMedicoPageRoutingModule } from './gestionar-perfil-medico-routing.module';
import { GestionarPerfilMedicoPage } from './gestionar-perfil-medico.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    AgmCoreModule, //Módulo principal de angular-google-maps
    IonicModule,
    GestionarPerfilMedicoPageRoutingModule
  ],
  declarations: [GestionarPerfilMedicoPage]
})

export class GestionarPerfilMedicoPageModule {}