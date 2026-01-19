'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';
import { setSubscription, isSubscribedSync, isSubscribed, checkSubscriberExists, getSubscriberName } from '../utils/subscription';

const SubscribePopup = ({ isOpen, onClose, allowClose = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  // Use refs to track initialization and prevent unnecessary resets
  const hasInitializedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const isCheckingSubscriptionRef = useRef(false);

  // Update onClose ref when it changes
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Prevent body scroll when popup is open
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

  // Check if already subscribed when popup opens - only run once when popup opens
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      isCheckingSubscriptionRef.current = true;
      
      // First check localStorage (fast, synchronous)
      const subscribedLocal = isSubscribedSync();
      
      if (subscribedLocal) {
        // User is already subscribed locally - show welcome back and auto-close
        // Set popup shown flag so popup won't show again
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('navmanch_popup_shown', 'true');
        }
        
        setShowWelcomeBack(true);
        const subscriberName = getSubscriberName();
        setFormData({
          name: subscriberName || '',
          email: '',
          phone: ''
        });
        
        // Auto-close after 2 seconds
        const timer = setTimeout(() => {
          setShowWelcomeBack(false);
          onCloseRef.current();
          isCheckingSubscriptionRef.current = false;
        }, 2000);
        
        return () => {
          clearTimeout(timer);
          isCheckingSubscriptionRef.current = false;
        };
      } else {
        // Initialize form as empty for new subscription (only if form is truly empty)
        // Don't reset if user has already started typing
        const currentFormHasData = formData.name || formData.email || formData.phone;
        if (!currentFormHasData) {
          setFormData({ name: '', email: '', phone: '' });
        }
        setShowWelcomeBack(false);
        setErrors({});
        setIsSuccess(false);
        isCheckingSubscriptionRef.current = false;
        
        // Check if we can get email/phone from localStorage to check backend
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem('navmanch_subscription');
        if (stored) {
          try {
            const sub = JSON.parse(stored);
            if (sub.email || sub.phone) {
                  // Check backend with stored email/phone (async, won't interfere with form)
              isSubscribed(sub.email, sub.phone).then(subscribed => {
                if (subscribed) {
                      // Set popup shown flag so popup won't show again
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('navmanch_popup_shown', 'true');
                      }
                      
                  setShowWelcomeBack(true);
                  const subscriberName = getSubscriberName();
                      // Only update form if user hasn't started typing
                      if (!formData.name && !formData.email && !formData.phone) {
                        setFormData({
                          name: subscriberName || '',
                          email: '',
                          phone: ''
                        });
                      }
                  setTimeout(() => {
                    setShowWelcomeBack(false);
                        onCloseRef.current();
                  }, 2000);
                }
              }).catch(() => {
                // Ignore errors, continue with form
              });
            }
          } catch (e) {
                // Ignore JSON parse errors
          }
        }
          }
        } catch (storageError) {
          // Some browsers (e.g. Safari private mode) may block localStorage access
          // Safely ignore and continue with empty form
        }
      }
    } else if (!isOpen) {
      // Reset when popup closes - only reset if form wasn't successfully submitted
      if (!isSuccess) {
        setFormData({ name: '', email: '', phone: '' });
      }
      setErrors({});
      setIsSuccess(false);
      setShowWelcomeBack(false);
      hasInitializedRef.current = false;
      isCheckingSubscriptionRef.current = false;
    }
  }, [isOpen, isSuccess]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'नाव आवश्यक आहे';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'ईमेल आवश्यक आहे';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'वैध ईमेल पत्ता प्रविष्ट करा';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'मोबाइल नंबर आवश्यक आहे';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'वैध 10 अंकी मोबाइल नंबर प्रविष्ट करा';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      const response = await fetch(`${API_BASE}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\s/g, '')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if user is already subscribed (409 conflict)
        if (response.status === 409 || data.message?.toLowerCase().includes('already subscribed')) {
          // User already exists - just show welcome back and close
          const existingSubscriber = await checkSubscriberExists(formData.email.trim(), formData.phone.replace(/\s/g, ''));
          if (existingSubscriber) {
            // Store subscription in localStorage
            setSubscription({
              name: existingSubscriber.name || formData.name.trim(),
              email: existingSubscriber.email || formData.email.trim(),
              phone: existingSubscriber.phone || formData.phone.replace(/\s/g, '')
            });
            
            // Set popup shown flag so user won't see popup again
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('navmanch_popup_shown', 'true');
            }
            
            setShowWelcomeBack(true);
            setFormData(prev => ({
              ...prev,
              name: existingSubscriber.name || prev.name
            }));
            setIsSubmitting(false);
            // Auto-close after 2 seconds
            setTimeout(() => {
              setShowWelcomeBack(false);
              onCloseRef.current();
            }, 2000);
            return;
          }
        }
        throw new Error(data.message || 'Subscription failed');
      }

      // Store subscription in localStorage
      setSubscription({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\s/g, '')
      });

      // Set popup shown flag so user won't see popup again
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('navmanch_popup_shown', 'true');
      }

      setIsSuccess(true);
      
      // Close popup after 2 seconds
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={allowClose ? onClose : undefined}
        style={{ cursor: allowClose ? 'pointer' : 'default' }}
      />

      {/* Popup */}
      <div className="relative bg-cleanWhite rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Close Button - Only show if allowClose is true */}
        {allowClose && (
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-10 h-10 bg-newsRed text-cleanWhite rounded-full flex items-center justify-center hover:bg-newsRed/90 transition-all duration-300 shadow-lg hover:scale-110 z-10"
            aria-label="बंद करा"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div className="p-8">
          {showWelcomeBack ? (
            /* Welcome Back Message */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-deepCharcoal mb-2">
                पुन्हा भेट दिल्याबद्दल धन्यवाद!
              </h3>
              <p className="text-slateBody">
                {formData.name ? `नमस्कार ${formData.name}!` : 'नमस्कार!'} आपण आधीच सबस्क्राईब केले आहे.
              </p>
            </div>
          ) : !isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-newsRed/10 rounded-full mb-4">
                  <FaEnvelope className="w-8 h-8 text-newsRed" />
                </div>
                <h2 className="text-2xl font-bold text-deepCharcoal mb-2">
                  सबस्क्रिप्शन करा
                </h2>
                <p className="text-sm text-slateBody">
                  नवीन बातम्या आणि अपडेट्स मिळवण्यासाठी सबस्क्राईब करा
                </p>
                {errors.submit && (
                  <p className="text-xs text-red-500 text-center mt-2">{errors.submit}</p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-deepCharcoal mb-2">
                    <FaUser className="inline w-3.5 h-3.5 mr-2 text-newsRed" />
                    नाव
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="आपले नाव प्रविष्ट करा"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-newsRed/20 transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-subtleGray focus:border-newsRed bg-cleanWhite'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-deepCharcoal mb-2">
                    <FaEnvelope className="inline w-3.5 h-3.5 mr-2 text-newsRed" />
                    ईमेल
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="आपला ईमेल पत्ता प्रविष्ट करा"
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

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-deepCharcoal mb-2">
                    <FaPhone className="inline w-3.5 h-3.5 mr-2 text-newsRed" />
                    मोबाइल नंबर
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="आपला मोबाइल नंबर प्रविष्ट करा"
                    maxLength="10"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-newsRed/20 transition-all duration-300 ${
                      errors.phone 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-subtleGray focus:border-newsRed bg-cleanWhite'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-newsRed text-cleanWhite py-3.5 rounded-lg font-semibold text-base tracking-wide hover:bg-newsRed/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'सबमिट करत आहे...' : 'सबस्क्राईब करा'}
                </button>
                {errors.submit && (
                  <p className="mt-2 text-xs text-red-500 text-center">{errors.submit}</p>
                )}
              </form>
            </>
          ) : (
            /* Success Message */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-deepCharcoal mb-2">
                धन्यवाद!
              </h3>
              <p className="text-slateBody">
                आपले सबस्क्रिप्शन यशस्वीरित्या पूर्ण झाले आहे
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribePopup;

