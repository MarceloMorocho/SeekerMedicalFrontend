import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { IonicModule } from '@ionic/angular';
import { InformacionFarmaciaPageRoutingModule } from './informacion-farmacia-routing.module';
import { InformacionFarmaciaPage } from './informacion-farmacia.page';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InformacionFarmaciaPageRoutingModule
  ],
  declarations: [InformacionFarmaciaPage],
  providers: [
    LaunchNavigator,
    CallNumber,
    SocialSharing,
  ]
})

export class InformacionFarmaciaPageModule {}