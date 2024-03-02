import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OlvidoClaveFarmaciaPageRoutingModule } from './olvido-clave-farmacia-routing.module';
import { OlvidoClaveFarmaciaPage } from './olvido-clave-farmacia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OlvidoClaveFarmaciaPageRoutingModule
  ],
  declarations: [OlvidoClaveFarmaciaPage]
})

export class OlvidoClaveFarmaciaPageModule {}