import BayanSchedule from "@/components/BayanSchedule/BayanSchedule";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";
import AskScholar from "@/components/home/ask-scholar";
import Categories from "@/components/home/categories";
import PrayerTimes from "@/components/home/prayer-times";
import RecentBayan from "@/components/RecentBayan/RecentBayan";
import AdvertisementCard from "@/components/shared/AdvertisementCard";
import Wrapper from "@/components/wrapper";

export default function Home() {
  return (
    <div>
      <PrayerTimes />
      <Categories />
      <AskScholar />
      <BayanSchedule />
      <RecentBayan />
      <Wrapper>
        <AdvertisementCard placement="home" isBanner />
      </Wrapper>
      <EssentialMasail />
    </div>
  );
}
