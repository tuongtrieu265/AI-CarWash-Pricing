import pandas as pd
import numpy as np
import random

# ===== CẤU HÌNH =====
NUM_RECORDS = 5000
random.seed(42)
np.random.seed(42)

#  QUAN TRỌNG: Dùng CHÍNH XÁC tên Enum từ Spring Boot
# (VehicleType.java của bạn: XE_MAY, SEDAN, SUV, PICKUP)
car_types = ['XE_MAY', 'SEDAN', 'SUV', 'PICKUP']

# Hệ số giá CƠ BẢN của từng loại xe (copy từ ảnh 2 - UI của bạn)
# Nhìn vào ảnh 2: Xe máy x0.5, Sedan x1, SUV x1.25, Xe tải x1.4
base_multipliers = {
    'XE_MAY': 0.5,
    'SEDAN':  1.0,
    'SUV':    1.25,
    'PICKUP': 1.4
}

# ===== SINH DỮ LIỆU =====
data = []
for _ in range(NUM_RECORDS):
    # 1. Chọn loại xe ngẫu nhiên
    car = random.choice(car_types)
    base_multiplier = base_multipliers[car]

    # 2. Chọn giờ (0-23)
    hour = random.randint(0, 23)

    # 3. Chọn ngày trong tuần (0=Thứ 2, 6=Chủ nhật)
    day_of_week = random.randint(0, 6)

    # 4. Logic tính HỆ SỐ GIÁ (ĐÂY LÀ LINH HỒN CỦA BÀI TOÁN)
    # Hệ số giờ cao điểm: 8h-10h và 15h-17h
    hour_multiplier = 1.0
    if (8 <= hour <= 10) or (15 <= hour <= 17):
        hour_multiplier = 1.2  # Cao điểm tăng 20%
    elif (hour < 7) or (hour > 20):
        hour_multiplier = 0.9  # Vắng khách giảm 10%

    # Hệ số cuối tuần: Thứ 7 (5) và Chủ nhật (6)
    day_multiplier = 1.0
    if day_of_week >= 5:
        day_multiplier = 1.3  # Cuối tuần tăng 30%

    # Thêm nhiễu ngẫu nhiên (để model không học vẹt)
    noise = np.random.uniform(0.97, 1.03)

    # HỆ SỐ CUỐI CÙNG (đây là thứ AI sẽ học để dự đoán)
    final_multiplier = base_multiplier * hour_multiplier * day_multiplier * noise
    final_multiplier = round(final_multiplier, 3)

    data.append({
        'car_type': car,
        'hour': hour,
        'day_of_week': day_of_week,
        'multiplier': final_multiplier  # Target là HỆ SỐ, không phải giá
    })

# ===== LƯU RA FILE CSV =====
df = pd.DataFrame(data)
df.to_csv('car_wash_data.csv', index=False)

# ===== IN KẾT QUẢ =====
print(f" Đã tạo {NUM_RECORDS} bản ghi. File: car_wash_data.csv")
print("\n Preview 5 dòng đầu:")
print(df.head())
print(f"\n Thống kê hệ số:")
print(f"   - Min: {df['multiplier'].min():.3f}")
print(f"   - Max: {df['multiplier'].max():.3f}")
print(f"   - Mean: {df['multiplier'].mean():.3f}")
print(f"\n Số lượng theo loại xe:")
print(df['car_type'].value_counts())