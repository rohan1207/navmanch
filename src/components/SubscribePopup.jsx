'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';
import { setSubscription, isSubscribed, checkSubscriberExists } from '../utils/subscription';

const SubscribePopup = ({ isOpen, onClose, allowClose = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);

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

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', email: '', phone: '' });
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen]);

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

  const handleChange = async (e) => {
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

    // Check if user exists when email or phone is filled
    if ((name === 'email' || name === 'phone') && value.trim().length > 0) {
      const email = name === 'email' ? value.trim() : formData.email.trim();
      const phone = name === 'phone' ? value.replace(/\s/g, '') : formData.phone.replace(/\s/g, '');
      
      if (email || phone) {
        setCheckingUser(true);
        try {
          const existing = await checkSubscriberExists(email, phone);
          if (existing) {
            setIsExistingUser(true);
            setFormData(prev => ({
              ...prev,
              name: existing.name || prev.name
            }));
          } else {
            setIsExistingUser(false);
          }
        } catch (error) {
          console.error('Error checking user:', error);
        } finally {
          setCheckingUser(false);
        }
      }
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
        throw new Error(data.message || 'Subscription failed');
      }

      // Store subscription in localStorage
      setSubscription({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\s/g, '')
      });

      setIsSuccess(true);
      
      // Close popup after 2 seconds
      setTimeout(() => {
        onClose();
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
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-newsRed/10 rounded-full mb-4">
                  <FaEnvelope className="w-8 h-8 text-newsRed" />
                </div>
                <h2 className="text-2xl font-bold text-deepCharcoal mb-2">
                  {isExistingUser ? 'पुन्हा भेट दिल्याबद्दल धन्यवाद!' : 'सबस्क्रिप्शन करा'}
                </h2>
                <p className="text-sm text-slateBody">
                  {isExistingUser 
                    ? 'आपण आधीच सबस्क्राईब केले आहे. कृपया तपशील पुष्टी करा.'
                    : 'नवीन बातम्या आणि अपडेट्स मिळवण्यासाठी सबस्क्राईब करा'}
                </p>
                {checkingUser && (
                  <p className="text-xs text-metaGray mt-2">तपासत आहे...</p>
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

