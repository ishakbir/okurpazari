/**
 * Listing Q&A Component
 * Displays questions and answers with visibility control
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Message } from '@/types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Reply, MessageCircle, Lock, Globe } from 'lucide-react';

interface ListingQAProps {
  listingId: number;
  sellerId: number;
}

export function ListingQA({ listingId, sellerId }: ListingQAProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [replyIsPublic, setReplyIsPublic] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const isSeller = user?.id === sellerId;

  useEffect(() => {
    fetchMessages();
  }, [listingId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/listing/${listingId}`);
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.post(`/messages/listing/${listingId}/question`, {
        content: newQuestion.trim()
      });
      setNewQuestion('');
      setSuccessMessage('Sorunuz gönderildi! Satıcı yanıtladığında bildirim alacaksınız.');
      fetchMessages();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Soru gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (questionId: number) => {
    const content = replyContent[questionId];
    const isPublic = replyIsPublic[questionId] ?? false;
    
    if (!content?.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/messages/${questionId}/reply`, {
        content: content.trim(),
        isPublic
      });
      setReplyContent(prev => ({ ...prev, [questionId]: '' }));
      setReplyIsPublic(prev => ({ ...prev, [questionId]: false }));
      setActiveReplyId(null);
      setSuccessMessage('Yanıtınız gönderildi!');
      fetchMessages();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Yanıt gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAskQuestion = isAuthenticated && !isSeller;
  const hasNoVisibleMessages = !messages || messages.length === 0;

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-accent" /> Sorular ve Cevaplar</h2>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {/* Question Form - Only for logged in users who are not the seller */}
      {canAskQuestion && (
        <form onSubmit={handleSubmitQuestion} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-primary font-medium flex-shrink-0">
              {user && getInitials(user.firstName, user.lastName)}
            </div>
            <div className="flex-1">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Satıcıya bir soru sorun..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none bg-white/50 backdrop-blur-sm transition-all"
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5 inline mr-1" /> Sorunuz başlangıçta sadece siz ve satıcı görebilir. Satıcı yanıtlarken herkese açık yapabilir.
                </p>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newQuestion.trim() || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Soru Sor
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="mb-6 p-4 glass-panel rounded-xl text-center">
          <p className="text-gray-600">
            Soru sormak için <a href="/giris" className="text-accent hover:underline font-medium">giriş yapın</a>
          </p>
        </div>
      )}

      {/* Questions List */}
      {hasNoVisibleMessages ? (
        <p className="text-gray-500 text-center py-6">
          {isAuthenticated 
            ? (isSeller ? 'Henüz soru sorulmamış.' : 'Henüz görüntülenebilir soru yok.')
            : 'Henüz herkese açık soru yok.'
          }
        </p>
      ) : (
        <div className="space-y-6">
          {messages.map((question) => (
            <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
              {/* Question */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                  {question.sender && getInitials(question.sender.firstName || 'K', question.sender.lastName || 'K')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {question.sender?.firstName} {question.sender?.lastName?.charAt(0)}.
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(question.createdAt)}
                    </span>
                    {/* Show private badge if no public replies */}
                    {!question.replies?.some(r => r.isPublic) && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Özel
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{question.content}</p>
                </div>
              </div>

              {/* Replies */}
              {question.replies && question.replies.length > 0 && (
                <div className="ml-13 mt-4 space-y-3">
                  {question.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 bg-stone-50 border border-stone-100 rounded-xl p-4 shadow-sm hover-lift">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        S
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-accent">Satıcı</span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                          {reply.isPublic ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Herkese Açık
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Özel
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form for Seller */}
              {isSeller && (!question.replies || question.replies.length === 0) && (
                <div className="ml-13 mt-4">
                  {activeReplyId === question.id ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <textarea
                        value={replyContent[question.id] || ''}
                        onChange={(e) => setReplyContent(prev => ({ ...prev, [question.id]: e.target.value }))}
                        placeholder="Yanıtınızı yazın..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none bg-white transition-all"
                        rows={2}
                        maxLength={1000}
                      />
                      
                      {/* Visibility Toggle */}
                      <div className="mt-3 flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={replyIsPublic[question.id] ?? false}
                            onChange={(e) => setReplyIsPublic(prev => ({ ...prev, [question.id]: e.target.checked }))}
                            className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">
                            🌍 Herkese açık yanıtla
                          </span>
                        </label>
                        <span className="text-xs text-gray-500">
                          (İşaretlenmezse sadece soru soran görebilir)
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(question.id)}
                          disabled={!replyContent[question.id]?.trim() || isSubmitting}
                          isLoading={isSubmitting}
                        >
                          Yanıtla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveReplyId(null)}
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveReplyId(question.id)}
                    >
                      <Reply className="w-4 h-4 inline mr-1" /> Yanıtla
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
