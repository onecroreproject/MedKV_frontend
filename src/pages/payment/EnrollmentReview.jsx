import React, { useState, useEffect } from 'react';
import Navbar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import Button from '../../components/ui/Button';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { usePurchase } from '../../context/PurchaseContext';
import { getCourseById } from '../../services/courseService';

export default function EnrollmentReview({ userSession, courseId, onNavigate }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { purchaseCourse } = usePurchase();
  const [isProcessing, setIsProcessing] = useState(false);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(courseId);
        if (res?.data) {
          setCourse({
            title: res.data.title,
            faculty: res.data.instructor?.name || 'Dr. Sam Reefath',
            duration: 'Self-Paced',
            price: res.data.price || 0,
            discount: res.data.discount || 0,
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

  const finalAmount = course ? course.price - course.discount : 0;

  const handleProceed = async () => {
    if (acceptedTerms) {
      setIsProcessing(true);
      const success = await purchaseCourse(courseId);
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

          {/* Payment Summary */}
          <div>
            <h2 className="text-xl font-bold text-primary mb-4 border-b border-slate-100 pb-2">Payment Summary</h2>
            <div className="space-y-3 text-sm font-medium text-blue-gray">
              <div className="flex justify-between">
                <span>Course Price</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Early Bird Discount</span>
                <span>-${course.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-primary pt-3 border-t border-slate-100">
                <span>Final Amount Payable</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
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
                {isProcessing ? 'INITIALIZING RAZORPAY...' : `PAY $${finalAmount.toFixed(2)} SECURELY`}
              </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
