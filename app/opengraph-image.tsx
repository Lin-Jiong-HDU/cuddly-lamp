import { ImageResponse } from "next/og";

export const alt = "JohnLin 的博客";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background:
						"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 80,
						height: 80,
						borderRadius: "50%",
						background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
						marginBottom: 32,
					}}
				>
					<span style={{ fontSize: 40, color: "white" }}>{"J"}</span>
				</div>
				<div
					style={{
						fontSize: 56,
						fontWeight: 700,
						color: "white",
						marginBottom: 16,
						display: "flex",
					}}
				>
					{"JohnLin 的博客"}
				</div>
				<div style={{ fontSize: 24, color: "#94a3b8", display: "flex" }}>
					{"技术学习与思考"}
				</div>
			</div>
		),
		{ ...size },
	);
}
