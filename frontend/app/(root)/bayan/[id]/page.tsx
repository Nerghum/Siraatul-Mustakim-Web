import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BayanSchedule from "@/components/BayanSchedule/BayanSchedule";
import { getBayanEventById } from "@/data/mockBayanSchedule";
import styles from "@/styles/bayan-schedule.module.css";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await params;
  const event = await getBayanEventById(id);

  if (!event) return { title: "Bayan" };

  const description = `${event.time} — ${event.location}`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      url: `/bayan/${event.id}`,
      type: "article",
    },
  };
}

/**
 * Shareable deep link to a single bayan event. Renders the same /bayan page and
 * tells it to open that event's detail drawer immediately.
 */
export default async function BayanEventPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const event = await getBayanEventById(id);

  if (!event) notFound();

  return (
    <div className={styles.pageOffset}>
      <BayanSchedule seeMore={false} initialEventId={id} />
    </div>
  );
}
