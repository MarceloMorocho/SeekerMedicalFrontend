import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OlvidoClaveMedicoPageRoutingModule } from './olvido-clave-medico-routing.module';
import { OlvidoClaveMedicoPage } from './olvido-clave-medico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OlvidoClaveMedicoPageRoutingModule
  ],
  declarations: [OlvidoClaveMedicoPage]
})

export class OlvidoClaveMedicoPageModule {}