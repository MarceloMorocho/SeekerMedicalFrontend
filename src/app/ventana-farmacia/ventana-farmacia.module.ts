import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VentanaFarmaciaPageRoutingModule } from './ventana-farmacia-routing.module';
import { VentanaFarmaciaPage } from './ventana-farmacia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentanaFarmaciaPageRoutingModule
  ],
  declarations: [VentanaFarmaciaPage]
})

export class VentanaFarmaciaPageModule {}