import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListadoFarmaciaPageRoutingModule } from './listado-farmacia-routing.module';
import { ListadoFarmaciaPage } from './listado-farmacia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListadoFarmaciaPageRoutingModule
  ],
  declarations: [ListadoFarmaciaPage]
})

export class ListadoFarmaciaPageModule {}