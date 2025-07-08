import { Component, OnInit } from '@angular/core';
import { latLng, tileLayer, marker, divIcon, Marker } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MaterialModule } from '../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  standalone: true,
  selector: 'app-mapa-parqueaderos',
  templateUrl: './mapa-parqueaderos.component.html',
  styleUrls: [],
  imports: [LeafletModule,MaterialModule, NgApexchartsModule, TablerIconsModule],
})
export class MapaParqueaderosComponent implements OnInit {

  layers: Marker[] = [];
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: latLng(-0.2202, -78.5127) // Quito centro
  };

  parqueaderos = [
    {
      nombre: 'Centro Histórico',
      lat: -0.2195,
      lng: -78.5121,
      capacidad: 20,
      libres: 5
    },
    {
      nombre: 'Mall El Jardín',
      lat: -0.1762,
      lng: -78.4809,
      capacidad: 30,
      libres: 12
    },
    {
      nombre: 'La Carolina',
      lat: -0.1912,
      lng: -78.4881,
      capacidad: 25,
      libres: 9
    }
  ];

  ngOnInit(): void {
    this.actualizarMapa();
    setInterval(() => {
      this.simularActualizacion();
      this.actualizarMapa();
    }, 5000);
  }

  simularActualizacion() {
    this.parqueaderos.forEach(p => {
      p.libres = Math.floor(Math.random() * (p.capacidad + 1));
    });
  }

  actualizarMapa() {
  this.layers = this.parqueaderos.map(p => {
    const color = p.libres > 0 ? 'green' : 'red';

    return marker([p.lat, p.lng], {
      icon: divIcon({
        className: '', // evita que Leaflet agregue clases por defecto
       html: `
          <div style="
            background-color: ${color};
            color: white;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: bold;
            box-shadow: 0 0 6px rgba(0,0,0,0.3);
            font-size: 14px;
            border: 2px solid white;
          ">
            🅿️<span style="margin-left: 2px;">${p.libres}</span>
          </div>
        `
      })
    }).bindPopup(`
      <b>${p.nombre}</b><br>
      Libres: ${p.libres} / ${p.capacidad}
    `);
  });
}

}
