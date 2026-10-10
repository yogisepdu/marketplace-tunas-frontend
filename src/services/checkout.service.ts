import api from "./api";

export interface CreateCheckoutItem {
  productId: number;
  quantity: number;
}

export interface CreateCheckoutPayload {
  name: string;
  email: string;
  whatsapp?: string;
  items: CreateCheckoutItem[];
}

export interface CheckoutOrderItem {
  id: number;
  productId: number;
  productTitle: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface CheckoutCustomer {
  id?: number;
  name: string;
  email: string;
  whatsapp?: string | null;
}

export interface CheckoutOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  subtotal: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  status: string;
  checkoutToken?: string;
  customer?: CheckoutCustomer;
  items: CheckoutOrderItem[];
}

interface CreateCheckoutResponse {
  success: boolean;
  message: string;
  data: CheckoutOrder;
}

export const checkoutService = {
  async create(payload: CreateCheckoutPayload): Promise<CheckoutOrder> {
    const response = await api.post<CreateCheckoutResponse>(
      "/checkout",
      payload,
    );

    return response.data.data;
  },
};
