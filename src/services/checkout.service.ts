import api from "./api";

export interface CreateCheckoutPayload {
  name: string;
  email: string;
  whatsapp?: string;
  productId: number;
  quantity: number;
}

export interface CheckoutOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  subtotal: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  status: string;
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
