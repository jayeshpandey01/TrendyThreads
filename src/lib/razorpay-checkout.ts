/**
 * Dynamically loads the Razorpay checkout script and opens the payment modal.
 * Works for both token purchases and shop orders.
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export type RazorpayCheckoutOptions = {
  /** Razorpay order ID from the backend */
  rzpOrderId: string;
  /** Amount in paisa (e.g. ₹500 = 50000) */
  amount: number;
  /** Currency code */
  currency: string;
  /** Name to display on checkout */
  name?: string;
  /** Description to display */
  description?: string;
  /** Pre-fill email */
  email?: string;
  /** Pre-fill name */
  prefillName?: string;
  /** Called when payment succeeds */
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  /** Called when payment modal is closed/dismissed */
  onDismiss?: () => void;
};

export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions) {
  await loadRazorpayScript();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: opts.amount,
    currency: opts.currency || "INR",
    name: opts.name || "Trendy Threads",
    description: opts.description || "Payment",
    order_id: opts.rzpOrderId,
    prefill: {
      email: opts.email || "",
      name: opts.prefillName || "",
    },
    theme: {
      color: "#a3fb2e",
    },
    handler: function (response: any) {
      opts.onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        opts.onDismiss?.();
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
