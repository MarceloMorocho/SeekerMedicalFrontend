import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistrarFarmaciaPageRoutingModule } from './registrar-farmacia-routing.module';
import { RegistrarFarmaciaPage } from './registrar-farmacia.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AgmCoreModule, // Módulo principal de angular-google-maps
    IonicModule,
    RegistrarFarmaciaPageRoutingModule
  ],
  declarations: [RegistrarFarmaciaPage]
})

export class RegistrarFarmaciaPageModule {}