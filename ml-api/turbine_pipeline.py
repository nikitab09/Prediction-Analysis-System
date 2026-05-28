"""
Turbine Sensor ML Pipeline — INDUSTRIAL VERSION
================================================
Sensors:
AT, AP, AH, AFDP, GTEP, TIT, TAT, TEY, CDP, CO, NOX
"""

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
    roc_auc_score, roc_curve,
    average_precision_score, precision_recall_curve
)

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

warnings.filterwarnings("ignore")
os.makedirs("results", exist_ok=True)


# ═══════════════════════════════════════════════════════
# STEP 1 — LOAD DATA
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 1: Loading Turbine Dataset")
print("="*60)

df = pd.read_csv("merged_turbine_dataset.csv")

print("Shape:", df.shape)
print("\nColumns:\n", df.columns.tolist())


# ═══════════════════════════════════════════════════════
# STEP 2 — CLEAN
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 2: Cleaning Data")
print("="*60)

df = df.dropna()

print("Missing values:", df.isnull().sum().sum())


# ═══════════════════════════════════════════════════════
# STEP 3 — CREATE LABEL (ANOMALY STYLE)
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 3: Creating Label")
print("="*60)

# OPTION: anomaly detection using TEY deviation
threshold = df["TEY"].quantile(0.90)

df["label"] = (df["TEY"] > threshold).astype(int)

print(df["label"].value_counts())


# ═══════════════════════════════════════════════════════
# STEP 4 — TRAIN TEST SPLIT
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 4: Train/Test Split")
print("="*60)

X = df.drop(columns=["label"])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("Train:", X_train.shape)
print("Test :", X_test.shape)


# ═══════════════════════════════════════════════════════
# STEP 5 — ROLLING FEATURES
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 5: Rolling Features")
print("="*60)

WINDOW = 5

def rolling(df):
    d = df.copy()
    for col in df.columns:
        d[f"{col}_mean"] = df[col].rolling(WINDOW, min_periods=1).mean()
        d[f"{col}_std"] = df[col].rolling(WINDOW, min_periods=1).std().fillna(0)
        d[f"{col}_max"] = df[col].rolling(WINDOW, min_periods=1).max()
    return d

X_train = rolling(X_train)
X_test = rolling(X_test)

feature_names = X_train.columns.tolist()


# ═══════════════════════════════════════════════════════
# STEP 6 — SMOTE + SCALING
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 6: SMOTE + Scaling")
print("="*60)

smote = SMOTE(random_state=42)

if len(np.unique(y_train)) > 1:
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
else:
    X_train_bal, y_train_bal = X_train, y_train

scaler = StandardScaler()

X_train_sc = scaler.fit_transform(X_train_bal)
X_test_sc = scaler.transform(X_test)


# ═══════════════════════════════════════════════════════
# STEP 7 — MODELS
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print("STEP 7: Training Models")
print("="*60)

models = {
    "Logistic Regression": LogisticRegression(max_iter=2000),
    "Random Forest": RandomForestClassifier(n_estimators=200),
    "XGBoost": XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        eval_metric="logloss"
    )
}

results = {}

for name, model in models.items():
    print("\n---", name)

    model.fit(X_train_sc, y_train_bal)

    y_pred = model.predict(X_test_sc)

    try:
        y_prob = model.predict_proba(X_test_sc)[:, 1]
    except:
        y_prob = y_pred

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    auc = roc_auc_score(y_test, y_prob)

    results[name] = {
        "model": model,
        "y_pred": y_pred,
        "y_prob": y_prob,
        "f1": f1,
        "auc": auc,
        "acc": acc,
        "prec": prec,
        "rec": rec
    }

    print(f"F1: {f1:.4f} | Recall: {rec:.4f} | AUC: {auc:.4f}")


# ═══════════════════════════════════════════════════════
# STEP 8 — BEST MODEL
# ═══════════════════════════════════════════════════════
best_name = max(results, key=lambda x: results[x]["f1"])
best = results[best_name]

print("\nBEST MODEL:", best_name)


print(classification_report(y_test, best["y_pred"]))


# ═══════════════════════════════════════════════════════
# STEP 9 — SAVE MODEL
# ═══════════════════════════════════════════════════════
joblib.dump(best["model"], "turbine_model.pkl")
joblib.dump(scaler, "turbine_scaler.pkl")
joblib.dump(feature_names, "turbine_features.pkl")

print("\nSaved turbine_model.pkl")