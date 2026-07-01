import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/userService';
import { enrollInCourse, createRazorpayOrder, verifyRazorpayPayment } from '../services/courseService';

const PurchaseContext = createContext();

export const usePurchase = () => useContext(PurchaseContext);

// Utility to load external scripts
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PurchaseProvider = ({ children }) => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load purchased courses from the backend on mount or login
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await getMe();
          if (res?.data?.enrolledCourses) {
            // Check if it's an array of objects or strings, handle both
            const courseIds = res.data.enrolledCourses.map(c => typeof c.course === 'object' ? c.course._id : c.course);
            setPurchasedCourses(courseIds.filter(id => id));
          }
        }
      } catch (error) {
        console.error("Failed to load purchased courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const purchaseCourse = async (courseId) => {
    return new Promise(async (resolve) => {
      if (!purchasedCourses.includes(courseId)) {
        try {
          const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
          if (!res) {
            alert('Razorpay SDK failed to load. Are you offline?');
            return resolve(false);
          }

          // 1. Create order on our backend
          const orderData = await createRazorpayOrder(courseId);
          if (!orderData.success) {
            alert('Failed to initialize payment.');
            return resolve(false);
          }

          const { amount, currency, orderId, keyId, courseName } = orderData.data;

          // 2. Open Razorpay Checkout
          const options = {
            key: keyId, 
            amount: amount.toString(),
            currency: currency,
            name: 'MedicalKV',
            description: `Enroll in ${courseName}`,
            image: '/apple-touch-icon.png', // Optional logo
            order_id: orderId,
            handler: async function (response) {
              // 3. Verify Payment Signature on backend
              const verificationData = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId: courseId
              };

              try {
                const verifyRes = await verifyRazorpayPayment(verificationData);
                if (verifyRes.success) {
                  // Payment successful and enrolled! Update local state.
                  setPurchasedCourses(prev => [...prev, courseId]);
                  resolve(true);
                } else {
                  alert('Payment verification failed.');
                  resolve(false);
                }
              } catch (err) {
                console.error('Verification error:', err);
                alert('Error verifying payment.');
                resolve(false);
              }
            },
            modal: {
              ondismiss: function() {
                resolve(false);
              }
            },
            prefill: {
              name: 'Student Name',
              email: 'student@example.com',
              contact: '9999999999'
            },
            theme: {
              color: '#C89B3C' // accent color
            }
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        } catch (error) {
          console.error("Payment initialization error:", error);
          alert('Error initializing payment. Try again later.');
          resolve(false);
        }
      } else {
        alert("You have already purchased this course.");
        resolve(true);
      }
    });
  };

  const hasPurchased = (courseId) => {
    return purchasedCourses.includes(courseId);
  };

  return (
    <PurchaseContext.Provider value={{ purchasedCourses, purchaseCourse, hasPurchased }}>
      {children}
    </PurchaseContext.Provider>
  );
};
