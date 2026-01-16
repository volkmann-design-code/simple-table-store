import type { FC } from "hono/jsx";
import { t } from "../i18n";
import { Logo } from "./components/Logo";
import { Layout } from "./Layout";

interface LoginPageProps {
	error?: string;
	lang?: string;
	logoUrl?: string;
	appTitle?: string;
}

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
						<div class="inline-flex items-center justify-center mb-4">
							<Logo logoUrl={logoUrl} appTitle={appTitle} size="lg" />
						</div>
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
