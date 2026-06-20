import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Models ──────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  id?: number;
  invoice_id?: number;
  description: string;
  line_type: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface InvoiceModel {
  id?: number;
  tenant_id?: number;
  rental_id?: number;
  customer_id?: number;
  invoice_no?: string;
  status?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  amount_paid?: number;
  balance_due?: number;
  currency_code?: string;
  issue_date?: string;
  due_date?: string;
  notes?: string;
  lines?: InvoiceLine[];
  payments?: PaymentModel[];
  customer?: any;
  rental?: any;
  created_at?: string;
}

export interface PaymentModel {
  id?: number;
  tenant_id?: number;
  invoice_id?: number;
  customer_id?: number;
  payment_no?: string;
  payment_method?: string;
  amount?: number;
  currency_code?: string;
  payment_datetime_utc?: string;
  reference_no?: string;
  notes?: string;
  receipt?: ReceiptModel;
  invoice?: InvoiceModel;
}

export interface ReceiptModel {
  id?: number;
  receipt_no?: string;
  amount?: number;
  currency_code?: string;
  issued_at?: string;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/finance';

  constructor(private http: HttpClient) {}

  // ── Invoices ────────────────────────────────────────────────────────────────

  getInvoices(filters: { status?: string; customer_id?: number; page?: number; per_page?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<any>(`${this.baseUrl}/invoices`, { params });
  }

  getInvoice(id: number): Observable<InvoiceModel> {
    return this.http.get<InvoiceModel>(`${this.baseUrl}/invoices/${id}`);
  }

  generateInvoice(data: { rental_id: number; issue_date?: string; due_date?: string; notes?: string }): Observable<InvoiceModel> {
    return this.http.post<InvoiceModel>(`${this.baseUrl}/invoices/generate`, data);
  }

  voidInvoice(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/invoices/${id}/void`, {});
  }

  // ── Payments ────────────────────────────────────────────────────────────────

  getPayments(filters: { invoice_id?: number; page?: number; per_page?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && String(val) !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<any>(`${this.baseUrl}/payments`, { params });
  }

  getPayment(id: number): Observable<PaymentModel> {
    return this.http.get<PaymentModel>(`${this.baseUrl}/payments/${id}`);
  }

  recordPayment(data: {
    invoice_id: number;
    amount: number;
    payment_method: string;
    payment_datetime_utc?: string;
    reference_no?: string;
    notes?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payments`, data);
  }
}
