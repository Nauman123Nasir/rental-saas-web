import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersUrl = 'http://localhost:8000/api/v1/users';
  private readonly rolesUrl = 'http://localhost:8000/api/v1/roles';
  private readonly permissionsUrl = 'http://localhost:8000/api/v1/permissions';

  constructor(private http: HttpClient) {}

  getUsers(filters: {
    search?: string;
    status?: string;
    role_id?: number | string;
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
    return this.http.get<any>(this.usersUrl, { params });
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/${id}`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(this.usersUrl, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.usersUrl}/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.usersUrl}/${id}`);
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(this.rolesUrl);
  }

  getRole(id: number): Observable<any> {
    return this.http.get<any>(`${this.rolesUrl}/${id}`);
  }

  createRole(data: any): Observable<any> {
    return this.http.post<any>(this.rolesUrl, data);
  }

  updateRole(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.rolesUrl}/${id}`, data);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.rolesUrl}/${id}`);
  }

  getPermissions(): Observable<any> {
    return this.http.get<any>(this.permissionsUrl);
  }
}
