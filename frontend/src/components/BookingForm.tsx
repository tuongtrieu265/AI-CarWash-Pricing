import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bike, Car, Truck, Box as Container, 
  Sparkles, Clock, Check, ChevronRight, ChevronLeft, 
  User, Phone, Hash, FileText, Calendar, Compass, ShieldCheck 
} from 'lucide-react';
import { VehicleType, Booking, WashService, AddOnService, CustomerVehicle } from '../types';
import { VEHICLE_LIST, WASH_SERVICES, ADD_ON_SERVICES, TIME_SLOTS } from '../data';
import api, { previewPrice } from '../api';
// Component mapping for vehicle icons
const IconMap: Record<string, React.ComponentType<any>> = {
  Bike: Bike,
  Car: Car,
  Truck: Truck,
  Container: Container
};

interface BookingFormProps {
  onBookingSubmitted: (booking: Booking) => void;
  setActiveTab: (tab: string) => void;
  currentUser: { fullName: string; email: string; phone?: string; role?: string } | null;
}

export default function BookingForm({ onBookingSubmitted, setActiveTab, currentUser }: BookingFormProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.SEDAN);
  const [selectedService, setSelectedService] = useState<string>('2');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  // Date default is tomorrow or today
  const todayStr = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>('09:00 - 10:00');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');



    //  AI Price State
    const [aiPrice, setAiPrice] = useState<number | null>(null);
    const [aiMultiplier, setAiMultiplier] = useState<number | null>(null);
    const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

  // Auto-fill customer info if logged in
  useEffect(() => {
    if (currentUser) {
      setCustomerName(prev => prev || currentUser.fullName || '');
      setCustomerPhone(prev => prev || currentUser.phone || '');
    }
  }, [currentUser]);
  
  // Form validations
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Saved vehicles integration states
  const [savedVehicles, setSavedVehicles] = useState<CustomerVehicle[]>([]);
  const [selectedSavedVehicleId, setSelectedSavedVehicleId] = useState<string>('manual');

  // Pre-fill user data
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.fullName || '');
      setCustomerPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Load saved vehicles
  useEffect(() => {
    if (currentUser) {
      api.get('/customer/vehicles')
        .then(res => {
          const fetchedVehicles = res.data.data || [];
          setSavedVehicles(fetchedVehicles);
          
          // If customer has a default license plate set on their profile, we can find a matching vehicle or pre-fill it.
          // Alternatively, we just let them pick from the dropdown.
        })
        .catch(err => {
          console.error('Failed to fetch customer vehicles', err);
        });
    }
  }, [currentUser]);

  const handleSavedVehicleChange = (vehicleIdStr: string) => {
    setSelectedSavedVehicleId(vehicleIdStr);
    if (vehicleIdStr === 'manual') {
      return;
    }
    const vehicle = savedVehicles.find(v => v.id.toString() === vehicleIdStr);
    if (vehicle) {
      setLicensePlate(vehicle.licensePlate);
      setSelectedVehicle(vehicle.vehicleType);
    }
  };

  // Resolve vehicle details
  const currentVehicleDetail = useMemo(() => {
    return VEHICLE_LIST.find(v => v.id === selectedVehicle) || VEHICLE_LIST[1];
  }, [selectedVehicle]);

  // Resolve wash service package
  const currentServiceDetail = useMemo(() => {
    return WASH_SERVICES.find(s => s.id === selectedService) || WASH_SERVICES[0];
  }, [selectedService]);

  // Handle add-ons selection
  const handleToggleAddOn = (id: string) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  /* // Live Price Calculation
  const totalCost = useMemo(() => {
    const base = currentServiceDetail.basePrice;
    const multiplier = currentVehicleDetail.priceMultiplier;
    const addOnCost = selectedAddOns.reduce((sum, addOnId) => {
      const opt = ADD_ON_SERVICES.find(a => a.id === addOnId);
      return sum + (opt ? opt.price : 0);
    }, 0);
    return Math.round((base * multiplier) + addOnCost);
  }, [currentServiceDetail, currentVehicleDetail, selectedAddOns]);
 */
   // 🤖 Gọi AI mỗi khi user chọn giờ hoặc đổi xe
   useEffect(() => {
     const fetchAIPrice = async () => {
       if (!currentServiceDetail || !selectedVehicle || !bookingTime || !bookingDate) {
         return;
       }

       setLoadingPrice(true);
       try {
         const timeSlot = bookingTime.split(' - ')[0];
         const result = await previewPrice({
           vehicleType: selectedVehicle,
           timeSlot: timeSlot,
           bookingDate: bookingDate,
           basePrice: currentServiceDetail.basePrice,
         });

         console.log('🤖 AI Price Preview:', result);
         setAiPrice(result.finalPrice);
         setAiMultiplier(result.multiplier);
       } catch (err) {
         console.error('❌ AI preview failed:', err);
         setAiPrice(null);
         setAiMultiplier(null);
       } finally {
         setLoadingPrice(false);
       }
     };

     fetchAIPrice();
   }, [selectedVehicle, currentServiceDetail, bookingTime, bookingDate]);

   // Tính giá cuối: ưu tiên AI, fallback về giá cứng
   const totalCost = useMemo(() => {
     if (aiPrice !== null) {
       const addOnCost = selectedAddOns.reduce((sum, addOnId) => {
         const opt = ADD_ON_SERVICES.find(a => a.id === addOnId);
         return sum + (opt ? opt.price : 0);
       }, 0);
       return aiPrice + addOnCost;
     }

     // Fallback (nếu AI chết)
     const base = currentServiceDetail.basePrice;
     const multiplier = currentVehicleDetail.priceMultiplier;
     const addOnCost = selectedAddOns.reduce((sum, addOnId) => {
       const opt = ADD_ON_SERVICES.find(a => a.id === addOnId);
       return sum + (opt ? opt.price : 0);
     }, 0);
     return Math.round((base * multiplier) + addOnCost);
   }, [aiPrice, currentServiceDetail, currentVehicleDetail, selectedAddOns]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 4) {
      if (!customerName.trim()) newErrors.customerName = 'Vui lòng nhập họ và tên';
      if (!customerPhone.trim()) {
        newErrors.customerPhone = 'Vui lòng nhập số điện thoại';
      } else if (!/^[0-9]{9,11}$/.test(customerPhone.trim().replace(/[\s.-]/g, ''))) {
        newErrors.customerPhone = 'Số điện thoại không hợp lệ (9 đến 11 chữ số)';
      }
      if (!licensePlate.trim()) {
        newErrors.licensePlate = 'Vui lòng nhập biển số xe (Ví dụ: 30A-123.45)';
      }
      if (!bookingDate) newErrors.bookingDate = 'Vui lòng chọn ngày rửa xe';
      if (!bookingTime) newErrors.bookingTime = 'Vui lòng chọn khung giờ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
      const element = document.getElementById('booking-section');
      if (element) {
        const yOffset = -90; // Offset for sticky header
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    const element = document.getElementById('booking-section');
    if (element) {
      const yOffset = -90; // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Build the new booking object for API / local state
    const newBooking = {
      id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
      customerName: customerName.trim(),
      phone: customerPhone.trim().replace(/[\s.-]/g, ''),
      licensePlate: licensePlate.trim().toUpperCase(),
      vehicleType: selectedVehicle,
      serviceId: selectedService, // This will map to servicePackageId in API
      addOnIds: selectedAddOns,
      date: bookingDate,
      timeSlot: bookingTime.split(' - ')[0], // Backend TIME_SLOTS expects '09:00', '10:00', etc.
      notes: notes.trim(),
      status: 'pending' as any,
      totalCost,
      createdAt: new Date().toISOString()
    };

    onBookingSubmitted(newBooking as Booking);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Visual Booking Process Form */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-50 overflow-hidden">
        
        {/* Progress header bar */}
        <div className="bg-gradient-to-r from-sky-50 to-sky-100/75 p-6 border-b border-sky-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600">Quy trình đặt lịch trực tuyến</span>
            <span className="text-sm font-bold text-sky-700">Bước {step}/4</span>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-sky-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="hidden md:flex justify-between text-xs font-bold text-slate-500 mt-3 select-none">
            <span className={step >= 1 ? 'text-sky-600 font-semibold' : ''}>1. Chọn xe của bạn</span>
            <span className={step >= 2 ? 'text-sky-600 font-semibold' : ''}>2. Gói dịch vụ</span>
            <span className={step >= 3 ? 'text-sky-600 font-semibold' : ''}>3. Dịch vụ bổ sung</span>
            <span className={step >= 4 ? 'text-sky-600 font-semibold' : ''}>4. Thời gian & Liên hệ</span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: SELECT VEHICLE */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                    <Compass className="w-5 h-5 text-sky-500" />
                    Bước 1. Bạn đi phương tiện loại nào?
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Chọn phân khúc xe để tính kích cỡ xit rửa và đơn giá phù hợp tốt nhất.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VEHICLE_LIST.map((v) => {
                    const TargetIcon = IconMap[v.icon] || Car;
                    const isSelected = selectedVehicle === v.id;
                    return (
                      <div
                        key={v.id}
                        id={`vehicle-card-${v.id}`}
                        onClick={() => {
                          setSelectedVehicle(v.id);
                          setSelectedSavedVehicleId('manual');
                        }}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-300'
                            : 'border-slate-100 bg-white hover:border-sky-200 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          <div className={`p-4 rounded-xl transition-all duration-300 ${
                            isSelected 
                              ? 'bg-sky-500 text-white' 
                              : 'bg-sky-50 text-sky-600 group-hover:scale-105'
                          }`}>
                            <TargetIcon className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-md">{v.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{v.description}</p>
                            <div className="text-xs font-semibold text-sky-600 bg-sky-50 inline-block px-2.5 py-0.5 rounded-full">
                              Hệ số giá: x{v.priceMultiplier}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 bg-sky-500 text-white rounded-full p-1 shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: SELECT SERVICES */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                    <Sparkles className="w-5 h-5 text-sky-500" />
                    Bước 2. Chọn gói rửa xe thông minh
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Mỗi gói rửa xe đều được quy chuẩn hóa quy trình chuyên nghiệp.</p>
                </div>

                <div className="space-y-4">
                  {WASH_SERVICES.map((srv) => {
                    const isSelected = selectedService === srv.id;
                    const calculatedPrice = Math.round(srv.basePrice * currentVehicleDetail.priceMultiplier);
                    return (
                      <div
                        key={srv.id}
                        id={`service-card-${srv.id}`}
                        onClick={() => setSelectedService(srv.id)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/20 shadow-md'
                            : 'border-slate-100 bg-white hover:border-sky-100'
                        }`}
                      >
                        {srv.isPopular && (
                          <div className="absolute -top-3 right-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md animate-pulse">
                            Bán chạy nhất 🔥
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-800 text-lg">{srv.name}</h4>
                              <span className="text-slate-400 text-xs font-semibold">• {srv.duration}</span>
                            </div>
                            <p className="text-xs text-sky-600 font-medium italic mt-0.5">{srv.subtitle}</p>
                          </div>
                          
                          <div className="text-left md:text-right">
                            <span className="text-xs text-slate-500 block font-medium">Giá ước tính cho xe của bạn</span>
                            <span className="text-xl font-extrabold text-sky-600">{formatPrice(calculatedPrice)}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{srv.description}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider block mb-2">Hạng mục rửa bao gồm:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {srv.features.map((feature, idx) => (
                              <div key={idx} className="flex gap-2 items-start text-xs text-slate-600">
                                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute bottom-6 right-6 bg-sky-500 text-white rounded-full p-1.5 shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: OPTIONAL ADD-ONS */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-500" />
                    Bước 3. Tùy chọn dịch vụ gia tăng (Add-on cao cấp)
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Dịch vụ chăm sóc thêm không bắt buộc hứa hẹn khôi phục tinh tế nhất.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {ADD_ON_SERVICES.map((addon) => {
                    const isChecked = selectedAddOns.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        id={`addon-card-${addon.id}`}
                        onClick={() => handleToggleAddOn(addon.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                          isChecked
                            ? 'border-sky-500 bg-sky-50/30'
                            : 'border-slate-100 bg-white hover:border-sky-100'
                        }`}
                      >
                        <input
                          id={`addon-checkbox-${addon.id}`}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div click
                          className="w-4 h-4 mt-1 text-sky-600 border-slate-300 rounded-sm focus:ring-sky-500 cursor-pointer pointer-events-none"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">{addon.name}</h4>
                            <span className="text-sm font-bold text-sky-600">+{formatPrice(addon.price)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{addon.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: DATE, TIME & INFORMATION */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    Bước 4. Thời gian rửa xe & Thông tin liên lạc
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Hãy để lại lịch hẹn thuận tiện, chúng tôi sẽ đón tiếp bạn chu đáo nhất.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Date & Time Picker */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Chọn ngày hẹn rửa xe</label>
                      <input
                        id="booking-date-input"
                        type="date"
                        min={todayStr}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className={`w-full p-3 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-sm font-medium ${
                          errors.bookingDate ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''
                        }`}
                      />
                      {errors.bookingDate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.bookingDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Chọn giờ rửa mong muốn</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIME_SLOTS.map((slot, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            id={`time-slot-${sIdx}`}
                            disabled={!slot.available}
                            onClick={() => setBookingTime(slot.time)}
                            className={`p-2.5 rounded-xl text-xs font-bold text-center border-2 transition-all duration-300 ${
                              !slot.available
                                ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed line-through'
                                : bookingTime === slot.time
                                ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                                : 'bg-white text-slate-700 border-slate-100 hover:border-sky-200'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              {slot.time.split(' - ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.bookingTime && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.bookingTime}</p>}
                    </div>
                  </div>

                  {/* Right Column: Personal Data Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Họ & Tên của bạn</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          id="customer-name-input"
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-sm font-medium ${
                            errors.customerName ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''
                          }`}
                        />
                      </div>
                      {errors.customerName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.customerName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Số điện thoại liên hệ</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          id="customer-phone-input"
                          type="tel"
                          placeholder="Ví dụ: 0987654321"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-sm font-medium ${
                            errors.customerPhone ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''
                          }`}
                        />
                      </div>
                      {errors.customerPhone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.customerPhone}</p>}
                    </div>

                    {currentUser && savedVehicles.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Chọn xe đã lưu của bạn</label>
                        <select
                          id="saved-vehicle-selector"
                          value={selectedSavedVehicleId}
                          onChange={(e) => handleSavedVehicleChange(e.target.value)}
                          className="w-full p-3 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-sm font-medium bg-white cursor-pointer"
                        >
                          <option value="manual">-- Nhập thủ công xe khác --</option>
                          {savedVehicles.map((v) => (
                            <option key={v.id} value={v.id.toString()}>
                              {v.name || 'Không tên'} ({v.licensePlate}) - {v.vehicleType}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Biển số xe của bạn</label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          id="license-plate-input"
                          type="text"
                          placeholder="Ví dụ: 30A-123.45 hoặc 59-X3 999.99"
                          value={licensePlate}
                          disabled={selectedSavedVehicleId !== 'manual'}
                          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                          className={`w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-sm font-medium placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed uppercase font-mono ${
                            errors.licensePlate ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''
                          }`}
                        />
                      </div>
                      {errors.licensePlate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.licensePlate}</p>}
                    </div>
                  </div>
                </div>

                {/* Additional detailed notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Ghi chú thêm (Nếu có)</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                    <textarea
                      id="booking-notes-input"
                      rows={2}
                      placeholder="Nhập ghi chú yêu cầu bổ sung ví dụ: sơn xước nhẹ gầm sau, dọn kỹ ghế lái xe..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Buttons control */}
          <div className="flex justify-between items-center border-t border-slate-100 mt-8 pt-6 select-none">
            <button
              type="button"
              id="btn-prev-step"
              onClick={handlePrevStep}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                step === 1
                  ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 border border-slate-100 hover:bg-slate-50'
              }`}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>

            {step < 4 ? (
              <button
                type="button"
                id="btn-next-step"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-100 hover:-translate-y-0.5 transition-all duration-300"
              >
                Tiếp tục
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-booking"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-sky-100 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Xác Nhận Đặt Lịch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Receipt & Summary Sidebar */}
      <div className="lg:col-span-4 bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-lg sticky top-36">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-200/60 pb-3">
          Tóm Tắt Khung Hẹn Đặt Lịch
        </h3>

        {/* Selected parameters list */}
        <div className="space-y-4 text-xs">
          {/* Vehicle summary */}
          <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3">
            <div>
              <span className="text-slate-400 uppercase font-black text-[9px] tracking-wider block">Phân khúc xe</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{currentVehicleDetail.name}</span>
            </div>
            <span className="text-sky-600 font-extrabold bg-sky-50 px-2 py-0.5 rounded-sm">x{currentVehicleDetail.priceMultiplier}</span>
          </div>

          {/* Wash package summary */}
          <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3">
            <div>
              <span className="text-slate-400 uppercase font-black text-[9px] tracking-wider block">Gói rửa cốt lõi</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{currentServiceDetail.name}</span>
            </div>
            <span className="font-extrabold text-slate-700">{formatPrice(currentServiceDetail.basePrice)}</span>
          </div>

          {/* Add-ons list summary */}
          {selectedAddOns.length > 0 ? (
            <div className="border-b border-dashed border-slate-200 pb-3">
              <span className="text-slate-400 uppercase font-black text-[9px] tracking-wider block mb-1.5">Nâng cấp thêm</span>
              <div className="space-y-1.5">
                {selectedAddOns.map((addOnId) => {
                  const opt = ADD_ON_SERVICES.find(a => a.id === addOnId);
                  if (!opt) return null;
                  return (
                    <div key={opt.id} className="flex justify-between items-center text-slate-600">
                      <span>• {opt.name}</span>
                      <span className="font-bold text-slate-800">{formatPrice(opt.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-b border-dashed border-slate-200 pb-3 text-slate-400 italic font-medium">
              Chưa kích hoạt các dịch vụ chăm sóc nâng cấp.
            </div>
          )}

          {/* Scheduled date & time */}
          <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100 flex gap-3">
            <Calendar className="w-5 h-5 text-sky-500 mt-0.5" />
            <div>
              <span className="text-slate-400 font-extrabold text-[9px] uppercase block">Thời gian và Ngày đặt</span>
              <span className="font-bold text-sky-800 text-xs">
                {bookingDate ? `${bookingDate.split('-').reverse().join('/')}` : '--/--'}
              </span>
              <span className="font-medium text-sky-800 text-xs block mt-0.5">
                {bookingTime ? `Khung giờ: ${bookingTime}` : 'Chưa chọn giờ'}
              </span>
            </div>
          </div>

          {/* TOTAL INVOICE AND ESTIMATION */}
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md space-y-2 mt-4">
            <span className="uppercase text-[9px] font-black tracking-widest text-sky-200 block">Tổng thanh toán dự kiến</span>
            <div className="flex justify-between items-baseline">

{/* <span className="text-2xl font-extrabold tracking-tight">{formatPrice(totalCost)}</span>*/}


             <div className="flex items-baseline gap-2">
               <span className="text-2xl font-extrabold tracking-tight">
                 {loadingPrice ? 'Đang tính...' : formatPrice(totalCost)}
               </span>
               {aiMultiplier !== null && (
                 <span className="text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">
                   🤖 AI x{aiMultiplier.toFixed(2)}
                 </span>
               )}
             </div>
              <span className="text-[10px] text-sky-100 font-medium">Đã bao gồm VAT</span>
            </div>
            <p className="text-[9px] text-sky-100/95 leading-relaxed pt-1.5 border-t border-white/20 select-none">
              * Thanh toán linh hoạt tại garage bằng Tiền mặt, Chuyển khoản QR code, hoặc Thẻ tín dụng sau khi nhận bàn giao xe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
