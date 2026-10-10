import api from "./api";

export interface CreateSnapPaymentResponse {
  success: boolean;
  message: string;
  data: {
    orderNumber: string;
    paymentId: number;
    snapToken: string;
    redirectUrl?: string | null;
  };
}

export interface OrderStatusResponse {
  success: boolean;
  message: string;
  data: {
    orderNumber: string;
    status: string;
    totalAmount: number;

    customer: {
      name: string;
      email: string;
      whatsapp?: string | null;
    };

    items: Array<{
      productId: number;
      productTitle: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }>;
  };
}

export const paymentService = {
  /**
   * Membuat Snap Payment
   */
  async createSnapPayment(orderNumber: string) {
    const response = await api.post<CreateSnapPaymentResponse>(
      `/payments/${orderNumber}/snap`,
    );

    return response.data.data;
  },

  /**
   * Mengambil status order terbaru
   */
  async getOrderStatus(orderNumber: string) {
    const response = await api.get<OrderStatusResponse>(
      `/payments/orders/${orderNumber}`,
    );

    return response.data.data;
  },
};
