export interface CreateCheckoutPayload {
  productId: number;
  quantity: number;
  name: string;
  email: string;
  whatsapp: string;
}

export interface CheckoutCustomer {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
}

export interface CheckoutOrderItem {
  id: number;
  productId: number;
  productTitle: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface CheckoutOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  subtotal: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  status: string;
  customer: CheckoutCustomer;
  items: CheckoutOrderItem[];
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: CheckoutOrder;
}
