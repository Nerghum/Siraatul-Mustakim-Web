/**
 * The 64 districts of Bangladesh, used by the calendar's location popup.
 *
 * Coordinates are approximate district-centre values — good enough for the
 * mock time shift in `data/mockPrayerCalendar.ts` and for picking the nearest
 * district from a geolocation fix, not for real prayer-time calculation.
 * Names live here rather than in `messages/*.json`, the same call already made
 * for month names in `lib/banglaFormat.ts`.
 */

export type District = {
  id: string;
  name: { bn: string; en: string };
  lat: number;
  lng: number;
};

/** Dhaka — the default location and the reference point for every offset. */
export const DEFAULT_DISTRICT_ID = "dhaka";

export const BD_DISTRICTS: District[] = [
  { id: "dhaka", name: { bn: "ঢাকা", en: "Dhaka" }, lat: 23.81, lng: 90.4125 },
  { id: "gazipur", name: { bn: "গাজীপুর", en: "Gazipur" }, lat: 23.999, lng: 90.4203 },
  { id: "kishoreganj", name: { bn: "কিশোরগঞ্জ", en: "Kishoreganj" }, lat: 24.4449, lng: 90.7766 },
  { id: "manikganj", name: { bn: "মানিকগঞ্জ", en: "Manikganj" }, lat: 23.8617, lng: 90.0003 },
  { id: "munshiganj", name: { bn: "মুন্সিগঞ্জ", en: "Munshiganj" }, lat: 23.5422, lng: 90.5305 },
  { id: "narayanganj", name: { bn: "নারায়ণগঞ্জ", en: "Narayanganj" }, lat: 23.6238, lng: 90.4999 },
  { id: "narsingdi", name: { bn: "নরসিংদী", en: "Narsingdi" }, lat: 23.9322, lng: 90.7154 },
  { id: "tangail", name: { bn: "টাঙ্গাইল", en: "Tangail" }, lat: 24.2513, lng: 89.9167 },
  { id: "faridpur", name: { bn: "ফরিদপুর", en: "Faridpur" }, lat: 23.607, lng: 89.8429 },
  { id: "gopalganj", name: { bn: "গোপালগঞ্জ", en: "Gopalganj" }, lat: 23.0051, lng: 89.8266 },
  { id: "madaripur", name: { bn: "মাদারীপুর", en: "Madaripur" }, lat: 23.1641, lng: 90.1897 },
  { id: "rajbari", name: { bn: "রাজবাড়ী", en: "Rajbari" }, lat: 23.7574, lng: 89.6444 },
  { id: "shariatpur", name: { bn: "শরীয়তপুর", en: "Shariatpur" }, lat: 23.2423, lng: 90.4348 },

  { id: "chattogram", name: { bn: "চট্টগ্রাম", en: "Chattogram" }, lat: 22.3569, lng: 91.7832 },
  { id: "brahmanbaria", name: { bn: "ব্রাহ্মণবাড়িয়া", en: "Brahmanbaria" }, lat: 23.9571, lng: 91.1119 },
  { id: "comilla", name: { bn: "কুমিল্লা", en: "Cumilla" }, lat: 23.4607, lng: 91.1809 },
  { id: "chandpur", name: { bn: "চাঁদপুর", en: "Chandpur" }, lat: 23.2333, lng: 90.6712 },
  { id: "coxsbazar", name: { bn: "কক্সবাজার", en: "Cox's Bazar" }, lat: 21.4272, lng: 92.0058 },
  { id: "feni", name: { bn: "ফেনী", en: "Feni" }, lat: 23.0159, lng: 91.3976 },
  { id: "khagrachari", name: { bn: "খাগড়াছড়ি", en: "Khagrachhari" }, lat: 23.1193, lng: 91.9847 },
  { id: "lakshmipur", name: { bn: "লক্ষ্মীপুর", en: "Lakshmipur" }, lat: 22.9447, lng: 90.8282 },
  { id: "noakhali", name: { bn: "নোয়াখালী", en: "Noakhali" }, lat: 22.8696, lng: 91.0995 },
  { id: "rangamati", name: { bn: "রাঙ্গামাটি", en: "Rangamati" }, lat: 22.6533, lng: 92.1751 },
  { id: "bandarban", name: { bn: "বান্দরবান", en: "Bandarban" }, lat: 22.1953, lng: 92.2184 },

  { id: "sylhet", name: { bn: "সিলেট", en: "Sylhet" }, lat: 24.8949, lng: 91.8687 },
  { id: "habiganj", name: { bn: "হবিগঞ্জ", en: "Habiganj" }, lat: 24.375, lng: 91.4155 },
  { id: "moulvibazar", name: { bn: "মৌলভীবাজার", en: "Moulvibazar" }, lat: 24.4829, lng: 91.7774 },
  { id: "sunamganj", name: { bn: "সুনামগঞ্জ", en: "Sunamganj" }, lat: 25.0658, lng: 91.395 },

  { id: "rajshahi", name: { bn: "রাজশাহী", en: "Rajshahi" }, lat: 24.3745, lng: 88.6042 },
  { id: "bogura", name: { bn: "বগুড়া", en: "Bogura" }, lat: 24.8465, lng: 89.3773 },
  { id: "joypurhat", name: { bn: "জয়পুরহাট", en: "Joypurhat" }, lat: 25.0947, lng: 89.0227 },
  { id: "naogaon", name: { bn: "নওগাঁ", en: "Naogaon" }, lat: 24.7936, lng: 88.9318 },
  { id: "natore", name: { bn: "নাটোর", en: "Natore" }, lat: 24.4206, lng: 89.0003 },
  {
    id: "chapainawabganj",
    name: { bn: "চাঁপাইনবাবগঞ্জ", en: "Chapainawabganj" },
    lat: 24.5965,
    lng: 88.2775,
  },
  { id: "pabna", name: { bn: "পাবনা", en: "Pabna" }, lat: 24.0064, lng: 89.2372 },
  { id: "sirajganj", name: { bn: "সিরাজগঞ্জ", en: "Sirajganj" }, lat: 24.4534, lng: 89.7007 },

  { id: "rangpur", name: { bn: "রংপুর", en: "Rangpur" }, lat: 25.7439, lng: 89.2752 },
  { id: "dinajpur", name: { bn: "দিনাজপুর", en: "Dinajpur" }, lat: 25.6217, lng: 88.6354 },
  { id: "gaibandha", name: { bn: "গাইবান্ধা", en: "Gaibandha" }, lat: 25.3288, lng: 89.5281 },
  { id: "kurigram", name: { bn: "কুড়িগ্রাম", en: "Kurigram" }, lat: 25.8072, lng: 89.6362 },
  { id: "lalmonirhat", name: { bn: "লালমনিরহাট", en: "Lalmonirhat" }, lat: 25.9923, lng: 89.2847 },
  { id: "nilphamari", name: { bn: "নীলফামারী", en: "Nilphamari" }, lat: 25.9317, lng: 88.856 },
  { id: "panchagarh", name: { bn: "পঞ্চগড়", en: "Panchagarh" }, lat: 26.3411, lng: 88.5542 },
  { id: "thakurgaon", name: { bn: "ঠাকুরগাঁও", en: "Thakurgaon" }, lat: 26.0336, lng: 88.4616 },

  { id: "khulna", name: { bn: "খুলনা", en: "Khulna" }, lat: 22.8456, lng: 89.5403 },
  { id: "bagerhat", name: { bn: "বাগেরহাট", en: "Bagerhat" }, lat: 22.6516, lng: 89.7859 },
  { id: "chuadanga", name: { bn: "চুয়াডাঙ্গা", en: "Chuadanga" }, lat: 23.6402, lng: 88.8418 },
  { id: "jashore", name: { bn: "যশোর", en: "Jashore" }, lat: 23.1664, lng: 89.2081 },
  { id: "jhenaidah", name: { bn: "ঝিনাইদহ", en: "Jhenaidah" }, lat: 23.5448, lng: 89.1539 },
  { id: "kushtia", name: { bn: "কুষ্টিয়া", en: "Kushtia" }, lat: 23.9013, lng: 89.1206 },
  { id: "magura", name: { bn: "মাগুরা", en: "Magura" }, lat: 23.4855, lng: 89.4198 },
  { id: "meherpur", name: { bn: "মেহেরপুর", en: "Meherpur" }, lat: 23.7622, lng: 88.6318 },
  { id: "narail", name: { bn: "নড়াইল", en: "Narail" }, lat: 23.1725, lng: 89.5127 },
  { id: "satkhira", name: { bn: "সাতক্ষীরা", en: "Satkhira" }, lat: 22.7185, lng: 89.0705 },

  { id: "barishal", name: { bn: "বরিশাল", en: "Barishal" }, lat: 22.701, lng: 90.3535 },
  { id: "barguna", name: { bn: "বরগুনা", en: "Barguna" }, lat: 22.1596, lng: 90.1265 },
  { id: "bhola", name: { bn: "ভোলা", en: "Bhola" }, lat: 22.6859, lng: 90.6482 },
  { id: "jhalokati", name: { bn: "ঝালকাঠি", en: "Jhalokati" }, lat: 22.6406, lng: 90.1987 },
  { id: "patuakhali", name: { bn: "পটুয়াখালী", en: "Patuakhali" }, lat: 22.3596, lng: 90.3298 },
  { id: "pirojpur", name: { bn: "পিরোজপুর", en: "Pirojpur" }, lat: 22.5791, lng: 89.9759 },

  { id: "mymensingh", name: { bn: "ময়মনসিংহ", en: "Mymensingh" }, lat: 24.7471, lng: 90.4203 },
  { id: "jamalpur", name: { bn: "জামালপুর", en: "Jamalpur" }, lat: 24.9375, lng: 89.9372 },
  { id: "netrokona", name: { bn: "নেত্রকোণা", en: "Netrokona" }, lat: 24.8709, lng: 90.7279 },
  { id: "sherpur", name: { bn: "শেরপুর", en: "Sherpur" }, lat: 25.0205, lng: 90.0153 },
];

export function getDistrict(id: string): District {
  return BD_DISTRICTS.find((district) => district.id === id) ?? BD_DISTRICTS[0];
}

/** Nearest district to a geolocation fix, by plain squared distance. */
export function findNearestDistrict(lat: number, lng: number): District {
  return BD_DISTRICTS.reduce((nearest, district) => {
    const distance = (district.lat - lat) ** 2 + (district.lng - lng) ** 2;
    const nearestDistance = (nearest.lat - lat) ** 2 + (nearest.lng - lng) ** 2;
    return distance < nearestDistance ? district : nearest;
  }, BD_DISTRICTS[0]);
}

/** Parses the saved string which can be a legacy district ID or a JSON object for global locations */
export function parseLocation(id: string): District {
  if (id.startsWith("{")) {
    try {
      return JSON.parse(id) as District;
    } catch {
      return getDistrict(DEFAULT_DISTRICT_ID);
    }
  }
  return getDistrict(id);
}
