"use client";

import { useEffect } from "react";
import { MatrixRain } from "./MatrixRain";
import { KonamiTerminal } from "./KonamiTerminal";

const KONAMI_CODE = [
	"ArrowUp", "ArrowUp",
	"ArrowDown", "ArrowDown",
	"ArrowLeft", "ArrowRight",
	"ArrowLeft", "ArrowRight",
	"KeyB", "KeyA"
];

export const easterEggEvents = {
	konamiCode: "easter-egg:konami",
	matrixRain: "easter-egg:matrix",
};

export function EasterEggManager() {
	useEffect(() => {
		let konamiIndex = 0;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Konami Code detection
			if (e.code === KONAMI_CODE[konamiIndex]) {
				konamiIndex++;
				if (konamiIndex === KONAMI_CODE.length) {
					window.dispatchEvent(new CustomEvent(easterEggEvents.konamiCode));
					konamiIndex = 0;
				}
			} else {
				konamiIndex = 0;
				// Check if current key is the start of sequence
				if (e.code === KONAMI_CODE[0]) {
					konamiIndex = 1;
				}
			}

			// Matrix rain: Shift + C
			if (e.shiftKey && e.code === "KeyC") {
				e.preventDefault();
				window.dispatchEvent(new CustomEvent(easterEggEvents.matrixRain));
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<>
			<MatrixRain />
			<KonamiTerminal />
		</>
	);
}
