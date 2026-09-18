declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[Razorpay] Failed to load checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface PaymentPayload {
  type: 'product' | 'book' | 'webinar';
  itemId?: string;
  format?: 'ebook' | 'physical';
  quantity?: number;
  items?: Array<{ productId?: string; id?: string; name?: string; price: number; quantity: number }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  shippingAddress?: string;
  notes?: string;
  onOrderCreated?: (orderData: {
    orderId: string;
    amount: number;
    amountInInr: number;
    paymentLink?: string;
    qrCodeUrl?: string;
    itemTitle?: string;
  }) => void;
  onSuccess: (result: {
    orderId: string;
    paymentId: string;
    readerUrl?: string;
    downloadUrl?: string;
    webinarDetails?: any;
    message?: string;
  }) => void;
  onError: (errorMsg: string) => void;
  onDismiss?: () => void;
}

export async function initiateRazorpayPayment(payload: PaymentPayload): Promise<void> {
  try {
    // 1. Create order on backend (dynamically validates MySQL price)
    const createRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: payload.type,
        itemId: payload.itemId,
        format: payload.format,
        quantity: payload.quantity,
        items: payload.items,
        customer: payload.customer,
      }),
    });

    const orderData = await createRes.json();
    if (!createRes.ok || !orderData.success) {
      // If it's a complimentary / free webinar
      if (orderData.isFree) {
        payload.onSuccess({
          orderId: 'FREE-RSVP',
          paymentId: 'COMPLIMENTARY',
          message: orderData.message || 'RSVP successfully confirmed.',
        });
        return;
      }
      throw new Error(orderData.error || 'Failed to initiate payment.');
    }

    if (payload.onOrderCreated) {
      payload.onOrderCreated({
        orderId: orderData.orderId,
        amount: orderData.amount,
        amountInInr: orderData.amountInInr,
        paymentLink: orderData.paymentLink,
        qrCodeUrl: orderData.qrCodeUrl,
        itemTitle: orderData.itemTitle,
      });
    }

    // 2. Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Unable to initialize Razorpay checkout. Please check your network connection.');
    }

    // 3. Open Razorpay modal
    const key = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TbuYX4YgUTCsbk';
    const cleanPhone = payload.customer.phone.replace(/\D/g, '').slice(-10);

    const options = {
      key,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'AR Blessings',
      description: orderData.description || 'Authentically Blessed Spiritual Purchase',
      image: '/images/logo.png',
      order_id: orderData.orderId,
      prefill: {
        name: payload.customer.name,
        contact: cleanPhone ? '+91' + cleanPhone : undefined,
        email: payload.customer.email || undefined,
      },
      theme: {
        color: '#0008c1',
      },
      modal: {
        ondismiss: () => {
          if (payload.onDismiss) payload.onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 4. Verify payment signature on backend & save order
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: payload.type,
              itemId: payload.itemId,
              format: payload.format,
              amount: orderData.amountInInr,
              itemTitle: orderData.itemTitle,
              customer: payload.customer,
              items: payload.items,
              shippingAddress: payload.shippingAddress,
              notes: payload.notes,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Payment verification failed.');
          }

          payload.onSuccess(verifyData);
        } catch (vErr: any) {
          console.error('[Razorpay Handler Error]:', vErr);
          payload.onError(vErr.message || 'Payment received but verification encountered an issue. Please contact support.');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err: any) {
    console.error('[initiateRazorpayPayment Error]:', err);
    payload.onError(err.message || 'Failed to start payment.');
  }
}
