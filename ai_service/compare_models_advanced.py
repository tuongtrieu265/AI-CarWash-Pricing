"""
So sánh 5 model cho bài toán Dynamic Pricing
Author: AutoClean AI Team
"""
import matplotlib
matplotlib.use('Agg')
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor

# ===== 1. LOAD DATA =====
print("=" * 70)
print("SO SÁNH 5 MODEL - DYNAMIC PRICING")
print("=" * 70)

df = pd.read_csv('car_wash_data.csv')
X = df[['car_type', 'hour', 'day_of_week']]
y = df['multiplier']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ===== 2. PREPROCESSOR =====
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['car_type'])
    ],
    remainder='passthrough'
)

# ===== 3. SO SÁNH 5 MODEL =====
models = {
    'Linear Regression': LinearRegression(),
    'Ridge Regression': Ridge(alpha=1.0),
    'Decision Tree': DecisionTreeRegressor(max_depth=15, random_state=42),
    'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42),
}

results = []

for name, algo in models.items():
    print(f"\n Đang train: {name}...")
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', algo)
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    results.append({
        'Model': name,
        'RMSE': round(rmse, 4),
        'MAE': round(mae, 4),
        'R²': round(r2, 4)
    })

    print(f" R² = {r2:.4f} | RMSE = {rmse:.4f}")

# ===== 4. IN BẢNG SO SÁNH =====
print("\n" + "=" * 70)
print(" BẢNG SO SÁNH KẾT QUẢ")
print("=" * 70)

results_df = pd.DataFrame(results).sort_values('R²', ascending=False)
print(results_df.to_string(index=False))

# Lưu CSV
results_df.to_csv('model_comparison.csv', index=False)

# ===== 5. TÌM MODEL TỐT NHẤT =====
best = results_df.iloc[0]
print(f"\n MODEL TỐT NHẤT: {best['Model']}")
print(f"   - R²:   {best['R²']}")
print(f"   - RMSE: {best['RMSE']}")
print(f"   - MAE:  {best['MAE']}")

# ===== 6. FEATURE IMPORTANCE (Random Forest) =====
print("\n" + "=" * 70)
print(" FEATURE IMPORTANCE - RANDOM FOREST")
print("=" * 70)

rf_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
])
rf_pipeline.fit(X_train, y_train)

# Lấy feature names sau khi encode
feature_names = list(
    rf_pipeline.named_steps['preprocessor']
    .named_transformers_['cat']
    .get_feature_names_out(['car_type'])
) + ['hour', 'day_of_week']

importances = rf_pipeline.named_steps['regressor'].feature_importances_

# Sắp xếp
sorted_idx = np.argsort(importances)
sorted_features = [feature_names[i] for i in sorted_idx]
sorted_importances = importances[sorted_idx]

print("\nFeature Importance:")
for feat, imp in zip(reversed(sorted_features), reversed(sorted_importances)):
    print(f"   {feat:20s} : {imp:.4f}")

# Vẽ biểu đồ
plt.figure(figsize=(10, 6))
plt.barh(sorted_features, sorted_importances, color='skyblue')
plt.xlabel('Importance', fontsize=12)
plt.title('Feature Importance - Random Forest', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=150)
print("\n Đã lưu biểu đồ: feature_importance.png")

# ===== 7. SO SÁNH CHI TIẾT =====
print("\n" + "=" * 70)
print(" PHÂN TÍCH CHI TIẾT")
print("=" * 70)

lr_r2 = results_df[results_df['Model'] == 'Linear Regression']['R²'].values[0]
rf_r2 = results_df[results_df['Model'] == 'Random Forest']['R²'].values[0]

print(f"\n1. Linear Regression (R² = {lr_r2}):")
print(f"   - Baseline đơn giản, dễ hiểu")
print(f"   - Không bắt được quan hệ phi tuyến")

print(f"\n2. Random Forest (R² = {rf_r2}):")
print(f"   - Ensemble của 100 cây quyết định")
print(f"   - Giảm overfitting")
print(f"   - Bắt được quan hệ phi tuyến")
print(f"   - ĐƯỢC CHỌN cho AutoClean")

print("\n" + "=" * 70)
print(" HOÀN THÀNH SO SÁNH!")
print("=" * 70)