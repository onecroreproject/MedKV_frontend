import React, { useState } from 'react';
import Navbar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import Button from '../../components/ui/Button';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

export default function SecurePayment({ userSession, courseId, onNavigate }) {
  const [selectedMethod, setSelectedMethod] = useState('card');

  const finalAmount = 449.00; // Mock amount

  const handlePay = () => {
    onNavigate('payment-processing', courseId);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-charcoal flex flex-col font-sans selection:bg-accent selection:text-white">
      <Navbar userSession={userSession} onViewChange={onNavigate} />

      <main className="flex-grow pt-32 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Breadcrumbs 
            paths={[
              { label: 'Home', view: 'home' },
              { label: 'Courses', view: 'courses' },
              { label: 'Course Name', view: 'course-detail', param: courseId },
              { label: 'Secure Payment' }
            ]} 
            onNavigate={onNavigate} 
          />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tight">Secure Payment</h1>
              <p className="text-blue-gray mt-2">Complete your transaction via our encrypted gateway.</p>
            </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Payable</span>
            <div className="text-3xl font-black text-primary">${finalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-6">Select Payment Method</h2>
              
              <div className="space-y-4">
                {/* Method 1: Card */}
                <label className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent/50 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                        {selectedMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>}
                      </div>
                      <span className="font-bold text-primary">Credit / Debit Card</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xl">💳</span>
                    </div>
                  </div>
                  
                  {selectedMethod === 'card' && (
                    <div className="mt-6 space-y-4">
                      <input type="text" placeholder="Card Number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none" />
                        <input type="text" placeholder="CVV" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none" />
                      </div>
                      <input type="text" placeholder="Cardholder Name" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                  )}
                </label>

                {/* Method 2: UPI */}
                <label className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent/50 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                        {selectedMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>}
                      </div>
                      <span className="font-bold text-primary">UPI / Net Banking</span>
                    </div>
                    <span className="text-xl">🏦</span>
                  </div>
                  {selectedMethod === 'upi' && (
                    <div className="mt-6 text-sm text-blue-gray text-center p-4 bg-white rounded-xl border border-slate-100">
                      You will be redirected to the secure banking gateway to complete the transaction.
                    </div>
                  )}
                </label>

              </div>
            </div>
          </div>

          {/* Order Summary & Pay */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0B1F4D] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.08)_0%,transparent_70%)] pointer-events-none" />
              
              <h3 className="font-bold text-lg mb-6 relative z-10 border-b border-white/10 pb-4">Order Summary</h3>
              
              <div className="space-y-4 text-sm relative z-10 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-300">Amount</span>
                  <span className="font-bold">${499.00.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Discount</span>
                  <span className="font-bold text-accent">-${50.00.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Taxes</span>
                  <span className="font-bold">$0.00</span>
                </div>
              </div>

              <Button 
                variant="secondary" 
                size="lg" 
                onClick={handlePay}
                className="w-full py-4 uppercase tracking-widest text-xs font-black shadow-lg shadow-accent/20 relative z-10 hover:scale-105 transition-transform"
              >
                Pay ${finalAmount.toFixed(2)} Securely
              </Button>

              <p className="text-center text-[10px] text-slate-400 font-medium relative z-10 pt-6 flex items-center justify-center gap-2">
                <span>🔒</span> 256-bit SSL Encrypted Payment
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => onNavigate('enrollment-review', courseId)}
              className="w-full text-xs font-bold uppercase tracking-widest py-3"
            >
              Cancel Payment
            </Button>
          </div>

        </div>
      </div>
      
      </main>

      <Footer />
    </div>
  );
}
