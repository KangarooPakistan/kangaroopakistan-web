import React from "react";
import EventCard from "./EventCard";
import { Event } from "../../lib/types";

interface TimelineProps {
  events: Event[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="w-full flex justify-between flex-row flex-wrap  ">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default Timeline;
