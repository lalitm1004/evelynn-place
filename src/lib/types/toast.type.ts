export interface IToast {
    id?: string;
    message: string;
    timeout?: number;
    type?: 'default' | 'success' | 'warning' | 'danger';
}