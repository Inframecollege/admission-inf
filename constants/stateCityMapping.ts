export const STATE_CITY_MAPPING = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kakinada", "Chilakaluripet", "Chittoor", "Tirupati", "Hindupur", "Madanapalle"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat", "Ziro", "Bomdila", "Papum Pare", "Changlang", "Lohit", "West Siang", "Tirap"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur", "Bongaigaon", "Dhubri", "Sivasagar", "Nagaon", "Karimganj"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Bihar Sharif", "Motihari", "Saharsa", "Hajipur"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh", "Jagdalpur", "Rajnandgaon", "Bhilai"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Junagadh", "Gandhinagar", "Bhuj"],
  "Haryana": ["Chandigarh", "Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak", "Kaithal"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Kasauli", "Narkanda", "Kotkhai", "Una", "Sarkaghat"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Chas", "Bokaro Steel City"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Shimoga", "Bijapur", "Tumkur", "Chikkamagaluru", "Udupi", "Kolar"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kottayam", "Alappuzha", "Malappuram"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Burhanpur", "Chhindwara", "Mandsaur", "Datia", "Neemuch", "Shivpuri"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Chandrapur", "Parbhani", "Yavatmal", "Satara"],
  "Manipur": ["Imphal", "Imphal East", "Imphal West", "Bishnupur", "Thoubal", "Churachandpur", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Nongpoh", "Jowai", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Mamit", "Lawngtlai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Phek", "Kiphire", "Longleng", "Noklak"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur", "Brahmapur", "Balasore", "Bhadrak", "Koraput", "Paradip", "Dhenkanal"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Batala", "Faridkot", "Firozpur", "Gurdaspur", "Hoshiarpur", "Mohali"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar", "Chittaurgarh", "Jaisalmer", "Dhaulpur"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Lachung", "Rangpo", "Cherthala"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Tirunelveli", "Thoothukudi", "Vellore", "Thanjavur", "Erode", "Arcot", "Cuddalore", "Dindigul", "Kanchipuram"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Adilabad", "Ramagundam", "Sangareddi"],
  "Tripura": ["Agartala", "Dharmanagar", "Kailasahar", "Udaipur", "Santirbazar", "Belonia", "Khowai", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad", "Bareilly", "Moradabad", "Jhansi", "Saharanpur", "Mathura", "Aligarh"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Srinagar", "Pauri", "Almora"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Jalpaiguri", "Kharagpur", "Haldia", "Rishra"]
}

// Helper function to get state options for select dropdown
export const getStateOptions = () => {
  return Object.keys(STATE_CITY_MAPPING).map(state => ({
    value: state.toLowerCase().replace(/\s+/g, '-'),
    label: state
  }))
}

// Helper function to get city options for a selected state
export const getCityOptions = (selectedState: string) => {
  // Convert the selected state value back to the proper format
  const stateKey = Object.keys(STATE_CITY_MAPPING).find(
    state => state.toLowerCase().replace(/\s+/g, '-') === selectedState
  )
  
  if (!stateKey) return []
  
  return STATE_CITY_MAPPING[stateKey as keyof typeof STATE_CITY_MAPPING].map(city => ({
    value: city.toLowerCase().replace(/\s+/g, '-'),
    label: city
  }))
}

// Helper function to get state name from value
export const getStateNameFromValue = (stateValue: string) => {
  return Object.keys(STATE_CITY_MAPPING).find(
    state => state.toLowerCase().replace(/\s+/g, '-') === stateValue
  ) || ''
}

// Helper function to get city name from value
export const getCityNameFromValue = (cityValue: string, stateValue: string) => {
  const stateKey = getStateNameFromValue(stateValue)
  if (!stateKey) return ''
  
  const cities = STATE_CITY_MAPPING[stateKey as keyof typeof STATE_CITY_MAPPING]
  return cities.find(city => city.toLowerCase().replace(/\s+/g, '-') === cityValue) || ''
}
