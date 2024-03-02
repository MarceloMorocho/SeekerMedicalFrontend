import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ResetearClaveMedicoPageRoutingModule } from './resetear-clave-medico-routing.module';
import { ResetearClaveMedicoPage } from './resetear-clave-medico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetearClaveMedicoPageRoutingModule
  ],
  declarations: [ResetearClaveMedicoPage]
})

export class ResetearClaveMedicoPageModule {}