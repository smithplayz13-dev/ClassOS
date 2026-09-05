import { ImageResponse } from "next/og";
import { createElement } from "react";

export function GET(request: Request) {
  const size =
    new URL(request.url).searchParams.get("size") === "192" ? 192 : 512;
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#b4e59a",
          color: "#182218",
          fontSize: Math.round(size * 0.38),
          fontWeight: 700,
        },
      },
      "CO",
    ),
    { width: size, height: size },
  );
}
