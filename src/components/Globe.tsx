import { onCleanup, onMount } from "solid-js";
import * as d3 from "d3";
import worldData from "../lib/world.json";

type Props = {
  /**
   * Whether the globe can be dragged. Off by default so the decorative globe
   * on the home page never swallows a touch scroll.
   */
  interactive?: boolean;
};

const GlobeComponent = (props: Props) => {
  let mapContainer: HTMLDivElement | undefined;

  const visitedCountries = [
    "India",
    "United States",
    "Canada",
    "Australia",
    "New Zealand",
    "China",
    "Japan"
  ];

  let rotationInterval: NodeJS.Timeout | undefined;
  let inactivityTimeout: NodeJS.Timeout | undefined;
  let projection: d3.GeoProjection;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let outline: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  const sensitivity = 75;
  const maxSize = 500;

  const redraw = () => {
    svg.selectAll("path").attr("d", (d: any) => d3.geoPath().projection(projection)(d));
  };

  // The globe is sized off the container so it never spills past a phone's
  // viewport, and capped so it keeps its original size on large screens.
  const measure = () => {
    const width = mapContainer?.clientWidth || window.innerWidth;
    const size = Math.max(160, Math.min(width, window.innerHeight * 0.8, maxSize));
    return { width, size };
  };

  const applySize = () => {
    const { width, size } = measure();
    const radius = size / 2 - 2;

    svg.attr("width", width).attr("height", size);
    projection.scale(radius).translate([width / 2, size / 2]);
    outline.attr("cx", width / 2).attr("cy", size / 2).attr("r", radius);
    redraw();
  };

  const startRotation = () => {
    if (rotationInterval) return; // Prevent multiple intervals

    rotationInterval = setInterval(() => {
      const rotate = projection.rotate();
      projection.rotate([rotate[0] + 0.1, rotate[1]]); // Smaller increment for smoother rotation
      redraw();
    }, 50); // Shorter interval for smoother updates
  };

  const stopRotation = () => {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = undefined;
    }
  };

  const resetInactivityTimeout = () => {
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    inactivityTimeout = setTimeout(() => {
      startRotation();
    }, 10000); // Restart rotation after 10 seconds
  };

  onMount(() => {
    if (!mapContainer) return;

    projection = d3
      .geoOrthographic()
      .scale(250)
      .center([0, 0])
      .rotate([0, -30]);

    svg = d3.select(mapContainer).append("svg");

    outline = svg
      .append("circle")
      .attr("fill", "#EEE")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2");

    const map = svg.append("g");

    map
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("fill", (d: { properties: { name: string } }) =>
        visitedCountries.includes(d.properties.name) ? "#E63946" : "white"
      )
      .style("stroke", "black")
      .style("stroke-width", 0.3)
      .style("opacity", 0.8);

    applySize();

    let lastX: number, lastY: number, isDragging = false;

    const onDragStart = (event: MouseEvent | TouchEvent) => {
      isDragging = true;
      const { clientX, clientY } = getEventPoint(event);
      lastX = clientX;
      lastY = clientY;
      stopRotation(); // Stop rotation on drag
    };

    const onDrag = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      // Keep a touch drag on the globe from scrolling the page behind it.
      if ("touches" in event && event.cancelable) event.preventDefault();

      const { clientX, clientY } = getEventPoint(event);
      const dx = clientX - lastX;
      const dy = clientY - lastY;

      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();

      projection.rotate([rotate[0] + dx * k, rotate[1] - dy * k]);
      redraw();

      lastX = clientX;
      lastY = clientY;

      resetInactivityTimeout(); // Reset inactivity timer on drag
    };

    const onDragEnd = () => {
      isDragging = false;
      resetInactivityTimeout(); // Reset inactivity timer on drag end
    };

    const getEventPoint = (event: MouseEvent | TouchEvent) => {
      if ('touches' in event) {
        return {
          clientX: event.touches[0].clientX,
          clientY: event.touches[0].clientY,
        };
      } else {
        return {
          clientX: event.clientX,
          clientY: event.clientY,
        };
      }
    };

    if (props.interactive) {
      svg
        .on("mousedown touchstart", onDragStart)
        .on("mousemove touchmove", onDrag)
        .on("mouseup touchend touchcancel", onDragEnd);
    }

    const onResize = () => applySize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    onCleanup(() => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      stopRotation();
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
    });

    // Start the globe rotation
    startRotation();
  });

  return (
    <div class="flex flex-col text-white justify-center items-center w-full h-full">
      <div
        class={`w-full flex justify-center items-center ${
          props.interactive ? "touch-none select-none" : ""
        }`}
        ref={mapContainer}
      />
    </div>
  );
};

export default GlobeComponent;
