import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Mail, Phone, Award, Star, Calendar, 
  Shield, Edit2, Save, X, Loader2, Car, Sparkles, Check, Info,
  Bike, Truck, Trash2, Plus, Gift
} from 'lucide-react';
import { User, LoyaltyInfo, VehicleType, CustomerVehicle } from '../types';
import api from '../api';

interface UserProfileProps {
  currentUser: any;
  onProfileUpdated?: (updatedCustomer: any) => void;
}

export default function UserProfile({ currentUser, onProfileUpdated }: UserProfileProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editLicensePlate, setEditLicensePlate] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Vehicle states
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(true);
  const [isAddingVehicle, setIsAddingVehicle] = useState<boolean>(false);
  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  
  // Vehicle form states
  const [vehicleName, setVehicleName] = useState<string>('');
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.SEDAN);
  const [isSavingVehicle, setIsSavingVehicle] = useState<boolean>(false);

  // Rewards states & list
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedGift, setRedeemedGift] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [confirmRedeemReward, setConfirmRedeemReward] = useState<any | null>(null);

  const rewards = [
    { id: 1, name: 'Miễn phí Nước uống', points: 50, code: 'FREECOFFEE', desc: 'Nhận 1 chai nước suối hoặc cafe miễn phí tại quầy chờ rửa xe.' },
    { id: 2, name: 'Voucher Giảm 20.000đ', points: 200, code: 'AUTOCLEAN20K', desc: 'Mã giảm giá 20k áp dụng cho tất cả các gói dịch vụ rửa xe.' },
    { id: 3, name: 'Phủ Sáp Bóng Lốp Cao Cấp', points: 350, code: 'TIREWAX350', desc: 'Tặng thêm dịch vụ dưỡng lốp và phủ sáp bóng lốp chuyên sâu.' },
    { id: 4, name: 'Khử Mùi Nano Diệt Khuẩn', points: 500, code: 'NANOCLEAN500', desc: 'Tặng kèm 1 lần xông tinh dầu khử mùi Nano cao cấp trong xe.' },
    { id: 5, name: 'Voucher Giảm 100.000đ', points: 1000, code: 'AUTOCLEAN100K', desc: 'Mã giảm giá đặc biệt 100k áp dụng cho gói VIP Detailing.' },
  ];

  const handleRedeem = async (reward: any) => {
    try {
      setIsRedeeming(true);
      setError('');
      setSuccess('');
      const res = await api.post('/customer/loyalty/redeem', {
        points: reward.points,
        rewardId: reward.id
      });
      setLoyalty(res.data.data);
      setRedeemedGift(reward.name);
      setRedeemedCode(reward.code);
      setSuccess(`Đổi quà thành công! Bạn nhận được mã ưu đãi.`);
    } catch (err: any) {
      console.error('Failed to redeem reward', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi thưởng.');
    } finally {
      setIsRedeeming(false);
      setConfirmRedeemReward(null);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await api.get('/customer/vehicles');
      setVehicles(res.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingVehicles(true);
      setError('');
      // Fetch customer profile, loyalty & vehicles simultaneously
      const [profileRes, loyaltyRes, vehiclesRes] = await Promise.all([
        api.get('/customer/profile'),
        api.get('/customer/loyalty'),
        api.get('/customer/vehicles')
      ]);

      const profileData = profileRes.data.data;
      const loyaltyData = loyaltyRes.data.data;
      const vehiclesData = vehiclesRes.data.data || [];

      setProfile(profileData);
      setLoyalty(loyaltyData);
      setVehicles(vehiclesData);

      // Initialize form values
      setEditName(profileData.name || '');
      setEditPhone(profileData.phone || '');
      setEditLicensePlate(profileData.licensePlate || '');
    } catch (err: any) {
      console.error('Failed to fetch profile, loyalty or vehicles details', err);
      setError('Không thể tải thông tin hồ sơ thành công. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError('Họ và tên không được để trống.');
      return;
    }
    if (!editPhone.trim()) {
      setError('Số điện thoại không được để trống.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const res = await api.put('/customer/profile', {
        name: editName.trim(),
        phone: editPhone.trim(),
        licensePlate: editLicensePlate.trim() ? editLicensePlate.trim().toUpperCase() : null
      });

      setProfile(res.data.data);
      setSuccess('Cập nhật thông tin hồ sơ thành công!');
      setIsEditing(false);

      if (onProfileUpdated) {
        onProfileUpdated(res.data.data);
      }

      // Refresh loyalty details to ensure name / phone sync up
      const loyaltyRes = await api.get('/customer/loyalty');
      setLoyalty(loyaltyRes.data.data);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
      setEditLicensePlate(profile.licensePlate || '');
    }
    setIsEditing(false);
    setError('');
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleLicensePlate.trim()) {
      setError('Biển số xe không được để trống.');
      return;
    }

    try {
      setIsSavingVehicle(true);
      setError('');
      setSuccess('');

      const body = {
        name: vehicleName.trim() || null,
        licensePlate: vehicleLicensePlate.trim().toUpperCase(),
        vehicleType: vehicleType
      };

      if (editVehicleId !== null) {
        await api.put(`/customer/vehicles/${editVehicleId}`, body);
        setSuccess('Cập nhật phương tiện thành công!');
      } else {
        await api.post('/customer/vehicles', body);
        setSuccess('Thêm phương tiện mới thành công!');
      }

      setVehicleName('');
      setVehicleLicensePlate('');
      setVehicleType(VehicleType.SEDAN);
      setIsAddingVehicle(false);
      setEditVehicleId(null);

      await fetchVehicles();

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save vehicle', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin xe.');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleEditVehicleClick = (vehicle: CustomerVehicle) => {
    setEditVehicleId(vehicle.id);
    setVehicleName(vehicle.name || '');
    setVehicleLicensePlate(vehicle.licensePlate);
    setVehicleType(vehicle.vehicleType);
    setIsAddingVehicle(true);
    setError('');
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này không?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await api.delete(`/customer/vehicles/${id}`);
      setSuccess('Xóa phương tiện thành công!');
      
      await fetchVehicles();

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Failed to delete vehicle', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa phương tiện.');
    }
  };

  const handleCancelVehicleEdit = () => {
    setIsAddingVehicle(false);
    setEditVehicleId(null);
    setVehicleName('');
    setVehicleLicensePlate('');
    setVehicleType(VehicleType.SEDAN);
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case VehicleType.XE_MAY:
        return <Bike className="w-5 h-5 text-sky-500" />;
      case VehicleType.PICKUP:
        return <Truck className="w-5 h-5 text-sky-500" />;
      default:
        return <Car className="w-5 h-5 text-sky-500" />;
    }
  };

  const getVehicleTypeName = (type: VehicleType) => {
    switch (type) {
      case VehicleType.XE_MAY: return 'Xe máy, mô tô';
      case VehicleType.SEDAN: return 'Ô tô 4-5 chỗ (Sedan)';
      case VehicleType.SUV: return 'SUV/MPV 7 chỗ';
      case VehicleType.PICKUP: return 'Bán tải / Xe tải nhỏ';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-12 text-slate-500 space-y-4">
        <p>Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.</p>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-sky-600 transition-all"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  const getTierColor = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'SILVER': return 'from-slate-300 to-slate-400 text-slate-700';
      case 'GOLD': return 'from-yellow-300 to-yellow-500 text-yellow-900';
      case 'PLATINUM': return 'from-cyan-300 to-cyan-500 text-cyan-900';
      default: return 'from-amber-600 to-amber-700 text-amber-50'; // BRONZE
    }
  };

  const formattedDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN') 
    : currentUser?.createdAt 
      ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN')
      : 'Chưa cập nhật';

  // Calculate loyalty progress percentage
  const calculateProgress = () => {
    if (!loyalty) return 0;
    const currentPoints = loyalty.totalPoints || 0;
    const needed = loyalty.pointsToNextTier || 0;
    if (needed === 0) return 100; // Max tier
    const nextTierTotal = currentPoints + needed;
    return Math.min(100, Math.round((currentPoints / nextTierTotal) * 100));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Tổng quan tài khoản</span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hồ Sơ Của Tôi</h2>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs font-bold flex items-start gap-2 animate-pulse">
          <Info className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-2xl text-xs font-bold flex items-start gap-2 animate-bounce">
          <Check className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Tier Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-20"></div>
            
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 mt-4">
              <div className="w-full h-full bg-gradient-to-br from-sky-100 to-indigo-50 rounded-full flex items-center justify-center">
                <span className="text-4xl font-black text-sky-600">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-sm text-slate-500">{currentUser?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng thành viên'}</p>

            <div className={`mt-6 w-full rounded-2xl p-4 bg-gradient-to-r ${getTierColor(loyalty?.currentTier)} shadow-md`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Hạng Thành Viên</span>
                <Star className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{loyalty?.currentTier || 'BRONZE'}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details & Form */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Thông tin cá nhân
              </h4>
              
              {!isEditing && (
                <button
                  type="button"
                  id="btn-edit-profile-toggle"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="profile-edit-name"
                        type="text"
                        required
                        disabled={isSaving}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="profile-edit-phone"
                        type="tel"
                        required
                        disabled={isSaving}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0987654321"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biển số xe mặc định</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="profile-edit-license-plate"
                        type="text"
                        disabled={isSaving}
                        value={editLicensePlate}
                        onChange={(e) => setEditLicensePlate(e.target.value.toUpperCase())}
                        placeholder="Ví dụ: 30A-123.45 hoặc 29K1-999.99"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium font-mono uppercase tracking-wider"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Biển số xe này sẽ tự động điền vào đơn đặt lịch rửa xe của bạn.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    id="btn-profile-edit-cancel"
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-250 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    id="btn-profile-edit-save"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md shadow-sky-50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Họ và tên</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <UserIcon className="w-4 h-4 text-sky-500" />
                    {profile.name}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Email</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Mail className="w-4 h-4 text-sky-500" />
                    {profile.email}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Số điện thoại</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Phone className="w-4 h-4 text-sky-500" />
                    {profile.phone || <span className="text-slate-400 font-medium italic">Chưa cập nhật</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Biển số xe mặc định</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Car className="w-4 h-4 text-sky-500" />
                    {profile.licensePlate ? (
                      <span className="font-mono bg-sky-50 border border-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-extrabold">
                        {profile.licensePlate}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic">Chưa cập nhật</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Ngày tham gia</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    {formattedDate}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loyalty & Wash History Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 mb-2">Điểm Tích Luỹ</h4>
                <div className="text-4xl font-black">{loyalty?.totalPoints || 0} <span className="text-lg font-medium opacity-80">pts</span></div>
              </div>
              <p className="text-[10px] text-indigo-150 mt-4 leading-relaxed font-medium">Dùng điểm để quy đổi voucher hoặc nhận các đặc quyền dịch vụ miễn phí.</p>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-3xl p-6 text-white shadow-xl shadow-sky-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-sky-200 mb-2">Số lần rửa xe</h4>
                <div className="text-4xl font-black">{loyalty?.totalWashes || 0} <span className="text-lg font-medium opacity-80">lần</span></div>
              </div>
              <p className="text-[10px] text-sky-150 mt-4 leading-relaxed font-medium">Rửa xe càng nhiều, cơ hội nâng hạng thành viên nhanh hơn.</p>
            </div>
          </div>

          {/* Loyalty Progress Bar Integration */}
          {loyalty && (
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Lộ trình nâng hạng
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Theo dõi chặng đường thăng tiến của bạn</p>
                </div>
                {loyalty.nextTier ? (
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">
                    Tiếp theo: {loyalty.nextTier}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    Hạng tối đa đạt được
                  </span>
                )}
              </div>

              {loyalty.nextTier ? (
                <div className="space-y-2">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Hạng {loyalty.currentTier} ({loyalty.totalPoints} pts)</span>
                    <span>{calculateProgress()}%</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 pt-1 leading-relaxed">
                    💡 Bạn chỉ cần tích lũy thêm <span className="font-extrabold text-sky-600">{loyalty.pointsToNextTier} điểm</span> nữa để được nâng lên hạng thành viên <span className="font-extrabold text-indigo-600">{loyalty.nextTier}</span> và hưởng các đặc quyền chiết khấu lớn hơn.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
                    Chúc mừng bạn!
                  </div>
                  <p className="leading-relaxed">Bạn đã đạt hạng thành viên cao nhất **PLATINUM**. AutoClean trân quý mọi sự đồng hành của bạn với dịch vụ chăm sóc xe tốt nhất của chúng tôi!</p>
                </div>
              )}
            </div>
          )}

          {/* LOYALTY REWARDS REDEMPTION PANEL */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 space-y-6">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Gift className="w-4.5 h-4.5 text-sky-500" />
                Đổi quà & Ưu đãi tích điểm
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">Sử dụng điểm tích luỹ của bạn để nhận mã giảm giá và dịch vụ miễn phí</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r) => {
                const userPoints = loyalty?.totalPoints || 0;
                const canRedeem = userPoints >= r.points;
                return (
                  <div 
                    key={r.id} 
                    className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3 transition-colors duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{r.name}</span>
                        <span className="shrink-0 bg-sky-150 text-sky-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {r.points} pts
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                    </div>

                    <button
                      type="button"
                      disabled={!canRedeem || isRedeeming}
                      onClick={() => setConfirmRedeemReward(r)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                        canRedeem 
                          ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Đổi Ưu Đãi' : `Cần thêm ${r.points - userPoints} pts`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VEHICLES SECTION */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Danh sách xe của tôi
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Quản lý các phương tiện dùng để đặt lịch nhanh</p>
              </div>

              {!isAddingVehicle && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingVehicle(true);
                    setEditVehicleId(null);
                    setVehicleName('');
                    setVehicleLicensePlate('');
                    setVehicleType(VehicleType.SEDAN);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all cursor-pointer"
                >
                  Thêm xe mới
                </button>
              )}
            </div>

            {isAddingVehicle && (
              <form onSubmit={handleSaveVehicle} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4 animate-fade-in-up">
                <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {editVehicleId !== null ? 'Cập nhật phương tiện' : 'Thêm phương tiện mới'}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên gợi nhớ (Tùy chọn)</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      placeholder="Ví dụ: Vios của tôi, Xe Wave..."
                      className="w-full px-3 py-2 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Biển số xe</label>
                    <input
                      type="text"
                      required
                      value={vehicleLicensePlate}
                      onChange={(e) => setVehicleLicensePlate(e.target.value.toUpperCase())}
                      placeholder="Ví dụ: 30A-123.45"
                      className="w-full px-3 py-2 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium font-mono uppercase tracking-wider"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phân khúc xe</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                      className="w-full px-3 py-2 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium bg-white"
                    >
                      <option value={VehicleType.XE_MAY}>Xe máy, mô tô</option>
                      <option value={VehicleType.SEDAN}>Ô tô 4-5 chỗ (Sedan)</option>
                      <option value={VehicleType.SUV}>SUV/MPV 7 chỗ</option>
                      <option value={VehicleType.PICKUP}>Bán tải / Xe tải nhỏ</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={handleCancelVehicleEdit}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white hover:bg-slate-100 border border-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingVehicle}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md shadow-sky-50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingVehicle ? 'Đang lưu...' : (editVehicleId !== null ? 'Cập nhật' : 'Lưu xe')}
                  </button>
                </div>
              </form>
            )}

            {loadingVehicles ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs italic select-none">
                Bạn chưa lưu phương tiện nào. Hãy thêm xe mới để đặt lịch nhanh hơn!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-sky-100 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-slate-800 text-sm">
                          {v.name || <span className="text-slate-400 font-medium italic text-xs">Không có tên gợi nhớ</span>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono bg-sky-50 border border-sky-100 text-sky-800 px-2 py-0.2 rounded text-[10px] uppercase tracking-wider font-extrabold">
                            {v.licensePlate}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">• {getVehicleTypeName(v.vehicleType)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 select-none">
                      <button
                        type="button"
                        onClick={() => handleEditVehicleClick(v)}
                        className="px-2 py-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all cursor-pointer"
                        title="Chỉnh sửa xe"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="px-2 py-1 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Xóa xe"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Redeemed Reward success modal */}
      {redeemedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-sky-100 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Đổi Quà Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">Bạn đã đổi thành công **{redeemedGift}**</p>
            </div>
            <div className="w-full bg-slate-50 border border-dashed border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mã Ưu Đãi Của Bạn</span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-lg font-black text-sky-600 select-all tracking-wider">{redeemedCode}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Hãy copy mã này và nhập vào phần **Ghi chú** khi tạo đơn đặt lịch tiếp theo để nhân viên áp dụng cho bạn nhé!</p>
            <button
              onClick={() => {
                setRedeemedCode(null);
                setRedeemedGift('');
              }}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-100 transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Custom Redemption Confirmation Modal */}
      {confirmRedeemReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-sky-100 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-sky-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Xác Nhận Đổi Quà</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Bạn có chắc chắn muốn dùng <span className="font-extrabold text-sky-600">{confirmRedeemReward.points} điểm</span> để đổi ưu đãi **"{confirmRedeemReward.name}"** không?
              </p>
            </div>
            <div className="flex w-full gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRedeemReward(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isRedeeming}
                onClick={() => handleRedeem(confirmRedeemReward)}
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-100 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
