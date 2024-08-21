import React from "react";
import EventCard from "./EventCard";
import Masonry from "react-masonry-css";
import { Event } from "../../lib/types";

interface TimelineProps {
  events: Event[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const breakpointColumnsObj = {
    default: 2, // Number of columns for default (large) screens
    1100: 2, // Number of columns for screen widths <= 1100px
    600: 1, // Number of columns for screen widths <= 700px
  };

  return (
    <Masonry breakpointCols={breakpointColumnsObj} className="flex w-full">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </Masonry>
  );
};

export default Timeline;
