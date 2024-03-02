import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListadoMedicoPageRoutingModule } from './listado-medico-routing.module';
import { ListadoMedicoPage } from './listado-medico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListadoMedicoPageRoutingModule
  ],
  declarations: [ListadoMedicoPage]
})

export class ListadoMedicoPageModule {}