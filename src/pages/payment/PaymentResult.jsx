import React, { useEffect } from 'react';
import Navbar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import Button from '../../components/ui/Button';
import { usePurchase } from '../../context/PurchaseContext';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

export default function PaymentResult({ status, courseId, onNavigate, userSession }) {
  const isSuccess = status === 'success';
  const { purchaseCourse } = usePurchase();

  useEffect(() => {
    if (isSuccess && courseId) {
      purchaseCourse(courseId);
    }
  }, [isSuccess, courseId, purchaseCourse]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-charcoal flex flex-col font-sans">
      <Navbar userSession={userSession} onViewChange={onNavigate} />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 pt-32">
        <div className="w-full max-w-md mb-4 text-left">
          <Breadcrumbs 
            paths={[
              { label: 'Home', view: 'home' },
              { label: 'Courses', view: 'courses' },
              { label: 'Payment Result' }
            ]} 
            onNavigate={onNavigate} 
          />
        </div>
        <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-8 shadow-xl text-center relative overflow-hidden">
          
          {/* Header Graphic */}
          <div className="mb-6 flex justify-center">
            {isSuccess ? (
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center border-4 border-red-50">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          <h1 className={`text-3xl font-black tracking-tight mb-2 ${isSuccess ? 'text-primary' : 'text-red-600'}`}>
            {isSuccess ? 'Enrollment Successful!' : 'Payment Failed'}
          </h1>
          
          <p className="text-blue-gray text-sm leading-relaxed mb-8">
            {isSuccess 
              ? 'Your payment was securely processed. You now have full 12-month access to the premium curriculum and live webinars.' 
              : 'Unfortunately, your transaction could not be processed at this time. Please check your payment details and try again.'}
          </p>

          {isSuccess && (
            <div className="bg-soft-gray border border-slate-200 rounded-xl p-4 mb-8 text-left space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="text-primary">TXN-{Math.floor(Math.random() * 100000000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-primary">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="text-primary">$449.00</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {isSuccess ? (
              <>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => onNavigate('dashboard')}
                  className="w-full uppercase tracking-widest text-xs font-black shadow-lg shadow-accent/20"
                >
                  Go To Dashboard →
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => onNavigate('course-detail', courseId)}
                  className="w-full uppercase tracking-widest text-xs font-black"
                >
                  View Course Content
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => onNavigate('secure-payment', courseId)}
                  className="w-full uppercase tracking-widest text-xs font-black shadow-lg shadow-primary/20 bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                >
                  Retry Payment
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => onNavigate('course-detail', courseId)}
                  className="w-full uppercase tracking-widest text-xs font-black"
                >
                  Back To Course
                </Button>
              </>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
