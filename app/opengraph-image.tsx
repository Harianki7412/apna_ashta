import { ImageResponse } from "next/og";

export const alt = "Flatova — verified rooms, flats, and homes for rent in Ashta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #f97316 150%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, opacity: 0.9 }}>
          FLATOVA
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            fontSize: 68,
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          <span>Find a place</span>
          <span>to call home.</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 30, opacity: 0.9 }}>
          Verified rentals in Ashta, direct from owners
        </div>
      </div>
    ),
    size,
  );
}
