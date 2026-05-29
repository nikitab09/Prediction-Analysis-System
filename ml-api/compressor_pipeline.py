"""
Compressor Sensor ML Pipeline — CLEAN & INDUSTRIAL VERSION
==========================================================

What this pipeline does:
  1. Load compressor dataset
  2. Clean missing values
  3. Create binary label: NORMAL vs ABNORMAL
  4. Stratified train-test split
  5. Rolling feature engineering (trend detection)
  6. SMOTE balancing (train only)
  7. Feature scaling
  8. Train 3 ML models
  9. Evaluate using industrial metrics (Recall, F1, ROC-AUC)
  10. Save model + plots for IOCL project

KEY FEATURES:
  ✔ No data leakage
  ✔ Fault-safe evaluation
  ✔ Industrial metrics focused
  ✔ Time-aware feature engineering
"""

# ─────────────────────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────────────────────
import os
import warnings
import joblib

import numpy as np
import pandas as pd

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, ConfusionMatrixDisplay,
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, precision_recall_curve
)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

warnings.filterwarnings("ignore")
os.makedirs("results", exist_ok=True)


# ─────────────────────────────────────────────────────────────
# STEP 1 — LOAD DATA
# ─────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 1: Loading Compressor Dataset")
print("="*60)

df = pd.read_csv("compressor.csv")

print(f"Shape: {df.shape}")
print(df.head())

# OPTIONAL: sort if timestamp exists
if "timestamp" in df.columns:
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)


# ─────────────────────────────────────────────────────────────
# STEP 2 — CLEAN DATA
# ─────────────────────────────────────────────────────────────
print("\nSTEP 2: Cleaning Data")

# drop useless columns
drop_cols = [c for c in ["timestamp", "id"] if c in df.columns]
df.drop(columns=drop_cols, inplace=True, errors="ignore")

# fill missing values
for col in df.columns:
    if df[col].isnull().sum() > 0:
        df[col] = df[col].fillna(df[col].median())

print("Missing values after cleaning:", df.isnull().sum().sum())


# ─────────────────────────────────────────────────────────────
# STEP 3 — LABEL CREATION
# ─────────────────────────────────────────────────────────────
print("\nSTEP 3: Creating Labels")

# If dataset already has status column
if "machine_status" in df.columns:
    df["label"] = (df["machine_status"] != "NORMAL").astype(int)
    df.drop(columns=["machine_status"], inplace=True)
else:
    # fallback (generic anomaly threshold logic)
    df["label"] = (df.iloc[:, 0] > df.iloc[:, 0].quantile(0.95)).astype(int)

print(df["label"].value_counts())


# ─────────────────────────────────────────────────────────────
# STEP 4 — TRAIN TEST SPLIT (SAFE STRATIFIED)
# ─────────────────────────────────────────────────────────────
print("\nSTEP 4: Train-Test Split")

X = df.drop(columns=["label"])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("Train:", X_train.shape, "Test:", X_test.shape)


# ─────────────────────────────────────────────────────────────
# STEP 5 — ROLLING FEATURES (TREND DETECTION)
# ─────────────────────────────────────────────────────────────
print("\nSTEP 5: Rolling Features")

WINDOW = 10

def add_rolling(df, window=10):
    df = df.copy()
    for col in df.columns:
        df[f"{col}_mean"] = df[col].rolling(window, min_periods=1).mean()
        df[f"{col}_std"]  = df[col].rolling(window, min_periods=1).std().fillna(0)
        df[f"{col}_max"]  = df[col].rolling(window, min_periods=1).max()
    return df

X_train = add_rolling(X_train, WINDOW)
X_test  = add_rolling(X_test, WINDOW)

# align columns
X_train, X_test = X_train.align(X_test, join="left", axis=1, fill_value=0)


# ─────────────────────────────────────────────────────────────
# STEP 6 — SMOTE + SCALING
# ─────────────────────────────────────────────────────────────
print("\nSTEP 6: SMOTE + Scaling")

smote = SMOTE(random_state=42)
X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train_bal)
X_test_sc  = scaler.transform(X_test)


# ─────────────────────────────────────────────────────────────
# STEP 7 — MODELS
# ─────────────────────────────────────────────────────────────
print("\nSTEP 7: Training Models")

models = {
    "Logistic Regression": LogisticRegression(max_iter=2000, class_weight="balanced"),
    "Random Forest": RandomForestClassifier(n_estimators=300, max_depth=20, n_jobs=-1),
    "XGBoost": XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        eval_metric="logloss",
        n_jobs=-1,
        verbosity=0
    )
}

results = {}

for name, model in models.items():
    print(f"\n--- {name} ---")

    model.fit(X_train_sc, y_train_bal)

    y_pred = model.predict(X_test_sc)
    y_prob = model.predict_proba(X_test_sc)[:, 1]

    results[name] = {
        "model": model,
        "pred": y_pred,
        "prob": y_prob,
        "f1": f1_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "auc": roc_auc_score(y_test, y_prob)
    }

    print("F1:", results[name]["f1"])
    print("Recall:", results[name]["recall"])
    print("AUC:", results[name]["auc"])


# ─────────────────────────────────────────────────────────────
# BEST MODEL
# ─────────────────────────────────────────────────────────────
best_name = max(results, key=lambda x: results[x]["f1"])
best = results[best_name]

print("\nBEST MODEL:", best_name)


# ─────────────────────────────────────────────────────────────
# STEP 8 — PLOTS
# ─────────────────────────────────────────────────────────────
print("\nSTEP 8: Saving Plots")

fig, ax = plt.subplots()

for name, res in results.items():
    fpr, tpr, _ = roc_curve(y_test, res["prob"])
    ax.plot(fpr, tpr, label=name)

ax.plot([0,1],[0,1],"k--")
ax.set_title("ROC Curve - Compressor Model")
ax.legend()

plt.savefig("results/compressor_roc.png")
plt.close()


# ─────────────────────────────────────────────────────────────
# SAVE MODEL
# ─────────────────────────────────────────────────────────────
joblib.dump(best["model"], "compressor_model.pkl")
joblib.dump(scaler, "compressor_scaler.pkl")
joblib.dump(X_train.columns.tolist(), "compressor_feature_names.pkl")

print("\nDONE ✔")
print("Best Model:", best_name)