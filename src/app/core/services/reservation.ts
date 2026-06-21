import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ReservationModel {
  id?: number;
  reservation_no?: string;
  customer_id: number;
  assets: number[];
  pickup_datetime_utc: string;
  return_datetime_utc: string;
  status?: string;
  tenant_id?: number;
  customer?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://localhost:8000/api/v1/reservations';

  constructor(private http: HttpClient) {}

  getReservations(): Observable<ReservationModel[]> {
    return this.http.get<ReservationModel[]>(this.apiUrl);
  }

  getReservation(id: number): Observable<ReservationModel> {
    return this.http.get<ReservationModel>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservation: ReservationModel): Observable<ReservationModel> {
    return this.http.post<ReservationModel>(this.apiUrl, reservation);
  }

  updateReservation(id: number, reservation: ReservationModel): Observable<ReservationModel> {
    return this.http.put<ReservationModel>(`${this.apiUrl}/${id}`, reservation);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchReservations(query: string): Observable<ReservationModel[]> {
    const params = query ? `?search=${encodeURIComponent(query)}&per_page=10` : '?per_page=10';
    return this.http.get<any>(`${this.apiUrl}${params}`).pipe(
      map(res => {
        if (res?.data?.data) return res.data.data;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }
}
