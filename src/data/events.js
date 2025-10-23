import valorantImg from "@/assets/valorant.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import mlImg from "@/assets/ml.jpg";
import freefireImg from "@/assets/freefire.jpg";
import codImg from "@/assets/cod.jpg";

export const events = [
  {
    id: "lock-load",
      title: "Lock & Load",
      date: "Oct 12, 2025 - Oct 19, 2025",
      location: "Online",
      status: "past",
      prize: "₹10,000",
      image: "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
      teams: 120,
  },
];

export const getEventById = (id) => events.find((e) => e.id === id);
