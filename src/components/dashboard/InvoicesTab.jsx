import React, { useState } from 'react';

export default function InvoicesTab({ ENROLLED_COURSES = [] }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // We assume that the course price and discount might not be directly available in ENROLLED_COURSES
  // For the sake of the invoice, we can reconstruct it from the data if possible,
  // or use placeholder/fallback logic if actual payment records are not passed from backend.
  // Ideally, backend should return a list of payments. Here we will mock it based on enrolled courses
  // assuming each enrolled course has a payment associated with it.

  // Let's generate a list of mock payments based on enrolled courses.
  const invoices = ENROLLED_COURSES.map(course => {
    // Assuming course object might have price details, if not we fallback to 1000 for demonstration.
    // In a real scenario, this would come from the Payment model.
    const coursePrice = course.price || 1000;
    const discount = course.discount || 0;
    const basePrice = coursePrice - discount;

    const courseFee = basePrice;
    const totalPayable = basePrice > 0 ? Math.round((courseFee / 0.9764) * 100) / 100 : 0;
    const processingFee = basePrice > 0 ? Math.round((totalPayable * 0.02) * 100) / 100 : 0;
    const gstOnFee = basePrice > 0 ? Math.round((processingFee * 0.18) * 100) / 100 : 0;

    return {
      id: `INV-${course.id.substring(0, 6).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      courseId: course.id,
      courseName: course.title,
      date: course.lastAccessed || new Date().toLocaleDateString(), // using lastAccessed as fallback for enrollment date
      status: 'Paid',
      coursePrice,
      discount,
      basePrice,
      gstOnFee,
      processingFee,
      totalPayable
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0B1F4D] tracking-tight">My Invoices</h2>

      {selectedInvoice ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="mb-6 flex items-center text-sm font-bold text-slate-500 hover:text-accent transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </button>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-xl font-black text-primary uppercase tracking-wide">Invoice</h3>
              <p className="text-slate-500 text-sm mt-1">Invoice #{selectedInvoice.id}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-lg border border-emerald-200">
                {selectedInvoice.status}
              </span>
              <p className="text-slate-400 text-xs mt-2">Date: {selectedInvoice.date}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm mb-6">
            <div className="bg-gradient-to-r from-[#030919] to-[#0B1F4D] px-5 py-3.5 flex justify-between items-center">
              <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Description</span>
              <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Amount</span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Course Price */}
              <div className="flex justify-between items-center px-5 py-3.5 bg-white">
                <div>
                  <span className="font-semibold text-primary">{selectedInvoice.courseName}</span>
                  <span className="ml-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">(MRP)</span>
                </div>
                <span className="font-semibold text-primary">₹{(selectedInvoice.coursePrice).toFixed(2)}</span>
              </div>

              {/* Early Bird Discount */}
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between items-center px-5 py-3.5 bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">Early Bird</span>
                    <span className="font-semibold text-emerald-700">Discount Applied</span>
                  </div>
                  <span className="font-bold text-emerald-600">- ₹{(selectedInvoice.discount).toFixed(2)}</span>
                </div>
              )}

              {/* Course Fee (After Discount) */}
              <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50">
                <span className="font-semibold text-slate-700">
                  Course Fee {selectedInvoice.discount > 0 ? '(After Discount)' : ''}
                </span>
                <span className="font-bold text-slate-800">₹{selectedInvoice.basePrice.toFixed(2)}</span>
              </div>

              {/* Processing Fee (2%) */}
              {selectedInvoice.basePrice > 0 && (
                <div className="flex justify-between items-center px-5 py-3.5 bg-white">
                  <span className="text-slate-600 font-medium">Payment Processing Fee (2%)</span>
                  <span className="font-semibold text-slate-700">₹{selectedInvoice.processingFee.toFixed(2)}</span>
                </div>
              )}

              {/* GST on Processing Fee (18%) */}
              {selectedInvoice.basePrice > 0 && (
                <div className="flex justify-between items-center px-5 py-3.5 bg-white">
                  <span className="text-slate-600 font-medium">GST on Processing Fee (18%)</span>
                  <span className="font-semibold text-slate-700">₹{selectedInvoice.gstOnFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-[#030919] to-[#0B1F4D] px-5 py-4 flex justify-between items-center">
              <div>
                <span className="text-white font-black text-base uppercase tracking-widest">Total Paid</span>
                {selectedInvoice.basePrice > 0 && (
                  <p className="text-slate-400 text-[10px] font-medium mt-0.5">Inclusive of GST & Processing Fee</p>
                )}
              </div>
              <span className="text-accent font-black text-xl">₹{selectedInvoice.totalPayable.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
             <button onClick={() => window.print()} className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-opacity-90 transition-all">
               Print / Download PDF
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-medium">
              You do not have any invoices yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600">{inv.id}</td>
                      <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                      <td className="px-6 py-4 font-bold text-primary truncate max-w-[200px]">{inv.courseName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">₹{inv.totalPayable.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-accent hover:text-[#0B1F4D] text-[11px] font-black uppercase tracking-wider transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
