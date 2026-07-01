import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { createTicket, getMyTickets, replyToTicket } from '../../services/userService';

export function HelpdeskTab() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getMyTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !category || !details) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createTicket({ subject, category, details });
      if (res.success) {
        setSubject('');
        setCategory('');
        setDetails('');
        alert('Ticket created successfully!');
        fetchTickets(); // Refresh list
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      const res = await replyToTicket(ticketId, replyText);
      if (res.success) {
        setReplyText('');
        fetchTickets(); // Refresh list to show new reply
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send reply');
    }
  };

  const toggleTicket = (id) => {
    if (expandedTicketId === id) {
      setExpandedTicketId(null);
      setReplyText('');
    } else {
      setExpandedTicketId(id);
      setReplyText('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'Closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Helpdesk & Support</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Submit a ticket for technical issues, billing, or course content queries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Contact Form & FAQ */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">📨 Submit Support Request</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs focus:bg-white focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300"
                  required
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Billing & Payments">Billing & Payments</option>
                  <option value="Course Content">Course Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (e.g. Brain MRI scan lock)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Details</label>
                <textarea
                  rows="4"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300 resize-none leading-relaxed"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isSubmitting}
                className="w-full text-xs font-black py-3 uppercase tracking-widest shadow-sm transform active:scale-95 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-[#0B1F4D] to-[#040812] border border-accent/25 rounded-3xl p-6 shadow-lg space-y-3 hover:shadow-xl transition-shadow duration-300">
            <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">📞 URGENT CLINICAL HELPDESK</span>
            <p className="text-slate-300 text-xs leading-relaxed font-light">
              Premium registrars have direct access to consultant examiners via live private channels.
            </p>
            <div className="pt-2 text-xs font-extrabold text-white leading-relaxed">
              Email: support@samreefath.com <br />
              Phone: +44 20 7946 0958 (Mon-Fri 09:00 - 18:00 GMT)
            </div>
          </div>
        </div>

        {/* Right Column: My Tickets History */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">🎫 My Ticket History</span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <p className="text-slate-400 text-xs text-center py-8">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">You haven't submitted any tickets yet.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50/50">
                  <div 
                    onClick={() => toggleTicket(ticket._id)}
                    className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-start gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{ticket.category}</span>
                      </div>
                      <h4 className="text-[#0B1F4D] font-bold text-sm truncate">{ticket.subject}</h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="shrink-0 pt-1">
                      <svg 
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedTicketId === ticket._id ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedTicketId === ticket._id && (
                    <div className="p-4 border-t border-slate-200 bg-white">
                      <div className="space-y-4 mb-4">
                        {ticket.responses.map((res, idx) => (
                          <div key={idx} className={`flex flex-col ${res.sender === 'Student' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              {res.sender} • {new Date(res.createdAt).toLocaleDateString()}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                              res.sender === 'Student' 
                                ? 'bg-accent/10 text-[#0B1F4D] rounded-tr-sm' 
                                : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                            }`}>
                              {res.message}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      {(ticket.status !== 'Closed') && (
                        <div className="flex gap-2 items-end pt-3 border-t border-slate-100">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows="2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                          />
                          <Button 
                            onClick={() => handleReply(ticket._id)}
                            variant="primary" 
                            size="sm"
                            disabled={!replyText.trim()}
                            className="shrink-0 h-[52px]"
                          >
                            Reply
                          </Button>
                        </div>
                      )}
                      {ticket.status === 'Closed' && (
                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-3 border-t border-slate-100">
                          This ticket is closed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default HelpdeskTab;
