import type { FC } from "hono/jsx";
import { t } from "../i18n";
import { Layout } from "./Layout";

interface LoginPageProps {
	error?: string;
	lang?: string;
	logoUrl?: string;
	appTitle?: string;
}

const DefaultLogoIcon = () => (
	<svg
		class="w-8 h-8 text-white"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
		/>
	</svg>
);

export const LoginPage: FC<LoginPageProps> = ({
	error,
	lang = "en",
	logoUrl,
	appTitle = "Datastore",
}) => {
	return (
		<Layout
			title={t(lang as "en" | "de", "auth.title")}
			lang={lang}
			appTitle={appTitle}
		>
			<div class="min-h-screen flex items-center justify-center px-4">
				<div class="w-full max-w-md">
					{/* Logo/Brand */}
					<div class="text-center mb-8">
						{logoUrl ? (
							<div class="inline-flex items-center justify-center w-16 h-16 mb-4">
								<img
									src={logoUrl}
									alt={appTitle}
									class="w-full h-full object-cover rounded-2xl"
								/>
							</div>
						) : (
							<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/20">
								<DefaultLogoIcon />
							</div>
						)}
						<h1 class="text-2xl font-bold text-surface-100">{appTitle}</h1>
						<p class="text-surface-400 mt-1">
							{t(lang as "en" | "de", "auth.subtitle")}
						</p>
					</div>

					{/* Login Card */}
					<div class="card">
						{error && (
							<div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
								{error}
							</div>
						)}

						<form method="post" action="/auth/login" class="space-y-4">
							<div>
								<label
									for="email"
									class="block text-sm font-medium text-surface-300 mb-1.5"
								>
									{t(lang as "en" | "de", "auth.email")}
								</label>
								<input
									type="email"
									id="email"
									name="email"
									required
									class="input"
									placeholder="you@example.com"
									autocomplete="email"
								/>
							</div>

							<div>
								<label
									for="password"
									class="block text-sm font-medium text-surface-300 mb-1.5"
								>
									{t(lang as "en" | "de", "auth.password")}
								</label>
								<input
									type="password"
									id="password"
									name="password"
									required
									class="input"
									placeholder="••••••••"
									autocomplete="current-password"
								/>
							</div>

							<button type="submit" class="btn btn-primary w-full">
								{t(lang as "en" | "de", "auth.login")}
							</button>
						</form>
					</div>

					<p class="text-center text-surface-500 text-sm mt-6">
						{t(lang as "en" | "de", "auth.contactAdmin")}
					</p>
				</div>
			</div>
		</Layout>
	);
};
