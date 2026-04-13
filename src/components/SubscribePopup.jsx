'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import {
  setSubscription,
  isSubscribedSync,
  isSubscribed,
  checkSubscriberExists,
  getSubscriberName,
  markPopupShown
} from '../utils/subscription';

const SubscribePopup = ({ isOpen, onClose, allowClose = false }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  const hasInitializedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      if (isSubscribedSync()) {
        markPopupShown();
        setShowWelcomeBack(true);
        const timer = setTimeout(() => {
          setShowWelcomeBack(false);
          onCloseRef.current();
        }, 2000);
        return () => clearTimeout(timer);
      }

      setShowWelcomeBack(false);
      setErrors({});
      setIsSuccess(false);

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('navmanch_subscription');
          if (stored) {
            const sub = JSON.parse(stored);
            if (sub.email) {
              isSubscribed(sub.email, sub.phone).then((subscribed) => {
                if (subscribed) {
                  markPopupShown();
                  setShowWelcomeBack(true);
                  setTimeout(() => {
                    setShowWelcomeBack(false);
                    onCloseRef.current();
                  }, 2000);
                }
              }).catch(() => {});
            }
          }
        }
      } catch {
        // ignore
      }
    } else if (!isOpen) {
      if (!isSuccess) {
        setEmail('');
      }
      setErrors({});
      setIsSuccess(false);
      setShowWelcomeBack(false);
      hasInitializedRef.current = false;
    }
  }, [isOpen, isSuccess]);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'ईमेल आवश्यक आहे';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'वैध ईमेल पत्ता प्रविष्ट करा';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const trimmed = email.trim();

      const response = await fetch(`${API_BASE}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: trimmed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.message?.toLowerCase().includes('already subscribed')) {
          const existingSubscriber = await checkSubscriberExists(trimmed, '');
          if (existingSubscriber) {
            setSubscription({
              name: existingSubscriber.name || trimmed.split('@')[0],
              email: existingSubscriber.email || trimmed,
              phone: existingSubscriber.phone
            });
            markPopupShown();
            setShowWelcomeBack(true);
            setIsSubmitting(false);
            setTimeout(() => {
              setShowWelcomeBack(false);
              onCloseRef.current();
            }, 2000);
            return;
          }
        }
        throw new Error(data.message || 'Subscription failed');
      }

      const sub = data.data;
      setSubscription({
        name: sub?.name || trimmed.split('@')[0],
        email: sub?.email || trimmed,
        phone: sub?.phone
      });

      setIsSuccess(true);

      setTimeout(() => {
        onCloseRef.current();
      }, 2000);
    } catch (error) {
      console.error('Subscription error:', error);
      setErrors({
        submit: error.message || 'सबस्क्रिप्शन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayWelcomeName = getSubscriberName();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={allowClose ? onClose : undefined}
        style={{ cursor: allowClose ? 'pointer' : 'default' }}
      />

      <div className="relative bg-cleanWhite rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {allowClose && (
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-10 h-10 bg-newsRed text-cleanWhite rounded-full flex items-center justify-center hover:bg-newsRed/90 transition-all duration-300 shadow-lg hover:scale-110 z-10"
            aria-label="बंद करा"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}

        <div className="p-8">
          {showWelcomeBack ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-deepCharcoal mb-2">
                पुन्हा भेट दिल्याबद्दल धन्यवाद!
              </h3>
              <p className="text-slateBody">
                {displayWelcomeName
                  ? `नमस्कार ${displayWelcomeName}!`
                  : 'नमस्कार!'}{' '}
                आपण आधीच सबस्क्राईब केले आहे.
              </p>
            </div>
          ) : !isSuccess ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-newsRed/10 rounded-full mb-4">
                  <FaEnvelope className="w-8 h-8 text-newsRed" />
                </div>
                <h2 className="text-2xl font-bold text-deepCharcoal mb-2">
                  सबस्क्रिप्शन करा
                </h2>
                <p className="text-sm text-slateBody">
                  नवीन बातम्या आणि अपडेट्स मिळवण्यासाठी आपला ईमेल टाका
                </p>
                {errors.submit && (
                  <p className="text-xs text-red-500 text-center mt-2">{errors.submit}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-deepCharcoal mb-2">
                    <FaEnvelope className="inline w-3.5 h-3.5 mr-2 text-newsRed" />
                    ईमेल
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="आपला ईमेल पत्ता प्रविष्ट करा"
                    autoComplete="email"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-newsRed/20 transition-all duration-300 ${
                      errors.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-subtleGray focus:border-newsRed bg-cleanWhite'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-newsRed text-cleanWhite py-3.5 rounded-lg font-semibold text-base tracking-wide hover:bg-newsRed/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'सबमिट करत आहे...' : 'सबस्क्राईब करा'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-deepCharcoal mb-2">
                आपले स्वागत आहे!
              </h3>
              <p className="text-slateBody">
                आपले सबस्क्रिप्शन यशस्वीरित्या पूर्ण झाले आहे.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribePopup;
