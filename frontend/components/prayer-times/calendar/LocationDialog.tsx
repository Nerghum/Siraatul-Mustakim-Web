"use client";

import { MapPin, ShieldCheck, X } from "lucide-react";
import { getCountries, getCities } from "@/app/actions/location";
import { BD_DISTRICTS, findNearestDistrict, parseLocation } from "@/data/bdDistricts";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/prayer-calendar.module.css";
import DialogShell from "./DialogShell";
import { useEffect, useState } from "react";

type LocationDialogProps = {
  districtId: string;
  onSave: (districtId: string) => void;
  onClose: () => void;
};

type DetectStatus = "idle" | "detecting" | "denied" | "unsupported";

/** `স্থান শনাক্ত করুন` — auto-detect, or pick the district by hand. */
const LocationDialog = ({ districtId, onSave, onClose }: LocationDialogProps) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const parsed = parseLocation(districtId);
  const [draftId, setDraftId] = useState(districtId);
  const [status, setStatus] = useState<DetectStatus>("idle");

  const [countries, setCountries] = useState<{name: string, isoCode: string}[]>([]);
  const [cities, setCities] = useState<{name: string, lat: number, lng: number}[]>([]);
  
  // Keep track of which country is selected so we can load cities
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (districtId.startsWith("{")) {
      try {
        const obj = JSON.parse(districtId);
        if (obj.countryCode) return obj.countryCode;
      } catch {}
    }
    return "BD";
  });
  
  // Track selected city object to serialize on save
  const [selectedCity, setSelectedCity] = useState<{name: string, lat: number, lng: number} | null>(null);

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (selectedCountry && selectedCountry !== "BD") {
      getCities(selectedCountry).then((data) => {
        setCities(data);
        
        // See if our existing draftId matches a city in this list
        if (draftId.startsWith("{")) {
          try {
            const parsedDraft = JSON.parse(draftId);
            const exists = data.find(c => c.name === parsedDraft.name?.en || c.name === parsedDraft.name?.bn);
            if (exists) {
              setSelectedCity(exists);
              return; // Do not overwrite if it matches
            }
          } catch {}
        }

        if (data.length > 0) {
          // pre-select first city
          setSelectedCity(data[0]);
          setDraftId(JSON.stringify({ 
            id: `global-${data[0].name}`,
            name: { bn: data[0].name, en: data[0].name },
            lat: data[0].lat,
            lng: data[0].lng,
            countryCode: selectedCountry
          }));
        }
      });
    } else if (selectedCountry === "BD") {
      if (draftId.startsWith("{")) {
        setDraftId(BD_DISTRICTS[0].id);
      }
      setSelectedCity(null);
    }
  }, [selectedCountry, draftId]);

  const detect = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const countryCode = data.address?.country_code?.toUpperCase() || "BD";
          const city = data.address?.city || data.address?.town || data.address?.county || data.name || "Your Location";
          
          if (countryCode === "BD") {
            const nearest = findNearestDistrict(lat, lng);
            setSelectedCountry("BD");
            setDraftId(nearest.id);
          } else {
            setSelectedCountry(countryCode);
            const newCity = { name: city, lat, lng };
            setSelectedCity(newCity);
            // Inject it into cities array so the dropdown can display it
            setCities(prev => {
              if (!prev.find(c => c.name === city)) return [newCity, ...prev];
              return prev;
            });
            setDraftId(JSON.stringify({
              id: `detected-${city}`,
              name: { bn: city, en: city },
              lat,
              lng,
              countryCode
            }));
          }
          setStatus("idle");
        } catch (e) {
          // Fallback if API fails
          setStatus("idle");
          setDraftId(JSON.stringify({
            id: "detected",
            name: { bn: "আপনার অবস্থান", en: "Your Location" },
            lat,
            lng,
            countryCode: "BD"
          }));
        }
      },
      () => setStatus("denied"),
    );
  };

  return (
    <DialogShell
      label={t("prayerTimes.calendar.location.title")}
      onClose={onClose}
      className={styles.dialogFlush}
    >
      <div className={styles.dialogBar}>
        <h2 className={styles.dialogBarHeading}>
          <MapPin className={styles.dialogBarIcon} aria-hidden="true" />
          {t("prayerTimes.calendar.location.title")}
        </h2>
        <button
          type="button"
          className={styles.dialogClose}
          onClick={onClose}
          aria-label={t("prayerTimes.calendar.location.cancel")}
        >
          <X className={styles.dialogCloseIcon} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.dialogBody}>
        <button type="button" className={styles.detectButton} onClick={detect}>
          <MapPin className={styles.detectIcon} aria-hidden="true" />
          {t("prayerTimes.calendar.location.autoDetect")}
        </button>

        {status !== "idle" && (
          <p className={styles.detectStatus} role={status === "detecting" ? "status" : "alert"}>
            {t(`prayerTimes.calendar.location.${status}`)}
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="location-country">
            {t("prayerTimes.calendar.location.countryLabel")}
          </label>
          <select 
            id="location-country" 
            className={styles.select} 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map(c => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="location-city">
            {t("prayerTimes.calendar.location.cityLabel")}
          </label>
          
          {selectedCountry === "BD" ? (
            <select
              id="location-city"
              className={styles.select}
              value={draftId}
              onChange={(event) => setDraftId(event.target.value)}
            >
              {BD_DISTRICTS.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name[locale]}
                </option>
              ))}
            </select>
          ) : (
            <select
              id="location-city"
              className={styles.select}
              value={selectedCity?.name || ""}
              onChange={(event) => {
                const c = cities.find(city => city.name === event.target.value);
                if (c) {
                  setSelectedCity(c);
                  setDraftId(JSON.stringify({
                    id: `global-${c.name}`,
                    name: { bn: c.name, en: c.name },
                    lat: c.lat,
                    lng: c.lng,
                    countryCode: selectedCountry
                  }));
                }
              }}
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.dialogDanger} onClick={onClose}>
            {t("prayerTimes.calendar.location.cancel")}
          </button>
          <button
            type="button"
            className={styles.dialogPrimary}
            onClick={() => {
              onSave(draftId);
              onClose();
            }}
          >
            {t("prayerTimes.calendar.location.save")}
          </button>
        </div>

        <div className={styles.privacyCard}>
          <p className={styles.privacyHeading}>
            <MapPin className={styles.privacyIcon} aria-hidden="true" />
            {t("prayerTimes.calendar.location.shareHeading")}
          </p>
          <p className={styles.privacyText}>{t("prayerTimes.calendar.location.shareText")}</p>
          <p className={styles.privacyNote}>
            <ShieldCheck className={styles.privacyNoteIcon} aria-hidden="true" />
            {t("prayerTimes.calendar.location.privacy")}
          </p>
        </div>
      </div>
    </DialogShell>
  );
};

export default LocationDialog;
