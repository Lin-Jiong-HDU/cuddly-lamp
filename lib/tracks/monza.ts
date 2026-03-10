// 蒙扎赛道简化路径数据
// 坐标系: X 左右, Z 前后, Y 上下
// 赛道围绕中心点，用户在中心位置

export interface TrackPoint {
	x: number;
	y: number;
	z: number;
}

// 简化的蒙扎赛道轮廓点
// 缩放到适合 3D 场景的尺寸
export const monzaTrack: TrackPoint[] = [
	// 起点直线
	{ x: 0, y: 0, z: -5 },
	{ x: 0.5, y: 0, z: -4 },
	{ x: 1, y: 0, z: -3 },
	{ x: 1.5, y: 0, z: -2 },
	// 第一弯 (Variante del Rettifilo)
	{ x: 2, y: 0, z: -1 },
	{ x: 2.5, y: 0, z: 0 },
	{ x: 2.8, y: 0, z: 1 },
	// 直道
	{ x: 3, y: 0, z: 2 },
	{ x: 3, y: 0, z: 3 },
	{ x: 2.8, y: 0, z: 4 },
	// 第二弯 (Curva Grande)
	{ x: 2.5, y: 0, z: 4.5 },
	{ x: 2, y: 0, z: 4.8 },
	{ x: 1.5, y: 0, z: 5 },
	{ x: 1, y: 0, z: 5 },
	// 后直道
	{ x: 0, y: 0, z: 5 },
	{ x: -1, y: 0, z: 5 },
	{ x: -2, y: 0, z: 4.8 },
	// Variante della Roggia
	{ x: -2.5, y: 0, z: 4.5 },
	{ x: -3, y: 0, z: 4 },
	{ x: -3.2, y: 0, z: 3 },
	// Curva di Lesmo 双弯
	{ x: -3.5, y: 0, z: 2 },
	{ x: -3.8, y: 0, z: 1 },
	{ x: -4, y: 0, z: 0 },
	{ x: -3.8, y: 0, z: -1 },
	// Serraglio 直道
	{ x: -3.5, y: 0, z: -2 },
	{ x: -3, y: 0, z: -3 },
	{ x: -2.5, y: 0, z: -4 },
	// Variante Ascari
	{ x: -2, y: 0, z: -4.5 },
	{ x: -1.5, y: 0, z: -4.8 },
	{ x: -1, y: 0, z: -5 },
	{ x: -0.5, y: 0, z: -5 },
	// Curva Parabolica
	{ x: 0, y: 0, z: -5 },
];

// 生成平滑曲线的函数
export function generateSmoothCurve(points: TrackPoint[], segments: number = 100): TrackPoint[] {
	const result: TrackPoint[] = [];
	const totalPoints = points.length;

	for (let i = 0; i < segments; i++) {
		const t = i / segments;
		const index = t * (totalPoints - 1);
		const lower = Math.floor(index);
		const upper = Math.min(lower + 1, totalPoints - 1);
		const frac = index - lower;

		const p0 = points[lower];
		const p1 = points[upper];

		result.push({
			x: p0.x + (p1.x - p0.x) * frac,
			y: p0.y + (p1.y - p0.y) * frac,
			z: p0.z + (p1.z - p0.z) * frac,
		});
	}

	return result;
}
