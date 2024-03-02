import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MapaFarmaciaPageRoutingModule } from './mapa-farmacia-routing.module';
import { MapaFarmaciaPage } from './mapa-farmacia.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule,
    MapaFarmaciaPageRoutingModule
  ],
  declarations: [MapaFarmaciaPage]
})

export class MapaFarmaciaPageModule {}