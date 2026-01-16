import type { FC } from "hono/jsx";
import { t } from "../i18n";
import type { DataStore, SessionPayload } from "../types";
import { Navbar } from "./components/Navbar";
import { Layout } from "./Layout";

interface DashboardPageProps {
	session: SessionPayload;
	datastores: DataStore[];
	lang?: string;
	logoUrl?: string;
	appTitle?: string;
}

export const DashboardPage: FC<DashboardPageProps> = ({
	session,
	datastores,
	lang = "en",
	logoUrl,
	appTitle = "Datastore",
}) => {
	return (
		<Layout title={`Dashboard - ${appTitle}`} lang={lang} appTitle={appTitle}>
			<div class="min-h-screen">
				<Navbar
					session={session}
					lang={lang}
					logoUrl={logoUrl}
					appTitle={appTitle}
				/>

				{/* Main Content */}
				<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div class="mb-8">
						<h1 class="text-2xl font-bold text-surface-100">
							{t(lang as "en" | "de", "dashboard.title")}
						</h1>
						<p class="text-surface-400 mt-1">
							{t(lang as "en" | "de", "dashboard.subtitle")}
						</p>
					</div>

					{datastores.length === 0 ? (
						<div class="card text-center py-12">
							<div class="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									class="w-8 h-8 text-surface-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
									/>
								</svg>
							</div>
							<h3 class="text-lg font-medium text-surface-200">
								{t(lang as "en" | "de", "dashboard.noDatastores")}
							</h3>
							<p class="text-surface-400 mt-1">
								{t(lang as "en" | "de", "dashboard.contactAdmin")}
							</p>
						</div>
					) : (
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{datastores.map((ds) => (
								<a
									href={`/datastores/${ds.slug}`}
									class="card group hover:border-primary-500/50 hover:bg-surface-800/50 transition-all duration-200 cursor-pointer"
								>
									<div class="flex items-start justify-between">
										<div class="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
											<svg
												class="w-5 h-5 text-primary-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<svg
											class="w-5 h-5 text-surface-500 group-hover:text-primary-400 transition-colors"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
									<h3 class="mt-4 font-semibold text-surface-100 group-hover:text-primary-400 transition-colors">
										{ds.name}
									</h3>
									{ds.description && (
										<p class="mt-1 text-sm text-surface-400 line-clamp-2">
											{ds.description}
										</p>
									)}
									<div class="mt-3 flex items-center gap-2 text-xs text-surface-500">
										<span class="px-2 py-0.5 bg-surface-800 rounded">
											{ds.column_definitions.length}{" "}
											{t(lang as "en" | "de", "dashboard.columns")}
										</span>
										<span class="px-2 py-0.5 bg-surface-800 rounded font-mono">
											{ds.slug}
										</span>
									</div>
								</a>
							))}
						</div>
					)}
				</main>
			</div>
		</Layout>
	);
};
