import React, { useRef } from 'react';
import { X, Download, Printer } from 'lucide-react';
import dark_logo from '../../assets/dark_logo_transparent.png';

export default function InvoiceModal({ isOpen, onClose, invoiceData }) {
  const invoiceRef = useRef(null);

  if (!isOpen) return null;

  // Format duration
  const durationRaw = invoiceData.courseDuration || '365';
  let formattedDuration = '1 Year';
  if (durationRaw === 'lifetime' || durationRaw.toLowerCase() === 'lifetime') {
    formattedDuration = 'Lifetime Access';
  } else if (!isNaN(Number(durationRaw))) {
    const days = Number(durationRaw);
    if (days === 365 || days === 360) formattedDuration = '1-Year Access';
    else if (days === 180) formattedDuration = '6-Month Access';
    else if (days === 90) formattedDuration = '3-Month Access';
    else if (days === 30) formattedDuration = '1-Month Access';
    else formattedDuration = `${days}-Day Access`;
  } else {
    formattedDuration = durationRaw;
  }
  
  const subjectSuffix = formattedDuration === 'Lifetime Access' ? 'Lifetime Access' : (formattedDuration.includes('Access') ? formattedDuration : `${formattedDuration} Access`);
  const itemSuffix = formattedDuration === 'Lifetime Access' ? 'Lifetime Access' : (formattedDuration.includes('Access') ? formattedDuration.replace('Access', '').trim() : formattedDuration);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    
    // Write the basic HTML structure for printing
    windowPrint.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceData.invoiceId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { margin: 0; size: A4 portrait; }
            }
          </style>
        </head>
        <body class="p-8 bg-white text-black">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 1000); // Give time for Tailwind to load and parse
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-[#0B1F4D]">Invoice Details</h2>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#C89B3C] text-white rounded-lg text-sm font-bold hover:bg-[#A8802E] transition-colors"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          
          {/* A4 Size Invoice Paper */}
          <div 
            ref={invoiceRef} 
            className="bg-white mx-auto shadow-sm"
            style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', padding: '15mm 15mm' }}
          >
            {/* INVOICE CONTENT START */}
            <div className="border border-gray-300 relative text-[12px] leading-relaxed text-gray-800 font-sans">
              
              {/* Top Banner Row */}
              <div className="flex justify-between border-b border-gray-300">
                <div className="w-1/3 p-4 flex items-center justify-center border-r border-gray-300">
                   <img src={dark_logo} alt="Dr. Sam Reefath Radiology Academy" className="h-16 object-contain" />
                </div>
                <div className="w-1/3 p-4 border-r border-gray-300">
                   <h1 className="font-bold text-base mb-1">Dr. Sam Reefath Radiology Academy</h1>
                   <p>Academic Head Office</p>
                   <p>12, Academy Street, Adyar</p>
                   <p>Chennai - 600020, Tamil Nadu</p>
                   <p>India</p>
                </div>
                <div className="w-1/3 p-4 flex items-end justify-end">
                   <h2 className="text-3xl font-light text-gray-500 tracking-wide">TAX INVOICE</h2>
                </div>
              </div>

              {/* Meta Data Row */}
              <div className="flex border-b border-gray-300">
                <div className="w-1/2 flex border-r border-gray-300">
                   <div className="w-1/3 p-2 bg-gray-50 border-r border-gray-300">
                      <p>#</p>
                      <p>Invoice Date</p>
                      <p>Terms</p>
                      <p>Due Date</p>
                      <p>Receipt ID</p>
                   </div>
                   <div className="w-2/3 p-2 font-semibold">
                      <p>: {invoiceData.invoiceId}</p>
                      <p>: {invoiceData.date}</p>
                      <p>: Due on Receipt</p>
                      <p>: {invoiceData.date}</p>
                      <p>: {invoiceData.receiptId}</p>
                   </div>
                </div>
                <div className="w-1/2 flex">
                   <div className="w-1/3 p-2 bg-gray-50 border-r border-gray-300">
                      <p>Support Contact</p>
                   </div>
                   <div className="w-2/3 p-2 font-semibold">
                      <p>: info@reefathradiology.com</p>
                   </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div className="flex border-b border-gray-300 bg-gray-50 font-bold">
                <div className="w-1/2 p-2 border-r border-gray-300">Bill To</div>
                <div className="w-1/2 p-2">Participant Details</div>
              </div>
              <div className="flex border-b border-gray-300 min-h-[100px]">
                <div className="w-1/2 p-3 border-r border-gray-300">
                  <p className="font-bold text-[13px] mb-1">{invoiceData.studentName}</p>
                  <p>{invoiceData.studentEmail}</p>
                  {/* Additional address lines could go here */}
                </div>
                <div className="w-1/2 p-3">
                  <p className="font-bold text-[13px] mb-1">{invoiceData.studentName}</p>
                  <p>Enrolled via Web Portal</p>
                </div>
              </div>

              {/* Subject */}
              <div className="p-3 border-b border-gray-300">
                <p><span className="font-semibold">Subject :</span> RE - Course Enrollment & {subjectSuffix}</p>
              </div>

              {/* Items Table */}
              <div className="w-full text-left">
                <div className="flex bg-gray-50 border-b border-gray-300 font-bold">
                  <div className="w-[5%] p-2 border-r border-gray-300 text-center">#</div>
                  <div className="w-[55%] p-2 border-r border-gray-300">Item & Description</div>
                  <div className="w-[10%] p-2 border-r border-gray-300 text-center">Qty</div>
                  <div className="w-[15%] p-2 border-r border-gray-300 text-right">Rate</div>
                  <div className="w-[15%] p-2 text-right">Amount</div>
                </div>
                
                <div className="flex border-b border-gray-300 min-h-[80px]">
                  <div className="w-[5%] p-2 border-r border-gray-300 text-center">1</div>
                  <div className="w-[55%] p-2 border-r border-gray-300">
                    <p className="font-bold">{invoiceData.courseName}</p>
                    <p className="text-gray-500 mt-1">Full Curriculum Access + Live Webinars ({itemSuffix})</p>
                  </div>
                  <div className="w-[10%] p-2 border-r border-gray-300 text-center">1.00</div>
                  <div className="w-[15%] p-2 border-r border-gray-300 text-right">{invoiceData.amount}</div>
                  <div className="w-[15%] p-2 text-right">{invoiceData.amount}</div>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex border-b border-gray-300">
                <div className="w-[60%] p-3 border-r border-gray-300">
                  <p className="text-gray-500 mb-1">Total In Words</p>
                  <p className="font-bold italic">Rupees {invoiceData.amountWords || 'Thirty Four Thousand Nine Hundred Ninety Nine Only'}</p>
                  
                  <div className="mt-4">
                    <p className="font-bold text-gray-500 mb-1">Notes</p>
                    <p>Thanks for choosing Dr. Sam Reefath Radiology Academy.</p>
                  </div>
                </div>
                <div className="w-[40%] flex flex-col">
                   <div className="flex justify-between p-2 border-b border-gray-300">
                     <span className="font-bold text-gray-600">Sub Total</span>
                     <span>{invoiceData.amount}</span>
                   </div>
                   <div className="flex justify-between p-2 border-b border-gray-300 font-bold">
                     <span>Total</span>
                     <span>{invoiceData.amount}</span>
                   </div>
                   <div className="flex justify-between p-2 border-b border-gray-300 font-bold bg-gray-50">
                     <span>Balance Due</span>
                     <span>₹0</span>
                   </div>
                   
                   <div className="p-4 flex flex-col items-center justify-center flex-1">
                     <p className="font-bold mb-4 text-center">Dr. Sam Reefath Academy</p>
                     <div className="w-32 h-16 border-2 border-blue-200/50 rounded-full flex items-center justify-center bg-blue-50/30 rotate-[-5deg]">
                       <span className="text-blue-700/60 font-bold tracking-widest text-[10px]">PAID SECURELY</span>
                     </div>
                     <p className="mt-4 border-t border-gray-400 pt-1 w-full text-center text-gray-500 text-[10px]">Authorized Signature</p>
                   </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="p-3">
                <p className="font-bold text-gray-500 mb-1">Account Details:-</p>
                <p>Payment securely processed via Razorpay Gateway.</p>
                <p>Transaction ID - {invoiceData.receiptId}</p>
                <p className="mt-4 font-bold text-gray-500 mb-1">Terms & Conditions</p>
                <p>Access is valid for 12 months from the date of enrollment. Fees are non-transferable.</p>
              </div>

            </div>
            
            <div className="mt-8 text-[9px] text-gray-400">
              <p className="font-bold">Declaration</p>
              <p>We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.</p>
            </div>
            {/* INVOICE CONTENT END */}
          </div>

        </div>
      </div>
    </div>
  );
}
