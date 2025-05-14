// interfaces/user.model.ts
export interface RegisterUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gradLevel: string;
    entollmentDate: string; // ISO 8601 string
  }
  