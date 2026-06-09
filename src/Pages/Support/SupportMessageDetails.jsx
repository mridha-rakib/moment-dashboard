import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { supportTicketService } from '@/features/support';
import { getApiErrorMessage } from '@/shared/api';

const statusLabels = {
  pending: 'Pending',
  solved: 'Solved',
  dismissed: 'Dismissed',
};

const statusOptions = ['pending', 'solved', 'dismissed'];

const getStatusClassName = (status) => {
  if (status === 'solved') return 'bg-[#10B981]/10 text-[#10B981]';
  if (status === 'dismissed') return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
  return 'bg-[#FF9F43]/10 text-[#FF9F43]';
};

const formatDate = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const getAvatarUrl = (ticket) => (
  ticket?.requester?.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(ticket?.requester?.email || ticket?.id || 'support')}`
);

const SupportMessageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const [activeStatus, setActiveStatus] = useState('pending');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom functionality
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  useEffect(() => {
    let isMounted = true;

    const loadTicket = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const supportTicket = await supportTicketService.getTicket(id);

        if (isMounted) {
          setTicket(supportTicket);
          setActiveStatus(supportTicket.status);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load support message.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTicket();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!replyText.trim()) return;
    if (!id) return;

    setIsSending(true);

    try {
      const updatedTicket = await supportTicketService.createMessage(id, replyText.trim());
      setTicket(updatedTicket);
      setActiveStatus(updatedTicket.status);
      setReplyText('');
    } catch (sendError) {
      window.alert(getApiErrorMessage(sendError, 'Unable to send support response.'));
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id) return;

    setIsUpdating(true);

    try {
      await supportTicketService.updateStatus(id, activeStatus);
      navigate('/support-center');
    } catch (updateError) {
      window.alert(getApiErrorMessage(updateError, 'Unable to update support ticket.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const user = {
    name: ticket?.requester?.name || '',
    email: ticket?.requester?.email || '',
    avatar: getAvatarUrl(ticket),
    date: formatDate(ticket?.createdAt),
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">

      {/* 1. FIXED TOP SECTION: Actions & User Info */}
      <div className="flex-none p-8 pb-4">
        <div className="mx-auto max-w-[1400px]">
          {/* Actions Header */}
          <div className="flex justify-end gap-4 mb-6">
            <button
              onClick={() => navigate('/support-center')}
              className="px-8 py-2.5 bg-gray-200/50 dark:bg-[#2D2D3F] text-gray-500 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#3D3D4F] transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdateStatus}
              disabled={isUpdating || isLoading}
              className="px-8 py-2.5 bg-[#6D67E4] text-white text-sm font-bold rounded-xl hover:bg-[#5B55C9] transition-all shadow-lg shadow-[#6D67E4]/20 disabled:opacity-50"
            >
              Update
            </button>
          </div>


          {/* User Info Card - Fixed/Sticky at the top */}
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-8 shadow-sm border border-gray-50 dark:border-gray-800 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex gap-8">
                <img src={user.avatar} className="w-20 h-20 rounded-full object-cover shadow-md" />
                <div className="grid grid-cols-2 gap-x-20 gap-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">DATE</p>
                    <p className="text-sm font-bold text-[#1A1A4B] dark:text-white transition-colors">{user.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">STATUS</p>
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase transition-all duration-300 ${getStatusClassName(activeStatus)}`}>
                      {statusLabels[activeStatus]}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">NAME</p>
                    <p className="text-sm font-bold text-[#1A1A4B] dark:text-white transition-colors">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">EMAIL</p>
                    <p className="text-sm font-bold text-[#1A1A4B] dark:text-white transition-colors">{user.email}</p>
                  </div>
                </div>
              </div>


              <div className="relative">
                <button 
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-3 px-6 py-2 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-400 shadow-sm hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all"
                >
                  Status <ChevronDown size={14} className={`transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl border border-gray-50 dark:border-gray-800 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setActiveStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full px-6 py-3 text-left text-xs font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all border-b border-gray-50 dark:border-gray-800 last:border-0"
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE MIDDLE SECTION: Message Feed */}
      <div className="flex-1 overflow-y-auto px-8 custom-scrollbar scroll-smooth">
        <div className="mx-auto max-w-[1400px] py-4 space-y-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
              <Spinner className="size-4" />
              Loading support message...
            </div>
          )}

          {!isLoading && error && (
            <div className="text-sm font-bold text-red-500">{error}</div>
          )}

          {!isLoading && !error && ticket?.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`max-w-[800px] p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md ${
                msg.senderType === 'admin'
                ? 'bg-[#FBFBFF] dark:bg-[#2D2D3F]/50' 
                : 'bg-white dark:bg-[#1E1E2D]'
              }`}>
                <div className="flex justify-between items-center mb-4 gap-20">
                  <h4 className="text-[15px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{msg.title}</h4>
                  <span className="text-[10px] text-gray-300 font-bold whitespace-nowrap">{formatTime(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  {msg.body}
                </p>
              </div>
            </div>

          ))}
          {/* Scroll Target */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. FIXED BOTTOM SECTION: Reply Box */}
      <div className="flex-none p-8 pt-4">
        <div className="mx-auto max-w-[1400px]">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-6 shadow-lg border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-[#6D67E4]/10 transition-all">
            <textarea
              placeholder="Type here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full h-24 p-4 text-sm text-[#1A1A4B] dark:text-white placeholder-gray-300 bg-transparent border-none outline-none resize-none"
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={handleSendMessage}
                disabled={!replyText.trim() || isSending || isLoading}
                className="flex items-center gap-2 px-10 py-3 bg-[#1A1A4B] dark:bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                Send <Send size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SupportMessageDetails;
