"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { monzaTrack, generateSmoothCurve, type TrackPoint } from "@/lib/tracks/monza";

interface TrackSceneProps {
	progress: number; // 0 to 1
}

function TrackScene({ progress }: TrackSceneProps) {
	const groupRef = useRef<THREE.Group>(null);

	// 生成平滑曲线
	const smoothTrack = useMemo(() => generateSmoothCurve(monzaTrack, 200), []);

	// 根据进度计算要绘制的点数
	const visiblePoints = useMemo(() => {
		const count = Math.floor(smoothTrack.length * progress);
		return smoothTrack.slice(0, Math.max(2, count));
	}, [smoothTrack, progress]);

	// 转换为 Three.js Line 需要的格式
	const linePoints = useMemo(() => {
		return visiblePoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
	}, [visiblePoints]);

	// 旋转动画
	useFrame(() => {
		if (groupRef.current) {
			groupRef.current.rotation.y += 0.002;
		}
	});

	return (
		<group ref={groupRef}>
			{/* 霓虹赛道线条 */}
			{linePoints.length >= 2 && (
				<Line
					points={linePoints}
					color="#E10600"
					lineWidth={3}
					opacity={0.9}
				/>
			)}

			{/* 发光效果 - 第二层更粗的线 */}
			{linePoints.length >= 2 && (
				<Line
					points={linePoints}
					color="#E10600"
					lineWidth={8}
					opacity={0.3}
				/>
			)}

			{/* 赛道端点光点 */}
			{linePoints.length >= 2 && (
				<mesh position={linePoints[linePoints.length - 1]}>
					<sphereGeometry args={[0.1, 16, 16]} />
					<meshBasicMaterial color="#ff6600" />
				</mesh>
			)}
		</group>
	);
}

interface Track3DProps {
	progress: number;
}

export default function Track3D({ progress }: Track3DProps) {
	return (
		<div className="w-full h-screen fixed inset-0">
			<Canvas
				camera={{ position: [0, 3, 8], fov: 60 }}
				style={{ background: "#0a0a0a" }}
			>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} intensity={1} />
				<TrackScene progress={progress} />
			</Canvas>
		</div>
	);
}
