import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private baseUrl = `http://${ipServidor}/login`;
  private identifierKey: string = '';
  private username: string = '';
  private medicoData: any;
  private pacienteData: any;
  private farmaciaData: any;

  constructor(private http: HttpClient) { }

  setMedicoData(data: any) {
    this.medicoData = data;
    console.log('Datos del médico almacenados:', data);
  }

  setPacienteData(data: any) {
    this.pacienteData = data;
    console.log('Datos del paciente almacenados:', data);
  }

  setFarmaciaData(data: any) {
    this.farmaciaData = data;
    console.log('Datos de la farmacia almacenados:', data);
  }

  setIdentifierKey(key: string) {
    this.identifierKey = key;
  }

  setUsername(username: string) {
    this.username = username;
  }

  getMedicoData(): any {
    return this.medicoData;
  }

  getPacienteData(): any {
    return this.pacienteData;
  }

  getFarmaciaData(): any {
    return this.farmaciaData;
  }

  getIdentifierKey(): string {
    return this.identifierKey;
  }

  getUsername(): string {
    return this.username;
  }

  autenticarUsuario(tipoUsuario: string, username: string, password: string): Observable<any> {
    const body = { tipoUsuario, username, password };
    const url = `${this.baseUrl}/${tipoUsuario}`;
    console.log('Datos enviados al servidor:', body);
    console.log('URL enviada al servidor:', url);
    return this.http.post<any>(url, body).pipe(
      tap(response => {
        const message = response && response.message ? response.message : '';
        if (message.includes('Inicio de sesión exitoso')) {
          switch (tipoUsuario) {
            case 'paciente':
              this.identifierKey = 'pacCi';
              break;
            case 'medico':
              this.identifierKey = 'medCi';
              break;
            case 'farmacia':
              this.identifierKey = 'farRuc';
              break;
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Crear una nueva instancia de HttpErrorResponse
        const newError = new HttpErrorResponse({
          error: error.error,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: url,  // Asigna la URL
        });
        throw newError;
      })
    );
  }

  autenticar(credenciales: any): Observable<any> {
    return this.autenticarUsuario(credenciales.tipoUsuario, credenciales.username, credenciales.password);
  }
}