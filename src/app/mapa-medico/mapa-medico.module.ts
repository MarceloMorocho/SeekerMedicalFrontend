import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MapaMedicoPageRoutingModule } from './mapa-medico-routing.module';
import { MapaMedicoPage } from './mapa-medico.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule,
    MapaMedicoPageRoutingModule
  ],
  declarations: [MapaMedicoPage]
})

export class MapaMedicoPageModule {}