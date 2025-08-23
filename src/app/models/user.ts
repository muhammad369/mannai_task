
export interface User{
    id?: number;
    firstName: string;
    lastName: string;
    age?: number;
    gender?: string;
    email?: string;
    phone?: string;
}


export interface UserPagedResponse{
    users: User[];
    total: number;
    skip: number;
    limit: number;
}
