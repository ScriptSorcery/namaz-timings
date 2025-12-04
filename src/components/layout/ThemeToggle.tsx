import { useEffect, useState } from "react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { Button } from "../ui/button";

export default function ThemeToggle() {
	const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
		const saved = localStorage.getItem("theme");
		return (saved as any) ?? "system";
	});

	const [isMobile, setIsMobile] = useState<boolean>(() =>
		typeof window !== "undefined"
			? window.matchMedia("(max-width: 640px)").matches
			: false
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mql = window.matchMedia("(max-width: 640px)");
		const handler = (e: MediaQueryListEvent | MediaQueryList) =>
			setIsMobile(Boolean((e as any).matches));
		// set initial
		setIsMobile(mql.matches);
		// add listener (supports older browsers)
		if (mql.addEventListener) mql.addEventListener("change", handler);
		else mql.addListener(handler);
		return () => {
			if (mql.removeEventListener)
				mql.removeEventListener("change", handler);
			else mql.removeListener(handler);
		};
	}, []);

	useEffect(() => {
		const apply = (t: "light" | "dark" | "system") => {
			const root = document.documentElement;
			if (t === "system") {
				const prefersDark =
					window.matchMedia &&
					window.matchMedia("(prefers-color-scheme: dark)").matches;
				root.classList.toggle("dark", prefersDark);
				localStorage.removeItem("theme");
			} else {
				root.classList.toggle("dark", t === "dark");
				localStorage.setItem("theme", t);
			}
		};

		apply(theme);

		// if using "system", respond to changes
		const mql =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			if (localStorage.getItem("theme") === null) {
				// only react when no explicit preference stored
				document.documentElement.classList.toggle("dark", mql.matches);
			}
		};
		mql?.addEventListener?.("change", handler);
		return () => mql?.removeEventListener?.("change", handler);
	}, [theme]);

	const cycle = () => {
		setTheme((prev) =>
			prev === "light" ? "dark" : prev === "dark" ? "system" : "light"
		);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					aria-label="Toggle theme"
					onClick={cycle}
				>
					{theme === "dark" ? (
						<Moon />
					) : theme === "light" ? (
						<Sun />
					) : isMobile ? (
						<Smartphone />
					) : (
						<Monitor />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top">Theme: {String(theme).charAt(0).toUpperCase() + String(theme).slice(1)}</TooltipContent>
		</Tooltip>
	);
}