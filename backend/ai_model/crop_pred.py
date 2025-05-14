from flask import Flask, request, jsonify
import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression

app = Flask(__name__)

# Load the pre-trained model

with open('model.pkl', 'rb') as f:
    LogReg = pickle.load(f)


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        input_data = request.get_json()
        
        # Extract values and convert to numpy array
        # Expected input format: 
        # {
        #   "data": [104, 18, 30, 23.603016, 60.3, 6.7, 140.91]
        # }
        if not input_data or 'data' not in input_data:
            return jsonify({'error': 'No data provided or wrong format'}), 400
            
        data_list = input_data['data']
        if len(data_list) != 7:
            return jsonify({'error': 'Input must contain exactly 7 values'}), 400
            
        # Convert to numpy array and reshape for prediction
        data = np.array([data_list])
        
        # Make prediction
        # prediction = LogReg.predict(data)
        proba = LogReg.predict_proba(data)[0]
        top3_idx = np.argsort(proba)[-3:][::-1]
        top3_crops = [(LogReg.classes_[i], proba[i]) for i in top3_idx]

        # print("Top 3 Predicted Crops:")
        print('helloooo', top3_crops)
        # for crop, prob in top3_crops:
        #     print(f"{crop}: {prob:.2%}")
        
        # Convert prediction to string and return
        return jsonify({
            '1': str(top3_crops[0]),
            '2': str(top3_crops[1]),
            '3': str(top3_crops[2]),
            
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)