import type { FC } from "hono/jsx";
import { DatabaseIcon } from "./Icons";

interface LogoProps {
	logoUrl?: string;
	appTitle: string;
	size?: "sm" | "lg";
}

export const Logo: FC<LogoProps> = ({ logoUrl, appTitle, size = "sm" }) => {
	const sizeClasses = size === "lg" ? "w-16 h-16" : "w-8 h-8";
	const iconClass = size === "lg" ? "w-8 h-8" : "w-4 h-4";
	const roundedClass = size === "lg" ? "rounded-2xl" : "rounded-lg";

	if (logoUrl) {
		return (
			<img
				src={logoUrl}
				alt={appTitle}
				class={`${sizeClasses} object-cover ${roundedClass}`}
			/>
		);
	}

	return (
		<div
			class={`${sizeClasses} bg-gradient-to-br from-primary-500 to-primary-700 ${roundedClass} flex items-center justify-center ${size === "lg" ? "shadow-lg shadow-primary-500/20" : ""}`}
		>
			<DatabaseIcon class={iconClass} />
		</div>
	);
};
