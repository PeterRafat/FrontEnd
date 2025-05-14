// auth-service.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { RegisterUser } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor(private httpClient: HttpClient) {}

  postRegister(user: RegisterUser): Observable<any> {
    return this.httpClient.post(`${environment.baseurl}/Auth/register`, user);
  }
}
