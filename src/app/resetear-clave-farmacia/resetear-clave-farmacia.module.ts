import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ResetearClaveFarmaciaPageRoutingModule } from './resetear-clave-farmacia-routing.module';
import { ResetearClaveFarmaciaPage } from './resetear-clave-farmacia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetearClaveFarmaciaPageRoutingModule
  ],
  declarations: [ResetearClaveFarmaciaPage]
})

export class ResetearClaveFarmaciaPageModule {}