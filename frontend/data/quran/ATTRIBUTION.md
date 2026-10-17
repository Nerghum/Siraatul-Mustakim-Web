# Quran data attribution

## Arabic text and Bengali translation

- Source: [QuranEnc Ruwad Bengali translation](https://quranenc.com/bn/browse/bengali_rwwad), API edition `bengali_rwwad`.
- The QuranEnc catalog lists edition V1.0.0 (2020-10-15); this is recorded in `metadata.json`.
- The API response supplies the Arabic ayah text with the Bengali meaning. The Arabic and translation strings are preserved verbatim in `rwwad/`.
- Translator/publisher: Ruwad Translation Center, in collaboration with Rabwah Dawah Center and IslamHouse.com (as credited by QuranEnc).
- QuranEnc's reuse terms require publisher/source attribution, the edition/version information, preservation of the transcript information, and verbatim content. Keep this notice with the data and display source attribution in the reader.

## Bengali concise tafsir

- Source: [QuranEnc Bengali concise tafsir](https://quranenc.com/bn/browse/bengali_mokhtasar), API edition `bengali_mokhtasar`.
- Publisher: Tafsir Center for Quranic Studies (as credited by QuranEnc).
- QuranEnc does not list a separate version number for this concise tafsir in its catalog; retain API edition ID `bengali_mokhtasar` as its edition identifier.
- The tafsir and footnotes are preserved verbatim in `mokhtasar/`. QuranEnc's reuse terms require attribution and version/edition information; retain this notice and show the source in tafsir mode.

## Surah metadata

- Bengali surah names: QuranEnc's Ruwad surah index.
- Arabic and English chapter names, English meaning names, ayah counts, and revelation place: [AlQuran Cloud surah metadata endpoint](https://api.alquran.cloud/v1/surah).
- Metadata is not Quran text. The surah number is used as the stable join key for both QuranEnc text files.

The content was downloaded on 2026-10-12 for this local prototype. Check QuranEnc for current editions and updates before a production release. Do not place inappropriate advertising beside Quran meanings.
