/**
 * Bangladesh districts and their upazilas/thanas.
 *
 * Merged from the reference project's dataset, which had only 63 of the 64
 * districts (Thakurgaon was absent) and kept English names and Bangla names in
 * two separate, differently-ordered files that were never imported anywhere.
 * Here it is one list carrying both names, so the order form can label options
 * in the visitor's language while storing a stable English value.
 *
 * A tenant can override this entirely via Settings -> Orders -> locations.
 */

export type BdDistrict = {
  /** Stored on the order. Stable across locales. */
  district: string;
  /** Shown to a Bangla visitor. */
  bn: string;
  thanas: string[];
};

export const BD_DISTRICTS: BdDistrict[] = [
  { district: "Bagerhat", bn: "বাগেরহাট", thanas: ["Bagerhat Sadar", "Morrelganj", "Mongla", "Fakirhat", "Rampal", "Kachua"] },
  { district: "Bandarban", bn: "বান্দরবান", thanas: ["Bandarban Sadar", "Thanchi", "Lama", "Naikhongchhari", "Ruma", "Rowangchhari"] },
  { district: "Barguna", bn: "বরগুনা", thanas: ["Barguna Sadar", "Amtali", "Patharghata", "Betagi", "Bamna", "Taltali"] },
  { district: "Barishal", bn: "বরিশাল", thanas: ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"] },
  { district: "Bhola", bn: "ভোলা", thanas: ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"] },
  { district: "Bogura", bn: "বগুড়া", thanas: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"] },
  { district: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া", thanas: ["Brahmanbaria Sadar", "Ashuganj", "Banchharampur", "Bijoynagar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Akhaura"] },
  { district: "Chandpur", bn: "চাঁদপুর", thanas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"] },
  { district: "Chattogram", bn: "চট্টগ্রাম", thanas: ["Panchlaish", "Kotwali", "Halishahar", "Pahartali", "Sitakunda", "Anwara", "Patiya", "Hathazari", "Mirsharai", "Sandwip", "Banshkhali", "Boalkhali", "Rangunia", "Lohagara"] },
  { district: "Chuadanga", bn: "চুয়াডাঙ্গা", thanas: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"] },
  { district: "Cox's Bazar", bn: "কক্সবাজার", thanas: ["Cox's Bazar Sadar", "Chakaria", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua", "Kutubdia"] },
  { district: "Cumilla", bn: "কুমিল্লা", thanas: ["Cumilla Sadar", "Cumilla Sadar Dakshin", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Meghna", "Monohargonj", "Titas"] },
  { district: "Dhaka", bn: "ঢাকা", thanas: ["Dhanmondi", "Mirpur", "Mohammadpur", "Uttara", "Gulshan", "Savar", "Keraniganj", "Dhamrai", "Nawabganj", "Dohar"] },
  { district: "Dinajpur", bn: "দিনাজপুর", thanas: ["Dinajpur Sadar", "Birol", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur", "Biral"] },
  { district: "Faridpur", bn: "ফরিদপুর", thanas: ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"] },
  { district: "Feni", bn: "ফেনী", thanas: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"] },
  { district: "Gaibandha", bn: "গাইবান্ধা", thanas: ["Gaibandha Sadar", "Phulbari", "Govindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"] },
  { district: "Gazipur", bn: "গাজীপুর", thanas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"] },
  { district: "Gopalganj", bn: "গোপালগঞ্জ", thanas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"] },
  { district: "Habiganj", bn: "হবিগঞ্জ", thanas: ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj", "Shaistaganj"] },
  { district: "Jamalpur", bn: "জামালপুর", thanas: ["Jamalpur Sadar", "Baksiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"] },
  { district: "Jashore", bn: "যশোর", thanas: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"] },
  { district: "Jhalokati", bn: "ঝালকাঠি", thanas: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"] },
  { district: "Jhenaidah", bn: "ঝিনাইদহ", thanas: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Moheshpur", "Shailkupa"] },
  { district: "Joypurhat", bn: "জয়পুরহাট", thanas: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"] },
  { district: "Khagrachhari", bn: "খাগড়াছড়ি", thanas: ["Khagrachhari Sadar", "Dighinala", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"] },
  { district: "Khulna", bn: "খুলনা", thanas: ["Khulna Sadar", "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"] },
  { district: "Kishoreganj", bn: "কিশোরগঞ্জ", thanas: ["Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"] },
  { district: "Kurigram", bn: "কুড়িগ্রাম", thanas: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"] },
  { district: "Kushtia", bn: "কুষ্টিয়া", thanas: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"] },
  { district: "Lakshmipur", bn: "লক্ষ্মীপুর", thanas: ["Lakshmipur Sadar", "Kamalnagar", "Raipur", "Ramganj", "Ramgati"] },
  { district: "Lalmonirhat", bn: "লালমনিরহাট", thanas: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"] },
  { district: "Madaripur", bn: "মাদারীপুর", thanas: ["Madaripur Sadar", "Dashar", "Kalkini", "Rajoir", "Shibchar"] },
  { district: "Magura", bn: "মাগুরা", thanas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"] },
  { district: "Manikganj", bn: "মানিকগঞ্জ", thanas: ["Manikganj Sadar", "Daulatpur", "Ghior", "Harirampur", "Saturia", "Shibalaya", "Singair"] },
  { district: "Meherpur", bn: "মেহেরপুর", thanas: ["Meherpur Sadar", "Gangni", "Mujibnagar"] },
  { district: "Moulvibazar", bn: "মৌলভীবাজার", thanas: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"] },
  { district: "Munshiganj", bn: "মুন্সিগঞ্জ", thanas: ["Munshiganj Sadar", "Gazaria", "Lauhajang", "Sirajdikhan", "Sreenagar", "Tongibari"] },
  { district: "Mymensingh", bn: "ময়মনসিংহ", thanas: ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal", "Tara Khanda"] },
  { district: "Naogaon", bn: "নওগাঁ", thanas: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"] },
  { district: "Narail", bn: "নড়াইল", thanas: ["Narail Sadar", "Kalia", "Lohagara"] },
  { district: "Narayanganj", bn: "নারায়ণগঞ্জ", thanas: ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"] },
  { district: "Narsingdi", bn: "নরসিংদী", thanas: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"] },
  { district: "Natore", bn: "নাটোর", thanas: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Singra"] },
  { district: "Nawabganj", bn: "চাঁপাইনবাবগঞ্জ", thanas: ["Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"] },
  { district: "Netrokona", bn: "নেত্রকোণা", thanas: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Purbadhala"] },
  { district: "Nilphamari", bn: "নীলফামারী", thanas: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"] },
  { district: "Noakhali", bn: "নোয়াখালী", thanas: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Senbagh", "Sonaimuri", "Subarnachar"] },
  { district: "Pabna", bn: "পাবনা", thanas: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"] },
  { district: "Panchagarh", bn: "পঞ্চগড়", thanas: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"] },
  { district: "Patuakhali", bn: "পটুয়াখালী", thanas: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"] },
  { district: "Pirojpur", bn: "পিরোজপুর", thanas: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"] },
  { district: "Rajbari", bn: "রাজবাড়ী", thanas: ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Kalukhali", "Pangsha"] },
  { district: "Rajshahi", bn: "রাজশাহী", thanas: ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"] },
  { district: "Rangamati", bn: "রাঙ্গামাটি", thanas: ["Rangamati Sadar", "Baghaichhari", "Barkal", "Juraichhari", "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali", "Belaichhari"] },
  { district: "Rangpur", bn: "রংপুর", thanas: ["Rangpur Sadar", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"] },
  { district: "Satkhira", bn: "সাতক্ষীরা", thanas: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"] },
  { district: "Shariatpur", bn: "শরীয়তপুর", thanas: ["Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Zajira"] },
  { district: "Sherpur", bn: "শেরপুর", thanas: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"] },
  { district: "Sirajganj", bn: "সিরাজগঞ্জ", thanas: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"] },
  { district: "Sunamganj", bn: "সুনামগঞ্জ", thanas: ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Dakshin Sunamganj", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"] },
  { district: "Sylhet", bn: "সিলেট", thanas: ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "Zakiganj"] },
  { district: "Tangail", bn: "টাঙ্গাইল", thanas: ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Khandakar", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur"] },
  { district: "Thakurgaon", bn: "ঠাকুরগাঁও", thanas: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"] },
];

export const DISTRICT_NAMES = BD_DISTRICTS.map((d) => d.district);

export const thanasFor = (district: string): string[] =>
  BD_DISTRICTS.find((d) => d.district === district)?.thanas ?? [];

export const districtLabel = (district: string, locale: 'bn' | 'en'): string => {
  const found = BD_DISTRICTS.find((d) => d.district === district);
  if (!found) return district;
  return locale === 'bn' ? found.bn : found.district;
};
