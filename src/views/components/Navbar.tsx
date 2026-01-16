import type { FC, PropsWithChildren } from "hono/jsx";
import { t } from "../../i18n";
import type { SessionPayload } from "../../types";
import { CloseIcon, MenuIcon } from "./Icons";
import { Logo } from "./Logo";

interface NavbarProps {
	session: SessionPayload;
	lang: string;
	logoUrl?: string;
	appTitle: string;
	/** Optional breadcrumb text (e.g., datastore name) */
	breadcrumb?: string;
	/** Show organization link in nav (default: true) */
	showOrgLink?: boolean;
}

export const Navbar: FC<PropsWithChildren<NavbarProps>> = ({
	session,
	lang,
	logoUrl,
	appTitle,
	breadcrumb,
	showOrgLink = true,
	children,
}) => {
	const langCode = lang as "en" | "de";
	const menuId = "mobile-menu";

	return (
		<header class="border-b border-surface-800 bg-surface-900/50 backdrop-blur-sm sticky top-0 z-10">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between h-16">
					{/* Logo and breadcrumb */}
					<div class="flex items-center gap-3 min-w-0">
						<a
							href="/"
							class="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
						>
							<Logo logoUrl={logoUrl} appTitle={appTitle} />
						</a>
						{breadcrumb ? (
							<>
								<span class="text-surface-500 flex-shrink-0">/</span>
								<span class="font-semibold text-surface-100 truncate">
									{breadcrumb}
								</span>
							</>
						) : (
							<span class="font-semibold text-surface-100 hidden sm:block">
								{appTitle}
							</span>
						)}
					</div>

					{/* Desktop nav items */}
					<div class="hidden md:flex items-center gap-4">
						{/* Extra items passed as children (e.g., settings button) */}
						{children}
						{showOrgLink && (
							<a
								href="/org"
								class="text-sm text-surface-400 hover:text-surface-200 transition-colors cursor-pointer"
							>
								{t(langCode, "org.title")}
							</a>
						)}
						<span class="text-sm text-surface-400 truncate max-w-[200px]">
							{session.email}
						</span>
						<form method="post" action="/auth/logout">
							<button
								type="submit"
								class="text-sm text-surface-400 hover:text-surface-200 transition-colors cursor-pointer"
							>
								{t(langCode, "common.signOut")}
							</button>
						</form>
					</div>

					{/* Mobile menu button */}
					<button
						type="button"
						class="md:hidden p-2 text-surface-400 hover:text-surface-200 cursor-pointer"
						onclick={`document.getElementById('${menuId}').classList.toggle('hidden')`}
						aria-label="Toggle menu"
					>
						<MenuIcon />
					</button>
				</div>

				{/* Mobile menu dropdown */}
				<div
					id={menuId}
					class="hidden md:hidden border-t border-surface-800 py-3 space-y-1"
				>
					{/* Extra items in mobile menu */}
					{children && (
						<div class="px-2 py-2 border-b border-surface-800 mb-2">
							{children}
						</div>
					)}
					{showOrgLink && (
						<a
							href="/org"
							class="block px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 rounded-lg cursor-pointer"
						>
							{t(langCode, "org.title")}
						</a>
					)}
					<div class="px-3 py-2 text-sm text-surface-500">{session.email}</div>
					<form method="post" action="/auth/logout" class="px-1">
						<button
							type="submit"
							class="w-full text-left px-2 py-2 text-sm text-surface-300 hover:bg-surface-800 rounded-lg cursor-pointer"
						>
							{t(langCode, "common.signOut")}
						</button>
					</form>
				</div>
			</div>
		</header>
	);
};
