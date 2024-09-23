import { onMount } from "solid-js";
import * as d3 from "d3";
import worldData from "../lib/world.json";

const GlobeComponent = () => {
  let mapContainer: HTMLDivElement | undefined;

  const visitedCountries = [
    "India",
    "United States",
    "Canada",
    "Australia",
    "New Zealand"
  ];

  let rotationInterval: NodeJS.Timeout | undefined;
  let inactivityTimeout: NodeJS.Timeout | undefined;
  let projection: d3.GeoProjection;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  const sensitivity = 75;

  const startRotation = () => {
    if (rotationInterval) return; // Prevent multiple intervals

    rotationInterval = setInterval(() => {
      const rotate = projection.rotate();
      projection.rotate([rotate[0] + 0.1, rotate[1]]); // Smaller increment for smoother rotation
      svg.selectAll("path").attr("d", (d: any) => d3.geoPath().projection(projection)(d));
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

    const width = mapContainer.clientWidth;
    const height = 500;

    projection = d3
      .geoOrthographic()
      .scale(250)
      .center([0, 0])
      .rotate([0, -30])
      .translate([width / 2, height / 2]);

    svg = d3
      .select(mapContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg
      .append("circle")
      .attr("fill", "#EEE")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale());

    const map = svg.append("g");

    map
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", (d: any) => d3.geoPath().projection(projection)(d))
      .attr("fill", (d: { properties: { name: string } }) =>
        visitedCountries.includes(d.properties.name) ? "#E63946" : "white"
      )
      .style("stroke", "black")
      .style("stroke-width", 0.3)
      .style("opacity", 0.8);

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

      const { clientX, clientY } = getEventPoint(event);
      const dx = clientX - lastX;
      const dy = clientY - lastY;

      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();

      projection.rotate([rotate[0] + dx * k, rotate[1] - dy * k]);
      svg.selectAll("path").attr("d", (d: any) => d3.geoPath().projection(projection)(d));

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

    svg
      .on("mousedown touchstart", onDragStart)
      .on("mousemove touchmove", onDrag)
      .on("mouseup touchend", onDragEnd);

    // Start the globe rotation
    startRotation();
  });

  return (
    <div class="flex flex-col text-white justify-center items-center w-full h-full">
      <div class="w-full" ref={mapContainer}></div>
    </div>
  );
};

export default GlobeComponent;
