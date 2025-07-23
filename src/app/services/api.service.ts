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

  obtenerAfluencia(
    fechaInicio?: any,
    fechaFin?: any,
    parqueaderoId?: string
  ): Observable<any> {
    // Arma el query string dinámicamente solo con los filtros definidos
    const params = [];
    if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
    if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
    if (parqueaderoId) params.push(`parqueadero_id=${parqueaderoId}`);
    const query = params.length ? `?${params.join('&')}` : '';

    return this.http.get(`${this.baseUrl}/afluencia${query}`);
  }


  obtenerClientesProbables(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes-probables`);
  }

  obtenerResumenSegmentos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes-segmentados`); // o la URL completa si es externa
  }

  obtenerOcupacion(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8000/ocupacion-real');  
  }

  obtenerParqueaderos() {
    return this.http.get<any[]>('http://localhost:8000/parqueaderos');
  }


  obtenerPrediccionProphet(parqueaderoId: string = '') {
    const params = parqueaderoId ? `?parqueadero_id=${parqueaderoId}&dias=7` : '?dias=7';
    return this.http.get<{ prediccion: any[], error: { mae: number, mape: number, n: number } }>(
      `http://localhost:8000/afluencia-predicha-prophet${params}`
    );
  }

  interpretarAfluencia(datos: any[]) {
    return this.http.post<{ interpretacion: string }>(
      'http://localhost:8000/interpretar-afluencia',
      datos
    );
  }

  analizarImagen(base64_img: string, prompt: string): Observable<{ respuesta: string }> {
    return this.http.post<{ respuesta: string }>(`${this.baseUrl}/analizar-imagen`, {
      base64_img,
      prompt
    });
  }




  
}
