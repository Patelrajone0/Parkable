'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Send, 
  ShieldCheck, 
  MapPin, 
  Key, 
  Car, 
  Zap, 
  CheckCheck, 
  Clock, 
  Copy, 
  Check, 
  MessageSquare,
  Sparkles,
  User
} from 'lucide-react';

export default function ChatModal() {
  const {
    isChatOpen,
    closeChat,
    activeChatBooking,
    chatMessages,
    sendChatMessage,
    markChatAsRead,
    activeRole,
    currentUser,
    isHostTyping,
    addToast
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current active booking
  const bookingMessages = activeChatBooking
    ? chatMessages.filter((m) => m.booking_id === activeChatBooking.id)
    : [];

  // Scroll to bottom on open or new message
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (activeChatBooking) {
        markChatAsRead(activeChatBooking.id);
      }
    }
  }, [isChatOpen, bookingMessages.length, isHostTyping]);

  if (!isChatOpen || !activeChatBooking) return null;

  const isUserDriver = activeRole === 'driver';

  // Partner information (Host or Driver)
  const partnerName = isUserDriver 
    ? (activeChatBooking.host_name || 'Spot Host')
    : activeChatBooking.driver_name;

  const partnerRole = isUserDriver ? 'Host & Space Owner' : 'Driver & Renter';

  const partnerAvatar = isUserDriver 
    ? (activeChatBooking.host_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const handleSend = async (textToSend?: string, isQuickAction: boolean = false) => {
    const text = textToSend ?? inputText;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputText('');
    }

    await sendChatMessage(
      activeChatBooking.id, 
      text, 
      isQuickAction ? 'quick_action' : 'text'
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = () => {
    if (activeChatBooking.access_code) {
      navigator.clipboard.writeText(activeChatBooking.access_code);
      setCopiedCode(true);
      addToast('Gate PIN Copied! 🔑', `Code ${activeChatBooking.access_code} copied to clipboard.`, 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Role-specific quick suggested chips
  const quickChips = isUserDriver
    ? [
        { label: '📍 I have arrived at the gate', text: 'I have arrived at the property gate.' },
        { label: '🔑 Confirm gate PIN', text: 'Can you please confirm the gate entry code?' },
        { label: '⚡ How to start EV charger?', text: 'Where is the EV charging switch located?' },
        { label: '⏰ Running 10 mins late', text: 'Hi! Running about 10 minutes late due to traffic.' },
        { label: '🅿️ Which parking bay is mine?', text: 'Could you clarify which exact bay or slot to park in?' },
        { label: '🔒 Vehicle parked & locked', text: 'Vehicle is parked safely inside the bay and locked.' },
      ]
    : [
        { label: '🚪 Gate is unlocked', text: 'The gate is unlocked for you, please pull right in!' },
        { label: `🔑 Gate code: ${activeChatBooking.access_code}`, text: `Your gate access code is ${activeChatBooking.access_code}. Key it on the keypad.` },
        { label: '⚡ EV charger is active', text: 'The Level-2 EV charger is active on the side wall, ready to plug.' },
        { label: '👋 Welcome! Need any help?', text: 'Welcome! Let me know if you need any directions inside the driveway.' },
      ];

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#383028] h-[92vh] sm:h-[680px] max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 bg-[#141210] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with live pulse dot */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#dfba89]/40 bg-[#241f1a]">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#141210]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#f6f2ec] truncate leading-tight">
                  {partnerName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#dfba89]/15 text-[#dfba89] border border-[#dfba89]/30 shrink-0">
                  {isUserDriver ? 'Host' : 'Driver'}
                </span>
              </div>
              <p className="text-[11px] text-[#a89682] truncate flex items-center gap-1.5 mt-0.5">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Session
                </span>
                <span>•</span>
                <span className="truncate">{activeChatBooking.spot_title}</span>
              </p>
            </div>
          </div>

          {/* Header Action: Gate Pin Copy & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {activeChatBooking.access_code && (
              <button
                onClick={handleCopyCode}
                title="Click to copy gate access passcode"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#221c17] hover:bg-[#2c241e] border border-[#dfba89]/30 text-[#dfba89] text-[11px] font-mono font-bold transition shadow-xs"
              >
                <Key className="w-3 h-3 text-[#dfba89]" />
                <span>{activeChatBooking.access_code}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
              </button>
            )}

            <button
              onClick={closeChat}
              className="w-8 h-8 rounded-full bg-[#1c1815] hover:bg-[#28221b] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spot Summary Info Ribbon */}
        <div className="px-4 py-2 bg-[#1c1713] border-b border-[#2d251e] flex items-center justify-between text-xs text-[#a89682] shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#dfba89] shrink-0" />
            <span className="truncate">{activeChatBooking.spot_address}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#dfba89] ml-2">
            <Car className="w-3 h-3 text-[#dfba89]" />
            <span>{activeChatBooking.vehicle_plate}</span>
          </div>
        </div>

        {/* Chat Timeline (Scrollable area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#141210] to-[#181512]">
          {/* Trust & Safety Security Pill */}
          <div className="p-2.5 rounded-2xl bg-[#1e1914] border border-[#383028] text-center max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-1.5 text-[#dfba89] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct In-App Communication</span>
            </div>
            <p className="text-[10px] text-[#a89682] mt-0.5">
              Messages are saved with your reservation pass #{activeChatBooking.id} for quick coordination.
            </p>
          </div>

          {/* Messages */}
          {bookingMessages.length === 0 ? (
            <div className="py-12 text-center text-[#756758] space-y-2">
              <MessageSquare className="w-10 h-10 text-[#42372d] mx-auto" />
              <p className="text-sm font-semibold text-[#f6f2ec]">Start your conversation</p>
              <p className="text-xs text-[#a89682] max-w-xs mx-auto">
                Need entry directions, gate access help, or have questions for the space owner? Send a message below.
              </p>
            </div>
          ) : (
            bookingMessages.map((msg) => {
              const isMe = msg.sender_role === activeRole || msg.sender_id === currentUser?.id;
              const isSystem = msg.message_type === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-[#201a15] border border-[#dfba89]/20 text-xs text-[#f6f2ec] shadow-sm">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#dfba89] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{msg.sender_name} (Space Owner)</span>
                      <span className="text-[10px] text-[#756758] font-normal ml-auto">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-[#e2d5c3] leading-relaxed">{msg.message}</p>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-[#383028] bg-[#241f1a] shrink-0 mb-1">
                        <img
                          src={msg.sender_avatar || partnerAvatar}
                          alt={msg.sender_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition ${
                        isMe
                          ? 'bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] font-medium rounded-br-xs shadow-md shadow-[#dfba89]/10'
                          : 'bg-[#221c17] text-[#f6f2ec] border border-[#383028] rounded-bl-xs shadow-sm'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-bold text-[#dfba89] mb-0.5">
                          {msg.sender_name}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 text-[10px] text-[#756758] mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#dfba89]" />}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isHostTyping && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#383028] bg-[#241f1a] shrink-0">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#221c17] border border-[#383028] rounded-bl-xs">
                <span className="w-2 h-2 rounded-full bg-[#dfba89] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#dfba89] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#dfba89] animate-bounce" />
                <span className="text-[11px] text-[#a89682] ml-1.5 font-medium">{partnerName} is replying...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips Carousel */}
        <div className="p-2 sm:px-4 bg-[#141210] border-t border-[#2d251e] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.text, true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#201a15] hover:bg-[#2c241e] border border-[#383028] hover:border-[#dfba89]/40 text-[#c2b29d] hover:text-[#dfba89] text-[11px] font-medium whitespace-nowrap transition shrink-0 cursor-pointer active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] bg-[#12100e] border-t border-[#383028] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${partnerName}...`}
              className="flex-1 bg-[#1c1814] text-[#f6f2ec] placeholder-[#756758] text-xs sm:text-sm px-4 py-2.5 sm:py-3 rounded-xl border border-[#383028] focus:border-[#dfba89] focus:outline-none transition shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#dfba89]/20 shrink-0 cursor-pointer active:scale-95"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4 text-[#12100e]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
