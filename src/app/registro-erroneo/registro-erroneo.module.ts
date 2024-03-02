import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistroErroneoPageRoutingModule } from './registro-erroneo-routing.module';
import { RegistroErroneoPage } from './registro-erroneo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroErroneoPageRoutingModule
  ],
  declarations: [RegistroErroneoPage]
})

export class RegistroErroneoPageModule {}