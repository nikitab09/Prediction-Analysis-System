from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

model = joblib.load("compressor_model.pkl")
scaler = joblib.load("compressor_scaler.pkl")

@app.route("/predict/compressor", methods=["POST"])
def predict():
    data = request.json

    X = np.array([list(data.values())])
    X = scaler.transform(X)

    pred = model.predict(X)[0]

    return jsonify({
        "status": "FAULTY" if pred == 1 else "HEALTHY"
    })

if __name__ == "__main__":
    app.run(debug=True)