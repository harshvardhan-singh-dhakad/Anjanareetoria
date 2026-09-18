declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

export type LakshmiFunnelEvent =
  | 'Page View'
  | 'Booklet Click'
  | 'Book Click'
  | 'Combo Click'
  | 'Payment Started'
  | 'Payment Successful';

export function trackLakshmiEvent(event: LakshmiFunnelEvent, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    // 1. Dispatch to Meta Pixel (fbq)
    if (typeof window.fbq === 'function') {
      switch (event) {
        case 'Page View':
          window.fbq('track', 'PageView');
          window.fbq('trackCustom', 'Lakshmi_PageView', params);
          break;
        case 'Booklet Click':
          window.fbq('track', 'ViewContent', { content_name: '75 Days Lakshmi Digital Guide', value: 500, currency: 'INR', ...params });
          break;
        case 'Book Click':
          window.fbq('track', 'ViewContent', { content_name: 'Main Lakshmi Hoon Book', value: 1250, currency: 'INR', ...params });
          break;
        case 'Combo Click':
          window.fbq('track', 'ViewContent', { content_name: 'The Complete Lakshmi Journey Combo', value: 1750, currency: 'INR', ...params });
          break;
        case 'Payment Started':
          window.fbq('track', 'InitiateCheckout', {
            value: params?.amount || 500,
            currency: 'INR',
            content_name: params?.itemTitle || 'Lakshmi Journey',
            ...params,
          });
          break;
        case 'Payment Successful':
          window.fbq('track', 'Purchase', {
            value: params?.amount || 500,
            currency: 'INR',
            content_name: params?.itemTitle || 'Lakshmi Journey',
            ...params,
          });
          break;
      }
    }

    // 2. Dispatch to Google Analytics (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', event.replace(/\s+/g, '_').toLowerCase(), {
        event_category: 'Lakshmi_Journey',
        ...params,
      });
    }

    // 3. Browser Console Dev log in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Event Tracked] ${event}:`, params);
    }
  } catch (err) {
    console.warn('[Tracking] Warning dispatching event:', err);
  }
}
