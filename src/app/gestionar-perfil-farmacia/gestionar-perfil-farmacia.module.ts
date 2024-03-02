import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionarPerfilFarmaciaPageRoutingModule } from './gestionar-perfil-farmacia-routing.module';
import { GestionarPerfilFarmaciaPage } from './gestionar-perfil-farmacia.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule, // Módulo principal de angular-google-maps
    GestionarPerfilFarmaciaPageRoutingModule
  ],
  declarations: [GestionarPerfilFarmaciaPage]
})

export class GestionarPerfilFarmaciaPageModule {}