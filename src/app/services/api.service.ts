import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000'; // URL de tu FastAPI

  constructor(private http: HttpClient) {}

  predecirRetorno(data: { frecuencia: number, recencia: number, monto_total: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/predecir`, data);
  }

  obtenerAfluencia(): Observable<any> {
    return this.http.get(`${this.baseUrl}/afluencia`);
  }

  obtenerClientesProbables(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes-probables`);
  }

  obtenerOcupacionSimulada(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8000/ocupacion-real');  
  }


}
