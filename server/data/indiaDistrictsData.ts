/**
 * Authoritative Dataset of All Official Administrative Districts of India
 * Sourced from the Ministry of Panchayati Raj / Census of India / Government of India (india.gov.in)
 * Covers all 28 States and 8 Union Territories (Total: 787+ Official Districts)
 */

export interface OfficialDistrict {
  districtId: string;
  districtName: string;
  stateName: string;
  stateId: string; // ISO code or standardized identifier
  headquarters?: string;
  source: string;
  lastUpdated: string;
}

export const OFFICIAL_INDIAN_DISTRICTS: OfficialDistrict[] = [
  // ==========================================
  // 1. ANDHRA PRADESH (26 Districts)
  // ==========================================
  { districtId: 'ap-alluri-sitharama-raju', districtName: 'Alluri Sitharama Raju', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Paderu', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-anakapalli', districtName: 'Anakapalli', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Anakapalli', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-anantapur', districtName: 'Anantapur', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Anantapur', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-annamayya', districtName: 'Annamayya', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Rayachoti', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-bapatla', districtName: 'Bapatla', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Bapatla', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-chittoor', districtName: 'Chittoor', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Chittoor', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-dr-br-ambedkar-konaseema', districtName: 'Dr. B.R. Ambedkar Konaseema', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Amalapuram', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-east-godavari', districtName: 'East Godavari', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Rajahmundry', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-eluru', districtName: 'Eluru', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Eluru', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-guntur', districtName: 'Guntur', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Guntur', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-kakinada', districtName: 'Kakinada', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Kakinada', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-krishna', districtName: 'Krishna', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Machilipatnam', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-kurnool', districtName: 'Kurnool', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Kurnool', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-nandyal', districtName: 'Nandyal', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Nandyal', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-ntr', districtName: 'NTR', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Vijayawada', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-palnadu', districtName: 'Palnadu', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Narasaraopet', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-parvathipuram-manyam', districtName: 'Parvathipuram Manyam', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Parvathipuram', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-prakasam', districtName: 'Prakasam', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Ongole', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-spsr-nellore', districtName: 'SPSR Nellore', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Nellore', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-sri-sathya-sai', districtName: 'Sri Sathya Sai', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Puttaparthi', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-srikakulam', districtName: 'Srikakulam', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Srikakulam', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-tirupati', districtName: 'Tirupati', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Tirupati', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-visakhapatnam', districtName: 'Visakhapatnam', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Visakhapatnam', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-vizianagaram', districtName: 'Vizianagaram', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Vizianagaram', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-west-godavari', districtName: 'West Godavari', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Bhimavaram', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },
  { districtId: 'ap-ysr-kadapa', districtName: 'YSR Kadapa', stateName: 'Andhra Pradesh', stateId: 'AP', headquarters: 'Kadapa', source: 'Government of Andhra Pradesh', lastUpdated: '2024-06-01' },

  // ==========================================
  // 2. ARUNACHAL PRADESH (26 Districts)
  // ==========================================
  ...[
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang',
    'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit',
    'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai',
    'Pakke Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang',
    'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang', 'Itanagar'
  ].map(name => ({
    districtId: `ar-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Arunachal Pradesh',
    stateId: 'AR',
    source: 'Government of Arunachal Pradesh',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 3. ASSAM (35 Districts)
  // ==========================================
  ...[
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar',
    'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri',
    'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi',
    'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong',
    'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon',
    'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar',
    'Tinsukia', 'Udalguri', 'West Karbi Anglong', 'Bajali', 'Tamulpur'
  ].map(name => ({
    districtId: `as-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Assam',
    stateId: 'AS',
    source: 'Government of Assam',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 4. BIHAR (38 Districts)
  // ==========================================
  ...[
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai',
    'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran',
    'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
    'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura',
    'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada',
    'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
    'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
    'Supaul', 'Vaishali', 'West Champaran'
  ].map(name => ({
    districtId: `br-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Bihar',
    stateId: 'BR',
    source: 'Government of Bihar',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 5. CHHATTISGARH (33 Districts)
  // ==========================================
  ...[
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara',
    'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg',
    'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham',
    'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund',
    'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur', 'Raigarh',
    'Raipur', 'Rajnandgaon', 'Sarangarh-Bilaigarh', 'Sakti', 'Sukma',
    'Surajpur', 'Surguja', 'Khairagarh-Chhuikhadan-Gandai'
  ].map(name => ({
    districtId: `ct-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Chhattisgarh',
    stateId: 'CT',
    source: 'Government of Chhattisgarh',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 6. GOA (2 Districts)
  // ==========================================
  { districtId: 'ga-north-goa', districtName: 'North Goa', stateName: 'Goa', stateId: 'GA', headquarters: 'Panaji', source: 'Government of Goa', lastUpdated: '2024-06-01' },
  { districtId: 'ga-south-goa', districtName: 'South Goa', stateName: 'Goa', stateId: 'GA', headquarters: 'Margao', source: 'Government of Goa', lastUpdated: '2024-06-01' },

  // ==========================================
  // 7. GUJARAT (33 Districts)
  // ==========================================
  ...[
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha',
    'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod',
    'Dang', 'Devbhumi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
    'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana',
    'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan',
    'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Tapi', 'Vadodara', 'Valsad'
  ].map(name => ({
    districtId: `gj-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Gujarat',
    stateId: 'GJ',
    source: 'Government of Gujarat',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 8. HARYANA (22 Districts)
  // ==========================================
  ...[
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad',
    'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal',
    'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal',
    'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
    'Sonipat', 'Yamunanagar'
  ].map(name => ({
    districtId: `hr-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Haryana',
    stateId: 'HR',
    source: 'Government of Haryana',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 9. HIMACHAL PRADESH (12 Districts)
  // ==========================================
  ...[
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur',
    'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur',
    'Solan', 'Una'
  ].map(name => ({
    districtId: `hp-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Himachal Pradesh',
    stateId: 'HP',
    source: 'Government of Himachal Pradesh',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 10. JHARKHAND (24 Districts)
  // ==========================================
  ...[
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
    'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
    'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
    'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
    'Sahebganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ].map(name => ({
    districtId: `jh-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Jharkhand',
    stateId: 'JH',
    source: 'Government of Jharkhand',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 11. KARNATAKA (31 Districts)
  // ==========================================
  ...[
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
    'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura',
    'Yadgir'
  ].map(name => ({
    districtId: `ka-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Karnataka',
    stateId: 'KA',
    source: 'Government of Karnataka',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 12. KERALA (14 Districts)
  // ==========================================
  ...[
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ].map(name => ({
    districtId: `kl-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Kerala',
    stateId: 'KL',
    source: 'Government of Kerala',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 13. MADHYA PRADESH (55 Districts)
  // ==========================================
  ...[
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat',
    'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur',
    'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas',
    'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda',
    'Narmadapuram', 'Indore', 'Jabalpur', 'Jhabua', 'Katni',
    'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena',
    'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen',
    'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna',
    'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur',
    'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain',
    'Umaria', 'Vidisha', 'Mauganj', 'Maihar', 'Pandhurna'
  ].map(name => ({
    districtId: `mp-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Madhya Pradesh',
    stateId: 'MP',
    source: 'Government of Madhya Pradesh',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 14. MAHARASHTRA (36 Districts)
  // ==========================================
  ...[
    'Ahilyanagar (Ahmednagar)', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Beed',
    'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
    'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
    'Nandurbar', 'Nashik', 'Dharashiv (Osmanabad)', 'Palghar', 'Parbhani',
    'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
    'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim',
    'Yavatmal'
  ].map(name => ({
    districtId: `mh-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Maharashtra',
    stateId: 'MH',
    source: 'Government of Maharashtra',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 15. MANIPUR (16 Districts)
  // ==========================================
  ...[
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
    'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney',
    'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal',
    'Ukhrul'
  ].map(name => ({
    districtId: `mn-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Manipur',
    stateId: 'MN',
    source: 'Government of Manipur',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 16. MEGHALAYA (12 Districts)
  // ==========================================
  ...[
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Eastern West Khasi Hills', 'North Garo Hills',
    'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills',
    'West Jaintia Hills', 'West Khasi Hills'
  ].map(name => ({
    districtId: `ml-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Meghalaya',
    stateId: 'ML',
    source: 'Government of Meghalaya',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 17. MIZORAM (11 Districts)
  // ==========================================
  ...[
    'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib',
    'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual',
    'Serchhip'
  ].map(name => ({
    districtId: `mz-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Mizoram',
    stateId: 'MZ',
    source: 'Government of Mizoram',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 18. NAGALAND (16 Districts)
  // ==========================================
  ...[
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
    'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren',
    'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha',
    'Zunheboto'
  ].map(name => ({
    districtId: `nl-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Nagaland',
    stateId: 'NL',
    source: 'Government of Nagaland',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 19. ODISHA (30 Districts)
  // ==========================================
  ...[
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak',
    'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati',
    'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi',
    'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput',
    'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada',
    'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
  ].map(name => ({
    districtId: `od-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Odisha',
    stateId: 'OD',
    source: 'Government of Odisha',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 20. PUNJAB (23 Districts)
  // ==========================================
  ...[
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
    'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa', 'Moga',
    'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar (Mohali)',
    'Sangrur', 'Shahid Bhagat Singh Nagar (Nawanshahr)', 'Tarn Taran'
  ].map(name => ({
    districtId: `pb-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Punjab',
    stateId: 'PB',
    source: 'Government of Punjab',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 21. RAJASTHAN (50 Districts)
  // ==========================================
  ...[
    'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara',
    'Baran', 'Barmer', 'Beawar', 'Bharatpur', 'Bhilwara',
    'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa',
    'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu', 'Dungarpur',
    'Ganganagar', 'Gangapur City', 'Hanumangarh', 'Jaipur', 'Jaipur Rural',
    'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur',
    'Jodhpur Rural', 'Karauli', 'Kekri', 'Khairthal-Tijara', 'Kota',
    'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 'Pali', 'Phalodi',
    'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur',
    'Shahpura', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur'
  ].map(name => ({
    districtId: `rj-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Rajasthan',
    stateId: 'RJ',
    source: 'Government of Rajasthan',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 22. SIKKIM (6 Districts)
  // ==========================================
  ...[
    'Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
  ].map(name => ({
    districtId: `sk-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Sikkim',
    stateId: 'SK',
    source: 'Government of Sikkim',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 23. TAMIL NADU (38 Districts)
  // ==========================================
  ...[
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
  ].map(name => ({
    districtId: `tn-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Tamil Nadu',
    stateId: 'TN',
    source: 'Government of Tamil Nadu',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 24. TELANGANA (33 Districts)
  // ==========================================
  ...[
    'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad', 'Jagtial',
    'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
    'Khammam', 'Kumuram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
    'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
    'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla',
    'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
    'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
  ].map(name => ({
    districtId: `tg-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Telangana',
    stateId: 'TG',
    source: 'Government of Telangana',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 25. TRIPURA (8 Districts)
  // ==========================================
  ...[
    'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala',
    'South Tripura', 'Unakoti', 'West Tripura'
  ].map(name => ({
    districtId: `tr-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Tripura',
    stateId: 'TR',
    source: 'Government of Tripura',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 26. UTTAR PRADESH (75 Districts)
  // ==========================================
  ...[
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha',
    'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich',
    'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly',
    'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr',
    'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah',
    'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad',
    'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur',
    'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
    'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
    'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj',
    'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut',
    'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
    'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
    'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar',
    'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ].map(name => ({
    districtId: `up-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Uttar Pradesh',
    stateId: 'UP',
    source: 'Government of Uttar Pradesh',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 27. UTTARAKHAND (13 Districts)
  // ==========================================
  ...[
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
    'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag',
    'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
  ].map(name => ({
    districtId: `uk-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Uttarakhand',
    stateId: 'UK',
    source: 'Government of Uttarakhand',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // 28. WEST BENGAL (23 Districts)
  // ==========================================
  ...[
    'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
    'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram',
    'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
    'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur',
    'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
  ].map(name => ({
    districtId: `wb-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'West Bengal',
    stateId: 'WB',
    source: 'Government of West Bengal',
    lastUpdated: '2024-06-01'
  })),

  // ==========================================
  // UNION TERRITORIES (8 UTs)
  // ==========================================
  // 29. Andaman and Nicobar Islands (3 Districts)
  { districtId: 'an-nicobar', districtName: 'Nicobar', stateName: 'Andaman and Nicobar Islands', stateId: 'AN', source: 'UT Administration', lastUpdated: '2024-06-01' },
  { districtId: 'an-north-middle-andaman', districtName: 'North and Middle Andaman', stateName: 'Andaman and Nicobar Islands', stateId: 'AN', source: 'UT Administration', lastUpdated: '2024-06-01' },
  { districtId: 'an-south-andaman', districtName: 'South Andaman', stateName: 'Andaman and Nicobar Islands', stateId: 'AN', source: 'UT Administration', lastUpdated: '2024-06-01' },

  // 30. Chandigarh (1 District)
  { districtId: 'ch-chandigarh', districtName: 'Chandigarh', stateName: 'Chandigarh', stateId: 'CH', source: 'UT Administration', lastUpdated: '2024-06-01' },

  // 31. Dadra and Nagar Haveli and Daman and Diu (3 Districts)
  { districtId: 'dh-dadra-nagar-haveli', districtName: 'Dadra and Nagar Haveli', stateName: 'Dadra and Nagar Haveli and Daman and Diu', stateId: 'DH', source: 'UT Administration', lastUpdated: '2024-06-01' },
  { districtId: 'dh-daman', districtName: 'Daman', stateName: 'Dadra and Nagar Haveli and Daman and Diu', stateId: 'DH', source: 'UT Administration', lastUpdated: '2024-06-01' },
  { districtId: 'dh-diu', districtName: 'Diu', stateName: 'Dadra and Nagar Haveli and Daman and Diu', stateId: 'DH', source: 'UT Administration', lastUpdated: '2024-06-01' },

  // 32. Delhi (11 Districts)
  ...[
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi',
    'West Delhi'
  ].map(name => ({
    districtId: `dl-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Delhi',
    stateId: 'DL',
    source: 'Government of NCT of Delhi',
    lastUpdated: '2024-06-01'
  })),

  // 33. Jammu and Kashmir (20 Districts)
  ...[
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda',
    'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam',
    'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban',
    'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
  ].map(name => ({
    districtId: `jk-${name.toLowerCase().replace(/\s+/g, '-')}`,
    districtName: name,
    stateName: 'Jammu and Kashmir',
    stateId: 'JK',
    source: 'UT Administration of J&K',
    lastUpdated: '2024-06-01'
  })),

  // 34. Ladakh (2 Districts)
  { districtId: 'la-kargil', districtName: 'Kargil', stateName: 'Ladakh', stateId: 'LA', source: 'UT Administration of Ladakh', lastUpdated: '2024-06-01' },
  { districtId: 'la-leh', districtName: 'Leh', stateName: 'Ladakh', stateId: 'LA', source: 'UT Administration of Ladakh', lastUpdated: '2024-06-01' },

  // 35. Lakshadweep (1 District)
  { districtId: 'ld-lakshadweep', districtName: 'Lakshadweep', stateName: 'Lakshadweep', stateId: 'LD', source: 'UT Administration of Lakshadweep', lastUpdated: '2024-06-01' },

  // 36. Puducherry (4 Districts)
  { districtId: 'py-karaikal', districtName: 'Karaikal', stateName: 'Puducherry', stateId: 'PY', source: 'UT Administration of Puducherry', lastUpdated: '2024-06-01' },
  { districtId: 'py-mahe', districtName: 'Mahe', stateName: 'Puducherry', stateId: 'PY', source: 'UT Administration of Puducherry', lastUpdated: '2024-06-01' },
  { districtId: 'py-puducherry', districtName: 'Puducherry', stateName: 'Puducherry', stateId: 'PY', source: 'UT Administration of Puducherry', lastUpdated: '2024-06-01' },
  { districtId: 'py-yanam', districtName: 'Yanam', stateName: 'Puducherry', stateId: 'PY', source: 'UT Administration of Puducherry', lastUpdated: '2024-06-01' },
];
