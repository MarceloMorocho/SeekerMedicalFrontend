import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { IonicModule } from '@ionic/angular';
import { InformacionMedicoPageRoutingModule } from './informacion-medico-routing.module';
import { InformacionMedicoPage } from './informacion-medico.page';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InformacionMedicoPageRoutingModule
  ],
  
  declarations: [InformacionMedicoPage],
  providers: [
    LaunchNavigator,
    CallNumber,
    SocialSharing,
  ]
})

export class InformacionMedicoPageModule {}