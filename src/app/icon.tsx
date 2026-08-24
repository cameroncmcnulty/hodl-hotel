import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: "linear-gradient(135deg,#9945FF,#14F195)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#120e1c",
          fontSize: 36,
          fontWeight: 800,
        }}
      >
        H
      </div>
    ),
    size
  );
}
