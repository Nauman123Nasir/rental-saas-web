import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RentalModel {
  id?: number;
  rental_no?: string;
  reservation_id: number;
  customer_id: number;
  asset_id: number;
  pickup_datetime_utc: string;
  expected_return_datetime_utc: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RentalService {
  private apiUrl = 'http://localhost:8000/api/v1/rentals';

  constructor(private http: HttpClient) {}

  getRentals(): Observable<RentalModel[]> {
    return this.http.get<RentalModel[]>(this.apiUrl);
  }

  getRental(id: number): Observable<RentalModel> {
    return this.http.get<RentalModel>(`${this.apiUrl}/${id}`);
  }

  checkout(data: any): Observable<RentalModel> {
    return this.http.post<RentalModel>(`${this.apiUrl}/checkout`, data);
  }

  checkin(id: number, data: any): Observable<RentalModel> {
    return this.http.post<RentalModel>(`${this.apiUrl}/${id}/checkin`, data);
  }
}
