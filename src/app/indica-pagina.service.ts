import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class IndicaPaginaService {
  private paginas : number;
  private activo : number;

  constructor() { 
    this.paginas=0;
    this.activo=0
  }

  crear_paginador(pags:number,act:number){
    this.paginas=pags;
    this.activo=act;
    var txtactivo="";
    var paginador="<ul class='bull-li'>";
    for(let i=1;i<=this.paginas;i++){
      if(i==this.activo){
          txtactivo=" class='active' ";
      } else {
          txtactivo="";
      }
      paginador+="<li "+txtactivo+">"+i+"</li>";
    }
    paginador+="</ul>";
    return paginador;
  }
}