/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Plus, Check, MapPin, User, Tag } from 'lucide-react';
import { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

export default function ReviewList({ reviews, onAddReview }: ReviewListProps) {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [vehicle, setVehicle] = useState<string>('Ô tô 4-5 chỗ (Sedan)');
  const [formError, setFormError] = useState<string>('');

  // Computations
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 5.0, count: 0, stars: [0, 0, 0, 0, 0] };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / reviews.length).toFixed(1));
    
    const countStars = [0, 0, 0, 0, 0]; // 1 to 5 index
    reviews.forEach(r => {
      const idx = Math.min(Math.max(r.rating - 1, 0), 4);
      countStars[idx]++;
    });

    return {
      avg,
      count: reviews.length,
      stars: countStars // [1star, 2star, 3star, 4star, 5star]
    };
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên của bạn');
      return;
    }
    if (!comment.trim()) {
      setFormError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    const newReview: Review = {
      id: 'REV-' + Math.floor(1000 + Math.random() * 9000),
      reviewerName: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      vehicleType: vehicle
    };

    onAddReview(newReview);
    
    // Clear state
    setName('');
    setRating(5);
    setComment('');
    setShowForm(false);
    setFormError('');
  };

  return (
    <div className="space-y-8">
      {/* Visual stats and feedback section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Aggregation Summary */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-sky-100 shadow-lg text-center space-y-3">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Điểm đánh giá trung bình</span>
          <h3 className="text-5xl font-black text-slate-800 tracking-tight">{stats.avg}</h3>
          
          {/* Stars visual */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`w-5 h-5 ${
                  s <= Math.round(stats.avg) 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-slate-200'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium block">dựa trên {stats.count} bài viết đánh giá thực tế</span>
        </div>

        {/* Middle Column: Star Breakdown distribution bars */}
        <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2 text-xs select-none">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = stats.stars[starNum - 1] || 0;
            const percent = stats.count > 0 ? (count / stats.count) * 100 : 0;
            return (
              <div key={starNum} className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-3 text-right">{starNum}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-500 w-6 text-left">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Right Column: CTA add feedback */}
        <div className="md:col-span-3 text-center md:text-right">
          <button
            type="button"
            id="btn-trigger-review-form"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-sky-100 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Viết Đánh Giá
          </button>
        </div>
      </div>

      {/* Write review Form Modal overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xl space-y-4"
            >
              <h4 className="text-md font-extrabold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-500" />
                Chia sẻ ý kiến đánh giá của bạn
              </h4>

              {formError && (
                <p className="text-red-500 text-xs font-bold leading-relaxed">{formError}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Inputs */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tên của bạn</label>
                  <input
                    id="reviewer-name-input"
                    type="text"
                    required
                    placeholder="Nhập tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-sky-500 text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Phân loại phương tiện</label>
                  <select
                    id="reviewer-vehicle-select"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 text-xs font-medium outline-none"
                  >
                    <option value="Xe máy, Mô tô">Xe máy, Mô tô</option>
                    <option value="Ô tô 4-5 chỗ (Sedan)">Ô tô 4-5 chỗ (Sedan)</option>
                    <option value="Ô tô SUV, MPV 7 chỗ">Ô tô SUV, MPV 7 chỗ</option>
                    <option value="Xe bán tải, Bán du lịch">Xe bán tải, Bán du lịch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mức độ hài lòng</label>
                  <div className="flex items-center gap-1.5 py-1 select-none">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        id={`btn-star-rating-${val}`}
                        onClick={() => setRating(val)}
                        className="p-1 focus:outline-none transition-transform active:scale-125"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            val <= rating 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-slate-200 hover:text-amber-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nội dung chia sẻ chi tiết</label>
                <textarea
                  id="reviewer-comment-textarea"
                  rows={2}
                  required
                  placeholder="Tôi rất hài lòng vì quy trình sạch sẽ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-sky-500 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  id="btn-cancel-review"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  id="btn-submit-review"
                  className="px-5 py-2 hover:bg-sky-600 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-50"
                >
                  Gửi nhận xét
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((r, rIdx) => (
          <div 
            key={r.id || rIdx} 
            className="bg-white p-6 rounded-2xl border border-sky-50 shadow-md flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-sky-50 p-2 rounded-full text-sky-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-none">{r.reviewerName}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Ngày đăng: {r.date.split('-').reverse().join('/')}</span>
                  </div>
                </div>

                <div className="flex gap-0.5 select-none text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-amber-400' : 'text-slate-150'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed font-medium pt-1">
                "{r.comment}"
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-sky-600 font-bold bg-sky-50/55 px-2.5 py-1 rounded-lg self-start border border-sky-50/70">
              <Tag className="w-3 h-3 text-sky-500" />
              Dịch vụ cho: {r.vehicleType}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
