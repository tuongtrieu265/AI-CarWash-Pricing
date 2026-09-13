import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

print("=" * 60)
print("BAT DAU TRAIN MODEL AI")
print("=" * 60)

# ===== 1. DOC DU LIEU =====
print("\n[1/5] Doc du lieu tu car_wash_data.csv...")
df = pd.read_csv('car_wash_data.csv')
print(f"   -> Da doc {len(df)} ban ghi")
print(f"   -> Cac cot: {list(df.columns)}")

# ===== 2. TACH FEATURES VA TARGET =====
print("\n[2/5] Tach Features (X) va Target (y)...")
X = df[['car_type', 'hour', 'day_of_week']]
y = df['multiplier']  # Target la HE SO GIA
print(f"   -> X shape: {X.shape}")
print(f"   -> y shape: {y.shape}")

# ===== 3. TIEN XU LY =====
print("\n[3/5] Tien xu ly du lieu...")
# Encode cot 'car_type' (chu -> so)
# 'hour' va 'day_of_week' da la so nen giu nguyen
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['car_type'])
    ],
    remainder='passthrough'  # Giu nguyen hour, day_of_week
)

# ===== 4. TAO PIPELINE: TIEN XU LY -> RANDOM FOREST =====
print("\n[4/5] Tao Pipeline (Preprocessor -> RandomForest)...")
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(
        n_estimators=100,      # 100 cay quyet dinh
        max_depth=15,          # Do sau toi da
        random_state=42,
        n_jobs=-1              # Dung tat ca CPU
    ))
])

# ===== 5. CHIA DU LIEU TRAIN/TEST =====
print("\n[5/5] Chia du lieu Train/Test (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"   -> Train: {len(X_train)} ban ghi")
print(f"   -> Test:  {len(X_test)} ban ghi")

# ===== 6. TRAIN MODEL =====
print("\n" + "=" * 60)
print("DANG TRAIN MODEL... (co the mat 10-30 giay)")
print("=" * 60)
model.fit(X_train, y_train)
print(" Train xong!")

# ===== 7. DANH GIA MODEL =====
print("\n" + "=" * 60)
print("DANH GIA MODEL")
print("=" * 60)
y_pred = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\n Ket qua:")
print(f"   RMSE (Root Mean Squared Error): {rmse:.4f}")
print(f"   MAE  (Mean Absolute Error):     {mae:.4f}")
print(f"   R²   (R-squared Score):         {r2:.4f}")

# Danh gia chat luong
print(f"\n Danh gia:")
if r2 >= 0.95:
    print(f"    XUAT SAC! R² = {r2:.4f} >= 0.95")
elif r2 >= 0.90:
    print(f"    TOT! R² = {r2:.4f} >= 0.90")
elif r2 >= 0.80:
    print(f"    KHA. R² = {r2:.4f}")
else:
    print(f"    CAN CAI THIEN. R² = {r2:.4f}")

# ===== 8. TEST THU VOI 1 SO CASE =====
print("\n" + "=" * 60)
print("TEST THU VOI CAC CASE CU THE")
print("=" * 60)

test_cases = [
    {'car_type': 'SEDAN',  'hour': 9,  'day_of_week': 5, 'expected': 1.56, 'note': 'Sedan, 9h sang Thu 7 (cao diem + cuoi tuan)'},
    {'car_type': 'XE_MAY', 'hour': 22, 'day_of_week': 2, 'expected': 0.45, 'note': 'Xe may, 22h Thu 3 (vang khach)'},
    {'car_type': 'SUV',    'hour': 8,  'day_of_week': 6, 'expected': 1.95, 'note': 'SUV, 8h sang Chu nhat (cao diem + cuoi tuan)'},
    {'car_type': 'PICKUP', 'hour': 14, 'day_of_week': 3, 'expected': 1.40, 'note': 'Pickup, 14h Thu 4 (binh thuong)'},
]

for i, case in enumerate(test_cases, 1):
    input_df = pd.DataFrame([{
        'car_type': case['car_type'],
        'hour': case['hour'],
        'day_of_week': case['day_of_week']
    }])
    pred = model.predict(input_df)[0]
    print(f"\n   Case {i}: {case['note']}")
    print(f"      Du doan: {pred:.3f}  |  Ky vong: ~{case['expected']}")

# ===== 9. LUU MODEL =====
print("\n" + "=" * 60)
print("LUU MODEL")
print("=" * 60)
joblib.dump(model, 'price_model.pkl')
print(" Da luu model vao file: price_model.pkl")

# Kiem tra file da luu chua
import os
if os.path.exists('price_model.pkl'):
    size_kb = os.path.getsize('price_model.pkl') / 1024
    print(f"   -> Kich thuoc file: {size_kb:.2f} KB")

print("\n" + "=" * 60)
print(" HOAN THANH! BUOC TIEP THEO LA TAO FASTAPI (main.py)")
print("=" * 60)