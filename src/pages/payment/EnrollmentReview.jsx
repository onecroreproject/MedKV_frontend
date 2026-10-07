import React, { useState, useEffect } from 'react';
import Navbar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import Button from '../../components/ui/Button';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { usePurchase } from '../../context/PurchaseContext';
import { getCourseById } from '../../services/courseService';

export default function EnrollmentReview({ userSession, courseId, onNavigate }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { purchaseCourse, enrollFreeCourse } = usePurchase();
  const [isProcessing, setIsProcessing] = useState(false);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(courseId);
        if (res?.data) {
          let calculatedDiscount = 0;
          if (res.data.earlyBird?.enabled && (res.data.earlyBird.limit - (res.data.registrationCount || 0)) > 0) {
            if (res.data.earlyBird.price > 0) {
              calculatedDiscount = Math.max(0, (res.data.price || 0) - res.data.earlyBird.price);
            }
          }
            
          setCourse({
            title: res.data.title,
            faculty: res.data.instructor?.name || 'Dr. Sam Reefath',
            duration: 'Self-Paced',
            price: res.data.price || 0,
            discount: calculatedDiscount,
          });
        }
      } catch (err) {
        console.error('Failed to fetch course for enrollment review', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const basePrice = course ? course.price - course.discount : 0;

  // ── Invoice Calculations ────────────────────────────────────────────────────
  const courseFee      = basePrice;
  const gstOnCourse    = basePrice > 0 ? Math.round((courseFee * 0.18) * 100) / 100 : 0;
  const subTotal       = courseFee + gstOnCourse;
  const processingFee  = basePrice > 0 ? Math.round((subTotal * 0.02) * 100) / 100 : 0;
  const totalPayable   = Math.round((subTotal + processingFee) * 100) / 100;

  const handleProceed = async () => {
    if (acceptedTerms) {
      setIsProcessing(true);
      const success = totalPayable === 0 
        ? await enrollFreeCourse(courseId)
        : await purchaseCourse(courseId);
      setIsProcessing(false);
      if (success) {
        onNavigate('dashboard');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Navbar userSession={userSession} onViewChange={onNavigate} />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Navbar userSession={userSession} onViewChange={onNavigate} />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500 font-semibold">Could not load course details. Please go back and try again.</p>
          <button onClick={() => onNavigate('courses')} className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-charcoal flex flex-col font-sans selection:bg-accent selection:text-white">
      <Navbar userSession={userSession} onViewChange={onNavigate} />

      <main className="flex-grow pt-32 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Breadcrumbs 
            paths={[
              { label: 'Home', view: 'home' },
              { label: 'Courses', view: 'courses' },
              { label: course.title, view: 'course-detail', param: courseId },
              { label: 'Enrollment Review' }
            ]} 
            onNavigate={onNavigate} 
          />
          <h1 className="text-3xl font-black text-primary tracking-tight mt-4">Confirm Enrollment</h1>
          <p className="text-blue-gray mt-2">Review your details and the course information before proceeding to payment.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          
          {/* Student Info */}
          <div>
            <h2 className="text-xl font-bold text-primary mb-4 border-b border-slate-100 pb-2">Student Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Name</span>
                <span className="font-bold text-primary">{userSession?.name || 'Guest User'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Email</span>
                <span className="font-medium text-blue-gray">{userSession?.email || 'guest@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div>
            <h2 className="text-xl font-bold text-primary mb-4 border-b border-slate-100 pb-2">Course Information</h2>
            <div className="bg-soft-gray rounded-xl p-5 border border-slate-200">
              <h3 className="font-black text-primary text-lg">{course.title}</h3>
              <p className="text-sm font-medium text-blue-gray mt-1">Mentor: {course.faculty}</p>
              <div className="flex gap-4 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Duration: {course.duration}</span>
                <span>Access: 12 Months</span>
              </div>
            </div>
          </div>

          {/* Payment Summary / Invoice */}
          <div>
            <h2 className="text-xl font-bold text-primary mb-4 border-b border-slate-100 pb-2">Payment Invoice</h2>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm">

              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-[#030919] to-[#0B1F4D] px-5 py-3.5 flex justify-between items-center">
                <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Description</span>
                <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Amount</span>
              </div>

              <div className="divide-y divide-slate-100">

                {/* Course Fee (MRP) */}
                <div className="flex justify-between items-center px-5 py-3.5 bg-white">
                  <div>
                    <span className="font-semibold text-primary">Course Fee</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">(MRP)</span>
                  </div>
                  <span className="font-semibold text-primary">₹{(course?.price || 0).toFixed(2)}</span>
                </div>

                {/* Early Bird Discount — shown only if applicable */}
                {course?.discount > 0 && (
                  <div className="flex justify-between items-center px-5 py-3.5 bg-emerald-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">Early Bird</span>
                      <span className="font-semibold text-emerald-700">Discount Applied</span>
                    </div>
                    <span className="font-bold text-emerald-600">- ₹{(course.discount).toFixed(2)}</span>
                  </div>
                )}

                {/* Course Fee (After Discount) */}
                <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50">
                  <span className="font-semibold text-slate-700">
                    Course Fee {course?.discount > 0 ? 'After Discount' : ''}
                  </span>
                  <span className="font-bold text-slate-800">₹{basePrice.toFixed(2)}</span>
                </div>

                {/* GST 18% */}
                {basePrice > 0 && (
                  <div className="flex justify-between items-center px-5 py-3.5 bg-white">
                    <span className="text-slate-600 font-medium">GST @ 18%</span>
                    <span className="font-semibold text-slate-700">₹{gstOnCourse.toFixed(2)}</span>
                  </div>
                )}

                {/* Subtotal Separator */}
                {basePrice > 0 && (
                  <div className="flex justify-between items-center px-5 py-3 bg-slate-100">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">SUBTOTAL (COURSE + GST)</span>
                    <span className="font-bold text-slate-700">₹{subTotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Processing Fee (2%) */}
                {basePrice > 0 && (
                  <div className="flex justify-between items-center px-5 py-3.5 bg-white">
                    <span className="text-slate-600 font-medium">Payment Processing Fee (2%)</span>
                    <span className="font-semibold text-slate-700">₹{processingFee.toFixed(2)}</span>
                  </div>
                )}

              </div>

              {/* Grand Total */}
              <div className="bg-gradient-to-r from-[#030919] to-[#0B1F4D] px-5 py-4 flex justify-between items-center">
                <div>
                  <span className="text-white font-black text-base uppercase tracking-widest">Total Amount Payable</span>
                  {basePrice > 0 && (
                    <p className="text-slate-400 text-[10px] font-medium mt-0.5">Inclusive of GST & Processing Fee</p>
                  )}
                </div>
                <span className="text-accent font-black text-xl">₹{totalPayable.toFixed(2)}</span>
              </div>

            </div>

            {/* Invoice breakdown note */}
            {basePrice > 0 && (
              <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <span>
                  A 2% payment gateway processing fee is applied to the total amount.
                </span>
              </div>
            )}
          </div>

          {/* Terms & Actions */}
          <div className="pt-6 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer group mb-6">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-accent/50 focus:outline-none checked:bg-accent checked:border-accent transition-colors cursor-pointer"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <svg className="absolute w-3 h-3 text-[#050E24] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-blue-gray leading-relaxed group-hover:text-primary transition-colors">
                I agree to the <a href="#" className="text-accent font-bold hover:underline">Terms & Conditions</a>, Refund Policy, and understand that access is granted immediately upon successful payment.
              </span>
            </label>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => onNavigate('course-detail', courseId)}
                className="w-1/3 py-3.5 uppercase tracking-widest text-xs font-black"
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                className={`flex-1 py-4 text-sm font-bold shadow-lg shadow-primary/30 transition-all ${(!acceptedTerms || isProcessing) ? 'opacity-50 cursor-not-allowed shadow-none hover:-translate-y-0 hover:shadow-none bg-slate-300 text-slate-500' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40'}`}
                disabled={!acceptedTerms || isProcessing}
                onClick={handleProceed}
              >
                {isProcessing ? (totalPayable === 0 ? 'PROCESSING ENROLLMENT...' : 'INITIALIZING RAZORPAY...') : (totalPayable === 0 ? 'ENROLL FOR FREE' : `PAY ₹${totalPayable.toFixed(2)} SECURELY`)}
              </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
