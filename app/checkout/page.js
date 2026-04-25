'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const clientSecret = searchParams.get('client_secret');
    const publishableKey = searchParams.get('publishable_key');

    if (!clientSecret || !publishableKey) {
      setError('Missing checkout parameters');
      setLoading(false);
      return;
    }

    const loadStripe = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;

        script.onload = () => {
          const stripe = window.Stripe(publishableKey);

          const options = {
            clientSecret: clientSecret,
          };

          const checkout = stripe.initEmbeddedCheckout(options);

          checkout.then((checkoutInstance) => {
            checkoutInstance.mount('#checkout');
            setLoading(false);
          }).catch((err) => {
            setError('Failed to load checkout: ' + err.message);
            setLoading(false);
          });
        };

        script.onerror = () => {
          setError('Failed to load Stripe');
          setLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Error initializing checkout: ' + err.message);
        setLoading(false);
      }
    };

    loadStripe();
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading checkout...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}

        <div id="checkout"></div>
      </main>
    </div>
  );
}
