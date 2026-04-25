'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cookiesInput, setCookiesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const plans = [
    {
      id: 'plus-personal',
      name: 'Plus Personal',
      price: '$20/month',
      features: ['GPT-4 access', 'Faster response', 'Priority access']
    },
    {
      id: 'business',
      name: 'Business',
      price: '$25/user/month',
      features: ['Everything in Plus', 'Team workspace', 'Admin controls']
    }
  ];

  const countries = [
    { code: 'KR', name: 'South Korea', currency: 'KRW', flag: '🇰🇷', promo: '🎁 Free Trial' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', flag: '🇮🇩' },
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'TH', name: 'Thailand', currency: 'THB', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', currency: 'VND', flag: '🇻🇳' },
    { code: 'PH', name: 'Philippines', currency: 'PHP', flag: '🇵🇭' }
  ];

  const paymentMethods = [
    { id: 'direct', name: 'Direct Checkout', icon: '💳' },
    { id: 'stripe', name: 'Stripe', icon: '🔷' }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setError('');
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    setError('');
  };

  const handlePaymentSelect = (methodId) => {
    setPaymentMethod(methodId);
    setError('');
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedPlan) {
      setError('Please select a plan');
      return;
    }
    if (step === 2 && !selectedCountry) {
      setError('Please select a country');
      return;
    }
    if (step === 3 && !paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCheckoutUrl('');

    try {
      const cookies = JSON.parse(cookiesInput);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: selectedPlan,
          country: selectedCountry,
          paymentMethod,
          cookies
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to generate checkout session');
      }

      const data = await response.json();
      console.log('Checkout response:', data);

      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        console.log('Opening checkout URL:', data.checkoutUrl);
        window.open(data.checkoutUrl, '_blank');
      } else {
        setError('Invalid checkout session response');
      }
    } catch (err) {
      setError(err.message || 'Invalid cookies format');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>ChatGPT Checkout Generator</h1>
        <p className={styles.subtitle}>Generate checkout link in 5 easy steps</p>

        <div className={styles.stepper}>
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className={`${styles.stepIndicator} ${step >= num ? styles.active : ''}`}>
              {num}
            </div>
          ))}
        </div>

        <div className={styles.form}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2>Step 1: Select Plan</h2>
              <div className={styles.planGrid}>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${selectedPlan === plan.id ? styles.selected : ''}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <h3>{plan.name}</h3>
                    <p className={styles.price}>{plan.price}</p>
                    <ul className={styles.features}>
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h2>Step 2: Select Country/Region</h2>
              <div className={styles.vpnWarning}>
                ⚠️ <strong>Important:</strong> If selecting Korea for free trial, make sure you're connected to a Korean VPN first!
              </div>
              <div className={styles.countryGrid}>
                {countries.map((country) => (
                  <div
                    key={country.code}
                    className={`${styles.countryCard} ${selectedCountry === country.code ? styles.selected : ''} ${country.promo ? styles.promo : ''}`}
                    onClick={() => handleCountrySelect(country.code)}
                  >
                    <span className={styles.flag}>{country.flag}</span>
                    <div className={styles.countryInfo}>
                      <strong>{country.name}</strong>
                      <span className={styles.currency}>{country.currency}</span>
                      {country.promo && <span className={styles.promoTag}>{country.promo}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2>Step 3: Select Payment Method</h2>
              <div className={styles.paymentGrid}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`${styles.paymentCard} ${paymentMethod === method.id ? styles.selected : ''}`}
                    onClick={() => handlePaymentSelect(method.id)}
                  >
                    <span className={styles.icon}>{method.icon}</span>
                    <span>{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepContent}>
              <h2>Step 4: Paste Session Cookies</h2>
              <div className={styles.formGroup}>
                <label>Cookies JSON:</label>
                <p className={styles.hint}>
                  Paste your ChatGPT session cookies. You need at least <code>accessToken</code> and <code>sessionToken</code>.
                </p>
                <textarea
                  value={cookiesInput}
                  onChange={(e) => setCookiesInput(e.target.value)}
                  placeholder='{"accessToken":"eyJhbGci...","sessionToken":"abc123...","user":{"id":"user-xxx","email":"..."}}'
                  rows={12}
                  required
                  className={styles.cookiesInput}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles.stepContent}>
              <h2>Step 5: Generate & Redirect</h2>
              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <strong>Plan:</strong> {plans.find(p => p.id === selectedPlan)?.name}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Country:</strong> {countries.find(c => c.code === selectedCountry)?.name}
                  {countries.find(c => c.code === selectedCountry)?.promo &&
                    <span className={styles.promoTag}> {countries.find(c => c.code === selectedCountry)?.promo}</span>
                  }
                </div>
                <div className={styles.summaryItem}>
                  <strong>Payment:</strong> {paymentMethods.find(m => m.id === paymentMethod)?.name}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Cookies:</strong> {cookiesInput ? '✓ Provided' : '✗ Missing'}
                </div>
              </div>

              {checkoutUrl && (
                <div className={styles.success}>
                  <p>Checkout link generated successfully!</p>
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    {checkoutUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.buttonGroup}>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className={styles.backBtn}
                disabled={loading}
              >
                Back
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className={styles.nextBtn}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className={styles.submitBtn}
                disabled={loading || !cookiesInput}
              >
                {loading ? 'Generating...' : 'Generate & Open Link'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
