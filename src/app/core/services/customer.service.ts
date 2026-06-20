import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = 'http://localhost:8000/api/v1/customers';

  constructor(private http: HttpClient) {}

  /**
     * Get paginated customers list with filters.
     */
  getCustomers(filters: {
    search?: string;
    type?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    per_page?: number;
  } = {}): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const val = (filters as any)[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val.toString());
      }
    });

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
     * Get single customer by ID (includes documents and drivers).
     */
  getCustomer(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
     * Create a new customer profile.
     */
  createCustomer(customer: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }

  /**
     * Update an existing customer profile.
     */
  updateCustomer(id: number, customer: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, customer);
  }

  /**
     * Delete a customer profile.
     */
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
