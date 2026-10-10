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
   * ============================================================
   * CREATE SNAP PAYMENT
   * ============================================================
   */
  async createSnapPayment(orderNumber: string, checkoutToken: string) {
    const response = await api.post<CreateSnapPaymentResponse>(
      `/payments/${orderNumber}/snap`,
      undefined,
      {
        headers: {
          "X-Checkout-Token": checkoutToken,
        },
      },
    );

    return response.data.data;
  },

  /**
   * ============================================================
   * GET ORDER STATUS
   * ============================================================
   */
  async getOrderStatus(orderNumber: string, checkoutToken: string) {
    const response = await api.get<OrderStatusResponse>(
      `/payments/orders/${orderNumber}`,
      {
        headers: {
          "X-Checkout-Token": checkoutToken,
        },
      },
    );

    return response.data.data;
  },
};
