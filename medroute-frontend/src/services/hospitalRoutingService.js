// src/services/hospitalRoutingService.js
export class HospitalRoutingService {
  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    // Caching system
    this.facilitiesCache = null;
    this.capacityCache = new Map();
    this.locationCache = new Map();
    this.facilitiesCacheTimestamp = null;
    
    // Cache durations
    this.FACILITIES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.CAPACITY_CACHE_DURATION = 30 * 1000; // 30 seconds
    this.LOCATION_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    
    // Request management
    this.ongoingRequests = new Map();
    this.requestQueue = new Map();
    this.maxConcurrentRequests = 6;
    this.activeRequests = 0;
    
    // Debouncing
    this.debounceTimers = new Map();
    
    // Default coordinates for fallback
    this.defaultCoordinates = {
      'Johannesburg': { lat: -26.2041, lng: 28.0473 },
      'Cape Town': { lat: -33.9249, lng: 18.4241 },
      'Durban': { lat: -29.8587, lng: 31.0218 },
      'Pretoria': { lat: -25.7461, lng: 28.1881 },
      'Port Elizabeth': { lat: -33.9608, lng: 25.6022 },
      'Bloemfontein': { lat: -29.0852, lng: 26.1596 }
    };
  }

  // Efficient cache management
  isCacheValid(timestamp, duration) {
    return timestamp && (Date.now() - timestamp) < duration;
  }

  getCacheKey(prefix, ...args) {
    return `${prefix}_${args.join('_')}`;
  }

  // Request deduplication - prevent multiple identical requests
  async makeRequest(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // If request is already ongoing, return the same promise
    if (this.ongoingRequests.has(cacheKey)) {
      return this.ongoingRequests.get(cacheKey);
    }

    // Create new request with timeout and retry logic
    const requestPromise = this.executeRequest(url, options);
    this.ongoingRequests.set(cacheKey, requestPromise);
    
    // Clean up after request completes
    requestPromise.finally(() => {
      this.ongoingRequests.delete(cacheKey);
    });
    
    return requestPromise;
  }

  async executeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Optimized facilities fetching with caching
  async fetchHospitals() {
    // Check cache first
    if (this.facilitiesCache && this.isCacheValid(this.facilitiesCacheTimestamp, this.FACILITIES_CACHE_DURATION)) {
      return this.facilitiesCache;
    }

    try {
      const facilities = await this.makeRequest(`${this.apiBaseUrl}/facilities`);
      
      // Transform and cache data
      const transformedFacilities = facilities.map(facility => ({
        id: facility.id,
        name: facility.name,
        location: facility.location,
        address: facility.address,
        phone: facility.phone,
        specialties: facility.specialties || ['general'],
        emergencyLevel: facility.emergencyLevel,
        rating: facility.rating || 4.0,
        capacity: facility.capacity || 50,
        facilityType: facility.facilityType,
        ownership: facility.ownership,
        city: facility.city,
        province: facility.province,
        distance: 0 // Will be calculated when needed
      }));
      
      // Cache the results
      this.facilitiesCache = transformedFacilities;
      this.facilitiesCacheTimestamp = Date.now();
      
      return transformedFacilities;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Return cached data if available, otherwise fallback
      return this.facilitiesCache || this.getFallbackHospitals();
    }
  }

  // Batched capacity fetching to reduce API calls
  async fetchMultipleCapacities(facilityIds) {
    const capacityData = {};
    const uncachedIds = [];
    
    // Check cache for each facility
    facilityIds.forEach(id => {
      const cacheKey = this.getCacheKey('capacity', id);
      const cached = this.capacityCache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp, this.CAPACITY_CACHE_DURATION)) {
        capacityData[id] = cached.data;
      } else {
        uncachedIds.push(id);
      }
    });
    
    // Fetch uncached data in controlled batches
    if (uncachedIds.length > 0) {
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < uncachedIds.length; i += batchSize) {
        batches.push(uncachedIds.slice(i, i + batchSize));
      }
      
      // Process batches concurrently but with limit
      const batchPromises = batches.map(batch => this.fetchCapacityBatch(batch));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Merge results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          Object.assign(capacityData, result.value);
        } else {
          // Add default capacity for failed batch
          batches[index].forEach(id => {
            capacityData[id] = this.getDefaultCapacity();
          });
        }
      });
    }
    
    return capacityData;
  }

  async fetchCapacityBatch(facilityIds) {
    const promises = facilityIds.map(id => this.fetchSingleCapacity(id));
    const results = await Promise.allSettled(promises);
    
    const batchData = {};
    results.forEach((result, index) => {
      const facilityId = facilityIds[index];
      if (result.status === 'fulfilled') {
        batchData[facilityId] = result.value;
      } else {
        batchData[facilityId] = this.getDefaultCapacity();
      }
    });
    
    return batchData;
  }

  async fetchSingleCapacity(facilityId) {
    const cacheKey = this.getCacheKey('capacity', facilityId);
    
    try {
      const capacityData = await this.makeRequest(`${this.apiBaseUrl}/facilities/${facilityId}/capacity`);
      
      // Transform the response
      const formattedCapacity = {};
      if (Array.isArray(capacityData)) {
        capacityData.forEach(dept => {
          const specialtyName = this.mapDepartmentToSpecialty(dept.Department_name || dept.Specialty);
          formattedCapacity[specialtyName] = {
            available: dept.Current_beds_available || 0,
            total: dept.Total_beds || dept.Capacity_beds || 20,
            waitTime: dept.Wait_time_minutes || this.calculateWaitTime(dept.Current_patients, dept.Current_doctors_on_duty),
            status: dept.Status || this.getCapacityStatus(dept.Current_beds_available, dept.Total_beds)
          };
        });
      }
      
      // Ensure we have at least emergency and general
      if (!formattedCapacity.emergency) {
        formattedCapacity.emergency = { available: 5, total: 15, waitTime: 45, status: 'MODERATE' };
      }
      if (!formattedCapacity.general) {
        formattedCapacity.general = { available: 10, total: 25, waitTime: 90, status: 'MODERATE' };
      }
      
      // Cache the result
      this.capacityCache.set(cacheKey, {
        data: formattedCapacity,
        timestamp: Date.now()
      });
      
      return formattedCapacity;
    } catch (error) {
      console.error(`Error fetching capacity for facility ${facilityId}:`, error);
      return this.getDefaultCapacity();
    }
  }

  // Optimized nearby hospitals with distance calculation and caching
  async fetchNearbyHospitals(userLocation, maxDistance = 50) {
    const locationKey = this.getCacheKey('location', userLocation.lat.toFixed(3), userLocation.lng.toFixed(3), maxDistance);
    
    // Check location-based cache
    const cached = this.locationCache.get(locationKey);
    if (cached && this.isCacheValid(cached.timestamp, this.LOCATION_CACHE_DURATION)) {
      return cached.data;
    }

    try {
      const hospitals = await this.fetchHospitals();
      
      // Calculate distances efficiently using vectorized approach
      const hospitalsWithDistance = hospitals.map(hospital => {
        const distance = this.calculateDistance(userLocation, hospital.location);
        return { ...hospital, distance };
      }).filter(hospital => hospital.distance <= maxDistance);

      // Sort by distance once
      hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

      // Fetch capacity data for nearby hospitals only
      const facilityIds = hospitalsWithDistance.map(h => h.id);
      const capacityData = await this.fetchMultipleCapacities(facilityIds);

      // Combine hospital and capacity data
      const result = hospitalsWithDistance.map(hospital => ({
        ...hospital,
        currentCapacity: capacityData[hospital.id] || this.getDefaultCapacity()
      }));

      // Cache the result
      this.locationCache.set(locationKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      return [];
    }
  }

  // Optimized emergency routing with priority caching
  async getEmergencyRoute(userLocation, patientAge = null) {
    try {
      // Use smaller radius for emergencies but check cache first
      const hospitals = await this.fetchNearbyHospitals(userLocation, 25);
      
      // Filter for emergency-capable hospitals
      let emergencyHospitals = hospitals.filter(hospital => 
        hospital.specialties.includes('emergency') ||
        hospital.emergencyLevel.includes('Trauma') ||
        hospital.facilityType === 'Emergency Center'
      );

      // Pediatric preference logic
      if (patientAge && patientAge <= 18) {
        const pediatricEmergency = emergencyHospitals.filter(h => 
          h.specialties.includes('pediatrics') || h.name.toLowerCase().includes('children')
        );
        if (pediatricEmergency.length > 0) {
          emergencyHospitals = pediatricEmergency;
        }
      }

      // Sort by distance for emergencies (time is critical)
      emergencyHospitals.sort((a, b) => a.distance - b.distance);

      // Return top 2 with enhanced emergency data
      return emergencyHospitals.slice(0, 2).map(hospital => ({
        ...hospital,
        estimatedArrival: Math.max(10, Math.ceil(hospital.distance * 2.5)),
        directionsUrl: `https://maps.google.com/maps?daddr=${hospital.location.lat},${hospital.location.lng}`,
        emergencyPhone: hospital.phone,
        isLevel1Trauma: hospital.emergencyLevel.includes('Level 1'),
        hasAmbulance: hospital.facilityType !== 'Clinic',
        pediatricPreference: patientAge && patientAge <= 18 && 
          (hospital.specialties.includes('pediatrics') || hospital.name.toLowerCase().includes('children'))
      }));
    } catch (error) {
      console.error('Error getting emergency route:', error);
      return this.getFallbackEmergencyHospitals(userLocation);
    }
  }

  // Optimized routing with smart scoring
  async routeToOptimalHospitals(patientData, userLocation, isEmergency = false, maxResults = 3) {
    try {
      const nearbyHospitals = await this.fetchNearbyHospitals(userLocation);
      const requiredSpecialty = this.mapSymptomsToSpecialty(patientData);
      const patientAge = parseInt(patientData.age || 25);

      // Pre-filter hospitals for efficiency
      let eligibleHospitals = nearbyHospitals.filter(hospital => {
        // Age restrictions
        if (hospital.name.toLowerCase().includes('children') || 
            hospital.specialties.includes('pediatrics')) {
          return patientAge <= 18;
        }

        // Emergency capability
        if (isEmergency) {
          return hospital.specialties.includes('emergency') || 
                 hospital.emergencyLevel.includes('Trauma');
        }

        // Specialty match
        return hospital.specialties.includes(requiredSpecialty) ||
               hospital.specialties.includes('general');
      });

      // Fallback to general hospitals if no matches
      if (eligibleHospitals.length === 0) {
        eligibleHospitals = nearbyHospitals.filter(hospital => 
          hospital.specialties.includes('general') || 
          hospital.specialties.includes('emergency')
        );
      }

      // Calculate routing scores efficiently
      const rankedHospitals = eligibleHospitals.map(hospital => ({
        ...hospital,
        routingScore: this.calculateRoutingScore(hospital, patientData, isEmergency, requiredSpecialty)
      }));

      // Sort by score (higher is better)
      rankedHospitals.sort((a, b) => b.routingScore - a.routingScore);

      return {
        recommendedHospitals: rankedHospitals.slice(0, maxResults),
        totalEligible: rankedHospitals.length,
        routingCriteria: {
          isEmergency,
          requiredSpecialty,
          patientAge,
          searchRadius: Math.max(...rankedHospitals.map(h => h.distance)).toFixed(1) + ' km'
        }
      };
    } catch (error) {
      console.error('Error in hospital routing:', error);
      return {
        recommendedHospitals: [],
        totalEligible: 0,
        error: 'Unable to fetch hospital data',
        routingCriteria: { isEmergency }
      };
    }
  }

  // Efficient geolocation with caching
  async getCurrentLocation() {
    const cacheKey = 'user_location';
    const cached = this.locationCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp, this.LOCATION_CACHE_DURATION)) {
      return cached.data;
    }

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const defaultLocation = { lat: -26.2041, lng: 28.0473, accuracy: null, isDefault: true };
        this.locationCache.set(cacheKey, { data: defaultLocation, timestamp: Date.now() });
        resolve(defaultLocation);
        return;
      }

      const timeout = setTimeout(() => {
        const defaultLocation = { lat: -26.2041, lng: 28.0473, accuracy: null, isDefault: true };
        this.locationCache.set(cacheKey, { data: defaultLocation, timestamp: Date.now() });
        resolve(defaultLocation);
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.locationCache.set(cacheKey, { data: location, timestamp: Date.now() });
          resolve(location);
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('Geolocation failed:', error);
          const defaultLocation = { lat: -26.2041, lng: 28.0473, accuracy: null, isDefault: true };
          this.locationCache.set(cacheKey, { data: defaultLocation, timestamp: Date.now() });
          resolve(defaultLocation);
        },
        {
          enableHighAccuracy: false, // Faster but less accurate
          timeout: 4000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Optimized distance calculation (using faster approximation for sorting)
  calculateDistance(pos1, pos2) {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Optimized routing score calculation
  calculateRoutingScore(hospital, patientData, isEmergency, requiredSpecialty) {
    let score = 100;

    // Distance factor (more critical in emergencies)
    const distanceMultiplier = isEmergency ? 8 : 3;
    score -= Math.min(hospital.distance * distanceMultiplier, 30);

    // Capacity factor
    const specialtyCapacity = hospital.currentCapacity[requiredSpecialty] || hospital.currentCapacity.general;
    if (specialtyCapacity) {
      const availabilityRatio = specialtyCapacity.available / specialtyCapacity.total;
      score += availabilityRatio * 20;
      score -= Math.min(specialtyCapacity.waitTime / 5, 20);
      
      const statusBonus = { 'LOW': 0, 'MODERATE': -5, 'HIGH': -15, 'CRITICAL': -30 };
      score += statusBonus[specialtyCapacity.status] || 0;
    }

    // Emergency level bonus
    if (isEmergency) {
      if (hospital.emergencyLevel.includes('Level 1')) score += 25;
      else if (hospital.emergencyLevel.includes('Level 2')) score += 15;
    }

    // Specialty match bonus
    if (hospital.specialties.includes(requiredSpecialty)) score += 15;

    // Rating bonus
    score += (hospital.rating - 3) * 3;

    return Math.max(score, 0);
  }

  // Helper methods (optimized)
  mapDepartmentToSpecialty(departmentName) {
    if (!departmentName) return 'general';
    const name = departmentName.toLowerCase();
    
    if (name.includes('emergency')) return 'emergency';
    if (name.includes('cardio')) return 'cardiology';
    if (name.includes('pediatric') || name.includes('children')) return 'pediatrics';
    if (name.includes('neuro')) return 'neurology';
    if (name.includes('orthopedic')) return 'orthopedics';
    if (name.includes('oncology')) return 'oncology';
    
    return 'general';
  }

  mapSymptomsToSpecialty(patientData) {
    if (patientData.difficulty_breathing || patientData.chest_pain) return 'emergency';
    if (parseInt(patientData.age || 25) <= 18) return 'pediatrics';
    
    const disease = (patientData.suspected_disease || '').toLowerCase();
    if (disease.includes('heart') || disease.includes('cardiac')) return 'cardiology';
    if (disease.includes('brain') || disease.includes('neuro')) return 'neurology';
    if (disease.includes('bone') || disease.includes('joint')) return 'orthopedics';
    
    return 'general';
  }

  calculateWaitTime(currentPatients = 0, doctorsOnDuty = 1) {
    if (doctorsOnDuty === 0) return 120;
    return Math.min(Math.max((currentPatients / doctorsOnDuty) * 15, 15), 180);
  }

  getCapacityStatus(availableBeds = 0, totalBeds = 20) {
    if (totalBeds === 0) return 'UNKNOWN';
    const utilizationRate = ((totalBeds - availableBeds) / totalBeds) * 100;
    
    if (utilizationRate >= 95) return 'CRITICAL';
    if (utilizationRate >= 85) return 'HIGH';
    if (utilizationRate >= 65) return 'MODERATE';
    return 'LOW';
  }

  getDefaultCapacity() {
    return {
      emergency: { available: 5, total: 15, waitTime: 45, status: 'MODERATE' },
      general: { available: 10, total: 25, waitTime: 90, status: 'MODERATE' },
      cardiology: { available: 3, total: 8, waitTime: 120, status: 'HIGH' },
      pediatrics: { available: 8, total: 12, waitTime: 60, status: 'LOW' }
    };
  }

  getFallbackHospitals() {
    return [
      {
        id: 'fallback_001',
        name: 'Metro General Hospital',
        location: { lat: -26.2041, lng: 28.0473 },
        address: '123 Main St, Johannesburg, Gauteng',
        phone: '+27 11 123 4567',
        specialties: ['emergency', 'general', 'cardiology'],
        emergencyLevel: 'Level 1 Trauma Center',
        rating: 4.2,
        distance: 0,
        currentCapacity: this.getDefaultCapacity()
      }
    ];
  }

  getFallbackEmergencyHospitals(userLocation) {
    const fallbacks = this.getFallbackHospitals();
    return fallbacks.map(hospital => ({
      ...hospital,
      distance: this.calculateDistance(userLocation, hospital.location),
      estimatedArrival: 15,
      directionsUrl: `https://maps.google.com/maps?daddr=${hospital.location.lat},${hospital.location.lng}`,
      isLevel1Trauma: true,
      hasAmbulance: true
    }));
  }

  // Cache management methods
  clearCache() {
    this.facilitiesCache = null;
    this.capacityCache.clear();
    this.locationCache.clear();
    this.facilitiesCacheTimestamp = null;
  }

  clearCapacityCache() {
    this.capacityCache.clear();
  }

  getCacheStats() {
    return {
      facilitiesCached: !!this.facilitiesCache,
      capacityCacheSize: this.capacityCache.size,
      locationCacheSize: this.locationCache.size,
      ongoingRequests: this.ongoingRequests.size
    };
  }
}

// Export singleton instance with improved performance
export const hospitalRouter = new HospitalRoutingService();