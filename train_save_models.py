"""
Train and save the ML models based on your notebook
Creates the actual model files needed for MedRoute system
"""

import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta

from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, accuracy_score, classification_report

from catboost import CatBoostClassifier, CatBoostRegressor
import warnings
warnings.filterwarnings("ignore")

def create_sample_dataset():
    """Create sample dataset matching your notebook structure"""
    diseases = ['Asthma', 'Stroke', 'Osteoporosis', 'Hypertension', 'Diabetes', 'Migraine',
                'Influenza', 'Pneumonia', 'Bronchitis', 'Common Cold', 'Depression']
    
    # Fixed probabilities that sum to 1.0
    probs = [0.066, 0.046, 0.040, 0.029, 0.029, 0.029,
             0.023, 0.023, 0.023, 0.017, 0.017]
    # Normalize to ensure they sum to 1.0
    probs = np.array(probs) / np.sum(probs)
    
    np.random.seed(42)
    n_samples = 349
    
    data = []
    for i in range(n_samples):
        disease = np.random.choice(diseases, p=probs)
        
        # Age based on disease patterns
        age_means = {'Asthma': 37, 'Stroke': 66, 'Osteoporosis': 55, 'Hypertension': 52,
                     'Diabetes': 47, 'Migraine': 41, 'Influenza': 33, 'Pneumonia': 41,
                     'Bronchitis': 44, 'Common Cold': 36, 'Depression': 40}
        age = int(np.random.normal(age_means.get(disease, 45), 10))
        age = max(19, min(90, age))
        
        # Symptoms based on disease
        fever = np.random.choice(['Yes', 'No'], p=[0.7, 0.3] if disease in ['Influenza', 'Pneumonia'] else [0.3, 0.7])
        cough = np.random.choice(['Yes', 'No'], p=[0.8, 0.2] if disease in ['Asthma', 'Bronchitis'] else [0.4, 0.6])
        fatigue = np.random.choice(['Yes', 'No'], p=[0.8, 0.2] if disease in ['Depression'] else [0.6, 0.4])
        difficulty_breathing = np.random.choice(['Yes', 'No'], p=[0.9, 0.1] if disease in ['Asthma', 'Pneumonia'] else [0.2, 0.8])
        
        gender = np.random.choice(['Male', 'Female'])
        bp = np.random.choice(['High', 'Normal', 'Low'], p=[0.48, 0.47, 0.05])
        cl = np.random.choice(['High', 'Normal', 'Low'], p=[0.48, 0.43, 0.09])
        
        # Outcome based on symptoms and age
        risk_factors = [fever == 'Yes', difficulty_breathing == 'Yes', age >= 65, bp == 'High']
        outcome = 'Positive' if sum(risk_factors) >= 2 else np.random.choice(['Positive', 'Negative'], p=[0.3, 0.7])
        
        data.append([disease, fever, cough, fatigue, difficulty_breathing, age, 
                    gender, bp, cl, outcome])
    
    columns = ['Disease', 'Fever', 'Cough', 'Fatigue', 'DB', 'Age', 
               'Gender', 'BP', 'CL', 'Results']
    
    return pd.DataFrame(data, columns=columns)

def prepare_symptom_features(df):
    """Prepare features exactly as in your notebook"""
    # Create feature combinations
    df["Fever_and_Cough"] = (df["Fever"] == "Yes") & (df["Cough"] == "Yes")
    df["Fever_and_Fatigue"] = (df["Fever"] == "Yes") & (df["Fatigue"] == "Yes")
    df["Fatigue_and_Cough"] = (df["Fatigue"] == "Yes") & (df["Cough"] == "Yes")
    df["Fever_and_Fatigue_and_Cough"] = (df['Fever'] == "Yes") & (df["Fatigue"] == "Yes") & (df["Cough"] == "Yes")
    
    # Disease frequency
    disease_counts = df["Disease"].value_counts()
    df["Disease_Frequency"] = df["Disease"].map(disease_counts)
    
    # Age groups
    bins = [0, 18, 65, float('inf')]
    labels = ['Child', 'Adult', 'Elderly']
    df['Age_Group'] = pd.cut(df['Age'], bins=bins, labels=labels, right=False)
    
    # Risk score
    df['Risk_Score'] = df['Age'] * 0.1 + (df['CL'] == 'High') * 10
    df["Age_Squared"] = df["Age"] ** 2
    
    return df

