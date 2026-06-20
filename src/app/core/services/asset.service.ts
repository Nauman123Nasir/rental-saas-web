import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = 'http://localhost:8000/api/v1/assets';
  private categoriesUrl = 'http://localhost:8000/api/v1/asset-categories';

  constructor(private http: HttpClient) {}

  getAssets(filters: {
    search?: string;
    status?: string;
    category_id?: number;
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

  getAsset(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAsset(asset: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, asset);
  }

  updateAsset(id: number, asset: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, asset);
  }

  deleteAsset(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(this.categoriesUrl);
  }
}
