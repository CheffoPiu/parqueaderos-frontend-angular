import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-clientes-segmentados',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './clientes-segmentados.component.html',
  styleUrl: './clientes-segmentados.component.scss'
})
export class ClientesSegmentadosComponent implements OnInit {
  displayedColumns: string[] = ['#', 'clienteId', 'nombre', 'email', 'frecuencia', 'recencia', 'monto_total', 'probabilidad'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.obtenerClientesProbables().subscribe(clientes => {
      this.dataSource = new MatTableDataSource(clientes);
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