def encode_features(df):
    """Encode features as in your notebook"""
    # One-hot encoding
    dfd = pd.get_dummies(df, columns=['Fever', 'Cough', 'Fatigue', 'DB', 'BP', 'CL', 
                                     'Gender', 'Age_Group'], drop_first=True)
    
    # Label encoding for boolean features
    le = LabelEncoder()
    dfd['Results'] = le.fit_transform(dfd['Results'])
    dfd['Fever_and_Cough'] = le.fit_transform(dfd['Fever_and_Cough'])
    dfd['Fever_and_Fatigue'] = le.fit_transform(dfd['Fever_and_Fatigue'])
    dfd['Fatigue_and_Cough'] = le.fit_transform(dfd['Fatigue_and_Cough'])
    dfd['Fever_and_Fatigue_and_Cough'] = le.fit_transform(dfd['Fever_and_Fatigue_and_Cough'])
    
    # Drop disease column
    dfd.drop('Disease', axis=1, inplace=True)
    
    return dfd

def train_symptom_model():
    """Train CatBoost symptom model exactly as in your notebook"""
    print("Training symptom prediction model...")
    
    # Create and prepare dataset
    df = create_sample_dataset()
    df = prepare_symptom_features(df)
    dfd = encode_features(df)
    
    # Prepare features and target
    y = dfd['Results']
    X = dfd.drop('Results', axis=1)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale continuous features
    scaler = MinMaxScaler()
    continuous_features = ["Age", "Age_Squared", "Disease_Frequency", "Risk_Score"]
    X_scaled = X.copy()
    X_scaled[continuous_features] = scaler.fit_transform(X[continuous_features])
    
    # Split scaled data
    X_train_scaled = X_scaled.iloc[X_train.index]
    X_test_scaled = X_scaled.iloc[X_test.index]
    
    # Train CatBoost with best parameters from your notebook
    catboost = CatBoostClassifier(
        verbose=False, 
        random_state=42,
        depth=4,
        iterations=300,
        learning_rate=0.05
    )
    
    model = catboost.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Symptom Model Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))
    
    return model, scaler, X.columns.tolist()

def create_stay_length_data():
    """Create synthetic stay length data for training"""
    np.random.seed(42)
    n_samples = 500
    
    data = []
    for i in range(n_samples):
        age = np.random.randint(18, 90)
        gender = np.random.choice([0, 1])  # 0=Female, 1=Male
        severity = np.random.randint(1, 11)
        condition_positive = np.random.choice([0, 1])
        confidence = np.random.uniform(0.1, 0.9)
        difficulty_breathing = np.random.choice([0, 1])
        fever = np.random.choice([0, 1])
        high_bp = np.random.choice([0, 1])
        high_cholesterol = np.random.choice([0, 1])
        previous_admissions = np.random.randint(0, 5)
        
        # Calculate stay length based on factors
        base_hours = 4
        if condition_positive:
            base_hours += severity * 3
        if difficulty_breathing:
            base_hours += 8
        if age >= 65:
            base_hours += 6
        if fever:
            base_hours += 4
        if high_bp:
            base_hours += 2
        if previous_admissions > 0:
            base_hours += previous_admissions * 2
        
        # Add some noise
        stay_hours = max(1, base_hours + np.random.normal(0, 3))
        
        data.append([age, gender, severity, condition_positive, confidence,
                    difficulty_breathing, fever, high_bp, high_cholesterol,
                    previous_admissions, stay_hours])
    
    columns = ['age', 'gender', 'severity_score', 'condition_positive', 'confidence_positive',
               'difficulty_breathing', 'fever', 'high_bp', 'high_cholesterol', 
               'previous_admissions', 'stay_hours']
    
    return pd.DataFrame(data, columns=columns)

