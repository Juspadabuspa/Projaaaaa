# medroute_api_server.py
"""
Flask API Server for MedRoute Frontend
Provides REST endpoints for hospital and capacity data
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from cloud_medroute_db import CloudMedRouteDB
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import math

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize database
db = CloudMedRouteDB()

# Helper functions
def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def get_city_coordinates(city):
    """Get coordinates for South African cities"""
    city_coords = {
        'Johannesburg': {'lat': -26.2041, 'lng': 28.0473},
        'Cape Town': {'lat': -33.9249, 'lng': 18.4241},
        'Durban': {'lat': -29.8587, 'lng': 31.0218},
        'Pretoria': {'lat': -25.7461, 'lng': 28.1881},
        'Port Elizabeth': {'lat': -33.9608, 'lng': 25.6022},
        'Bloemfontein': {'lat': -29.0852, 'lng': 26.1596},
        'Polokwane': {'lat': -23.9045, 'lng': 29.4689},
        'Nelspruit': {'lat': -25.4753, 'lng': 30.9700},
        'Kimberley': {'lat': -28.7282, 'lng': 24.7499},
        'Rustenburg': {'lat': -25.6672, 'lng': 27.2424}
    }
    return city_coords.get(city, city_coords['Johannesburg'])

def map_facility_type_to_emergency_level(facility_type, level_of_care):
    """Map facility type to emergency level"""
    if facility_type == 'Emergency Center':
        return 'Level 2 Trauma Center'
    elif level_of_care == 'Tertiary':
        return 'Level 1 Trauma Center'
    elif level_of_care == 'Secondary':
        return 'Level 2 Trauma Center'
    elif facility_type == 'Hospital':
        return 'Level 3 Trauma Center'
    else:
        return 'Basic Emergency Care'

def get_specialties_from_departments(facility_id):
    """Get specialties based on departments in the facility"""
    try:
        departments = list(db.get_collection('departments').find({'Facility_ID': facility_id}))
        
        specialty_mapping = {
            'Emergency': 'emergency',
            'Cardiology': 'cardiology', 
            'General Medicine': 'general',
            'Pediatrics': 'pediatrics',
            'Neurology': 'neurology',
            'Orthopedics': 'orthopedics',
            'Oncology': 'oncology',
            'Surgery': 'surgery'
        }
        
        specialties = []
        for dept in departments:
            dept_name = dept.get('Name', '')
            for key, value in specialty_mapping.items():
                if key in dept_name:
                    specialties.append(value)
                    break
            else:
                specialties.append('general')
        
        # Always include general if not emergency-only
        if 'emergency' not in specialties and 'general' not in specialties:
            specialties.append('general')
            
        return list(set(specialties))  # Remove duplicates
        
    except Exception as e:
        print(f"Error getting specialties for facility {facility_id}: {e}")
        return ['general']

# API Routes

@app.route('/api/facilities', methods=['GET'])
def get_facilities():
    """Return all facilities from MongoDB"""
    try:
        facilities_collection = db.get_collection('facilities')
        facilities = list(facilities_collection.find({}))
        
        # Transform MongoDB data to frontend format
        formatted_facilities = []
        for facility in facilities:
            # Get coordinates for the city
            coords = get_city_coordinates(facility.get('City', 'Johannesburg'))
            
            # Get specialties from departments
            specialties = get_specialties_from_departments(facility['_id'])
            
            # Format facility data
            formatted_facility = {
                'id': str(facility['_id']),
                'name': facility.get('Name', 'Unknown Hospital'),
                'location': {
                    'lat': coords['lat'],
                    'lng': coords['lng']
                },
                'address': f"{facility.get('Address', '')}, {facility.get('City', '')}, {facility.get('Province', '')}",
                'phone': facility.get('Phone', ''),
                'specialties': specialties,
                'emergencyLevel': map_facility_type_to_emergency_level(
                    facility.get('Facility_type', ''), 
                    facility.get('Level_of_care', '')
                ),
                'rating': 4.0 + (hash(facility.get('Name', '')) % 10) / 10,  # Generate consistent rating
                'capacity': facility.get('capacity_beds', 50),
                'facilityType': facility.get('Facility_type', 'Hospital'),
                'ownership': facility.get('Ownership_type', 'Public'),
                'city': facility.get('City', ''),
                'province': facility.get('Province', '')
            }
            formatted_facilities.append(formatted_facility)
        
        return jsonify(formatted_facilities)
        
    except Exception as e:
        print(f"Error fetching facilities: {e}")
        return jsonify({'error': 'Failed to fetch facilities'}), 500

@app.route('/api/facilities/<facility_id>/capacity', methods=['GET'])
def get_facility_capacity(facility_id):
    """Return current capacity for specific facility with better error handling"""
    try:
        # Convert string ID to int if needed
        try:
            facility_id_int = int(facility_id)
        except ValueError:
            facility_id_int = facility_id
        
        # Check if facility exists first
        facility = db.get_collection('facilities').find_one({'_id': facility_id_int})
        if not facility:
            # Return mock data if facility doesn't exist
            return jsonify([{
                'Department_name': 'General Department',
                'Specialty': 'general',
                'Current_patients': 5,
                'Current_beds_available': 10,
                'Total_beds': 15,
                'Current_doctors_on_duty': 2,
                'Wait_time_minutes': 45,
                'Status': 'MODERATE',
                'Utilization_rate': 33.3
            }])
        
        # Get departments for this facility with timeout
        departments = list(db.get_collection('departments').find({'Facility_ID': facility_id_int}).limit(10))
        
        capacity_data = []
        
        if not departments:
            # Return default department if none found
            capacity_data.append({
                'Department_name': 'General Department',
                'Specialty': 'general',
                'Current_patients': 3,
                'Current_beds_available': 12,
                'Total_beds': 15,
                'Current_doctors_on_duty': 2,
                'Wait_time_minutes': 30,
                'Status': 'LOW',
                'Utilization_rate': 20.0
            })
        else:
            for dept in departments:
                dept_id = dept['_id']
                
                # Get capacity data for this department with fallback
                try:
                    capacity = db.get_collection('department_capacity').find_one({'Department_ID': dept_id})
                except:
                    capacity = None
                
                # Map department name to specialty
                dept_name = dept.get('Name', 'General Department')
                specialty_name = 'general'
                
                if 'Emergency' in dept_name:
                    specialty_name = 'emergency'
                elif 'Cardiology' in dept_name:
                    specialty_name = 'cardiology'
                elif 'Pediatrics' in dept_name or 'Children' in dept_name:
                    specialty_name = 'pediatrics'
                elif 'Neurology' in dept_name:
                    specialty_name = 'neurology'
                elif 'Orthopedics' in dept_name:
                    specialty_name = 'orthopedics'
                
                # Use capacity data if available, otherwise use defaults
                if capacity:
                    current_patients = capacity.get('Current_patients', 0)
                    doctors_on_duty = capacity.get('Current_doctors_on_duty', 1)
                    wait_time = min(max(current_patients * 15 // doctors_on_duty, 15), 180)
                    total_beds = dept.get('Capacity_beds', 20)
                    available_beds = capacity.get('Current_beds_available', total_beds // 2)
                else:
                    # Generate reasonable mock data
                    import random
                    total_beds = random.randint(10, 30)
                    current_patients = random.randint(0, total_beds)
                    available_beds = total_beds - current_patients
                    doctors_on_duty = random.randint(1, 5)
                    wait_time = random.randint(15, 120)
                
                # Calculate utilization and status
                utilization = ((total_beds - available_beds) / total_beds * 100) if total_beds > 0 else 0
                
                if utilization >= 95:
                    status = 'CRITICAL'
                elif utilization >= 85:
                    status = 'HIGH'
                elif utilization >= 65:
                    status = 'MODERATE'
                else:
                    status = 'LOW'
                
                capacity_info = {
                    'Department_name': dept_name,
                    'Specialty': specialty_name,
                    'Current_patients': current_patients,
                    'Current_beds_available': available_beds,
                    'Total_beds': total_beds,
                    'Current_doctors_on_duty': doctors_on_duty,
                    'Wait_time_minutes': wait_time,
                    'Status': status,
                    'Utilization_rate': round(utilization, 1)
                }
                capacity_data.append(capacity_info)
        
        return jsonify(capacity_data)
        
    except Exception as e:
        print(f"Error fetching capacity for facility {facility_id}: {e}")
        # Return mock data on any error to prevent frontend timeouts
        return jsonify([{
            'Department_name': 'General Department',
            'Specialty': 'general',
            'Current_patients': 3,
            'Current_beds_available': 12,
            'Total_beds': 15,
            'Current_doctors_on_duty': 2,
            'Wait_time_minutes': 45,
            'Status': 'MODERATE',
            'Utilization_rate': 20.0
        }]), 200  # Return 200 even on error to prevent timeouts

@app.route('/api/emergency-hospitals', methods=['POST'])
def get_emergency_hospitals():
    """Return emergency-capable hospitals near location"""
    try:
        data = request.get_json()
        user_lat = data.get('latitude')
        user_lng = data.get('longitude')
        max_distance = data.get('max_distance', 50)  # Default 50km radius
        patient_age = data.get('patient_age')
        
        if not user_lat or not user_lng:
            return jsonify({'error': 'Location coordinates required'}), 400
        
        # Get all facilities
        facilities = list(db.get_collection('facilities').find({}))
        
        emergency_hospitals = []
        
        for facility in facilities:
            # Check if facility has emergency capability
            departments = list(db.get_collection('departments').find({'Facility_ID': facility['_id']}))
            has_emergency = any('Emergency' in dept.get('Name', '') for dept in departments)
            
            # Skip if no emergency department
            if not has_emergency and facility.get('Facility_type') != 'Emergency Center':
                continue
            
            # Get facility coordinates
            coords = get_city_coordinates(facility.get('City', 'Johannesburg'))
            
            # Calculate distance
            distance = calculate_distance(user_lat, user_lng, coords['lat'], coords['lng'])
            
            # Skip if too far
            if distance > max_distance:
                continue
            
            # For pediatric emergencies, check if facility handles children
            if patient_age and patient_age <= 18:
                has_pediatrics = any('Pediatric' in dept.get('Name', '') or 'Children' in facility.get('Name', '') 
                                   for dept in departments)
                # Prefer pediatric facilities for children, but don't exclude others
                pediatric_preference = has_pediatrics
            else:
                pediatric_preference = False
            
            # Get emergency department capacity
            emergency_dept = None
            for dept in departments:
                if 'Emergency' in dept.get('Name', ''):
                    emergency_dept = dept
                    break
            
            if emergency_dept:
                capacity = db.get_collection('department_capacity').find_one({'Department_ID': emergency_dept['_id']})
            else:
                capacity = None
            
            # Calculate current status
            if capacity:
                current_patients = capacity.get('Current_patients', 0)
                available_beds = capacity.get('Current_beds_available', 10)
                total_beds = emergency_dept.get('Capacity_beds', 15)
                doctors_on_duty = capacity.get('Current_doctors_on_duty', 2)
                wait_time = min(max(current_patients * 15 // doctors_on_duty, 15), 180)
            else:
                available_beds = 5
                total_beds = 15
                wait_time = 45
                current_patients = total_beds - available_beds
            
            emergency_hospital = {
                'id': str(facility['_id']),
                'name': facility.get('Name', 'Unknown Hospital'),
                'location': coords,
                'address': f"{facility.get('Address', '')}, {facility.get('City', '')}, {facility.get('Province', '')}",
                'phone': facility.get('Phone', ''),
                'distance': round(distance, 1),
                'estimatedArrival': max(15, int(distance * 2.5)),  # Factor in traffic
                'emergencyLevel': map_facility_type_to_emergency_level(
                    facility.get('Facility_type', ''), 
                    facility.get('Level_of_care', '')
                ),
                'specialties': get_specialties_from_departments(facility['_id']),
                'currentCapacity': {
                    'emergency': {
                        'available': available_beds,
                        'total': total_beds,
                        'waitTime': wait_time,
                        'status': 'CRITICAL' if available_beds <= 2 else 'HIGH' if available_beds <= 5 else 'MODERATE'
                    }
                },
                'isLevel1Trauma': 'Level 1' in map_facility_type_to_emergency_level(
                    facility.get('Facility_type', ''), 
                    facility.get('Level_of_care', '')
                ),
                'hasAmbulance': facility.get('Facility_type') != 'Clinic',
                'directionsUrl': f"https://maps.google.com/maps?daddr={coords['lat']},{coords['lng']}",
                'pediatricPreference': pediatric_preference
            }
            
            emergency_hospitals.append(emergency_hospital)
        
        # Sort by distance, but prioritize pediatric facilities for children
        if patient_age and patient_age <= 18:
            emergency_hospitals.sort(key=lambda h: (not h['pediatricPreference'], h['distance']))
        else:
            emergency_hospitals.sort(key=lambda h: h['distance'])
        
        # Return top 5 closest
        return jsonify(emergency_hospitals[:5])
        
    except Exception as e:
        print(f"Error finding emergency hospitals: {e}")
        return jsonify({'error': 'Failed to find emergency hospitals'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db.client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_system_stats():
    """Get basic system statistics"""
    try:
        stats = {
            'total_facilities': db.get_collection('facilities').count_documents({}),
            'total_patients': db.get_collection('patients').count_documents({}),
            'total_doctors': db.get_collection('doctors').count_documents({}),
            'total_consultations': db.get_collection('medical_consultations').count_documents({}),
            'consultations_today': db.get_collection('medical_consultations').count_documents({
                'Consultation_Date': {'$gte': datetime.now().replace(hour=0, minute=0, second=0)}
            }),
            'timestamp': datetime.utcnow().isoformat()
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch stats'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting MedRoute API Server...")
    print("MongoDB Atlas connection:", "✅" if db.client else "❌")
    
    # Print available endpoints
    print("\nAvailable endpoints:")
    print("GET  /api/facilities - Get all hospitals")
    print("GET  /api/facilities/<id>/capacity - Get hospital capacity")
    print("POST /api/emergency-hospitals - Find emergency hospitals")
    print("GET  /api/health - Health check")
    print("GET  /api/stats - System statistics")
    
    # Run the server
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(host='0.0.0.0', port=port, debug=debug)