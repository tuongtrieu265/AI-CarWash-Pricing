from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os

# ===== LOAD MODEL =====
print("=" * 60)
print("KHOI DONG AI SERVICE")
print("=" * 60)

if not os.path.exists('price_model.pkl'):
    raise FileNotFoundError("Khong tim thay price_model.pkl! Hay chay train_model.py truoc.")

model = joblib.load('price_model.pkl')
print(" Da load model: price_model.pkl")

# ===== KHOI TAO FASTAPI =====
app = FastAPI(
    title="AutoClean AI Service",
    description="AI Dynamic Pricing Service cho he thong rua xe AutoClean",
    version="1.0.0"
)

# Cho phep CORS (de Spring Boot goi duoc)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== DINH NGHIA SCHEMA =====
class PriceRequest(BaseModel):
    car_type: str = Field(..., description="Loai xe: XE_MAY, SEDAN, SUV, PICKUP")
    hour: int = Field(..., ge=0, le=23, description="Gio dat lich (0-23)")
    day_of_week: int = Field(..., ge=0, le=6, description="Ngay trong tuan (0=Thu 2, 6=Chu nhat)")

    class Config:
        json_schema_extra = {
            "example": {
                "car_type": "SEDAN",
                "hour": 9,
                "day_of_week": 5
            }
        }

class PriceResponse(BaseModel):
    multiplier: float = Field(..., description="He so gia AI du doan")
    base_multiplier: float = Field(..., description="He so goc cua loai xe")

# ===== HANG SO =====
VALID_CAR_TYPES = ['XE_MAY', 'SEDAN', 'SUV', 'PICKUP']
BASE_MULTIPLIERS = {
    'XE_MAY': 0.5,
    'SEDAN':  1.0,
    'SUV':    1.25,
    'PICKUP': 1.4
}

# ===== ENDPOINTS =====

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "service": "AutoClean AI Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Kiem tra service co hoat dong khong."""
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict-price", response_model=PriceResponse)
def predict_price(request: PriceRequest):
    """
    Du doan he so gia dua tren loai xe, gio, ngay.

    Returns:
        - multiplier: He so gia AI du doan (dung de nhan voi gia goi)
        - base_multiplier: He so goc cua loai xe (de tham khao)
    """
    # Validate car_type
    if request.car_type not in VALID_CAR_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"car_type khong hop le. Chi chap nhan: {VALID_CAR_TYPES}"
        )

    try:
        # Tao DataFrame tu input
        input_data = pd.DataFrame([{
            'car_type': request.car_type,
            'hour': request.hour,
            'day_of_week': request.day_of_week
        }])

        # Du doan
        prediction = model.predict(input_data)[0]
        prediction = round(float(prediction), 3)

        base = BASE_MULTIPLIERS.get(request.car_type, 1.0)

        # Log ra console de debug
        print(f"🤖 Predict: {request.car_type} | {request.hour}h | Thu {request.day_of_week + 2} "
              f"-> multiplier = {prediction} (base = {base})")

        return PriceResponse(
            multiplier=prediction,
            base_multiplier=base
        )

    except Exception as e:
        print(f" Loi khi du doan: {e}")
        raise HTTPException(status_code=500, detail=f"Loi AI service: {str(e)}")

@app.get("/info")
def get_info():
    """Tra ve thong tin ve model."""
    return {
        "model_type": "RandomForestRegressor",
        "n_estimators": 100,
        "features": ["car_type", "hour", "day_of_week"],
        "target": "multiplier",
        "valid_car_types": VALID_CAR_TYPES,
        "base_multipliers": BASE_MULTIPLIERS
    }

# ===== CHAY SERVER =====
if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print(" KHOI DONG FASTAPI SERVER")
    print("=" * 60)
    print("URL: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)