def train_stay_length_model():
    """Train stay length prediction model"""
    print("Training stay length prediction model...")
    
    # Create dataset
    df = create_stay_length_data()
    
    # Prepare features and target
    X = df.drop('stay_hours', axis=1)
    y = df['stay_hours']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train CatBoost Regressor
    catboost_reg = CatBoostRegressor(
        verbose=False,
        random_state=42,
        depth=6,
        iterations=200,
        learning_rate=0.1
    )
    
    model = catboost_reg.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Stay Length Model MAE: {mae:.4f} hours")
    
    return model, scaler

def save_models():
    """Train and save all models"""
    # Create models directory
    if not os.path.exists('models'):
        os.makedirs('models')
        print("Created models directory")
    
    # Train and save symptom model
    symptom_model, symptom_scaler, feature_names = train_symptom_model()
    
    joblib.dump(symptom_model, 'models/symptom_catboost_model.pkl')
    joblib.dump(symptom_scaler, 'models/symptom_feature_scaler.pkl')
    print("✅ Saved symptom_catboost_model.pkl and symptom_feature_scaler.pkl")
    
    # Save feature names for reference
    with open('models/symptom_feature_names.txt', 'w') as f:
        for feature in feature_names:
            f.write(f"{feature}\n")
    
    # Train and save stay length model
    stay_model, stay_scaler = train_stay_length_model()
    
    joblib.dump(stay_model, 'models/stay_length_model.pkl')
    joblib.dump(stay_scaler, 'models/stay_length_scaler.pkl')
    print("✅ Saved stay_length_model.pkl and stay_length_scaler.pkl")
    
    print("\n🎉 All models saved successfully!")
    print("Model files created:")
    print("- models/symptom_catboost_model.pkl")
    print("- models/symptom_feature_scaler.pkl") 
    print("- models/stay_length_model.pkl")
    print("- models/stay_length_scaler.pkl")

def test_models():
    """Test the saved models"""
    print("\nTesting saved models...")
    
    try:
        # Load models
        symptom_model = joblib.load('models/symptom_catboost_model.pkl')
        symptom_scaler = joblib.load('models/symptom_feature_scaler.pkl')
        stay_model = joblib.load('models/stay_length_model.pkl')
        stay_scaler = joblib.load('models/stay_length_scaler.pkl')
        
        # Test symptom model
        # Create test features (19 features as per your model)
        test_features = [
            45,     # Age (will be scaled)
            0, 1, 0, 0,  # fever_and combinations
            15,     # Disease_Frequency (will be scaled)
            4.5,    # Risk_Score (will be scaled)
            2025,   # Age_Squared (will be scaled)
            1, 0, 1, 1,  # symptoms
            0, 1, 0, 1,  # BP and CL
            1, 1, 0      # Gender and Age groups
        ]
        
        # Scale continuous features (first 4: Age, Disease_Frequency, Risk_Score, Age_Squared)
        continuous_part = symptom_scaler.transform([[45, 2025, 15, 4.5]])[0]
        final_features = list(continuous_part) + test_features[4:]
        
        symptom_pred = symptom_model.predict([final_features])[0]
        symptom_proba = symptom_model.predict_proba([final_features])[0]
        
        print(f"✅ Symptom model test - Prediction: {symptom_pred}, Probability: {symptom_proba}")
        
        # Test stay length model
        stay_features = [45, 1, 7, 1, 0.8, 1, 1, 0, 0, 1]  # 10 features
        stay_features_scaled = stay_scaler.transform([stay_features])
        stay_pred = stay_model.predict(stay_features_scaled)[0]
        
        print(f"✅ Stay length model test - Predicted hours: {stay_pred:.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model testing failed: {e}")
        return False

if __name__ == "__main__":
    save_models()
    test_models()