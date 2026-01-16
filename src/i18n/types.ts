/**
 * Complete translation keys structure.
 * English translations must implement all keys.
 * Other languages can use Partial<TranslationKeys> to omit keys (which will fallback to English).
 */
export interface TranslationKeys {
	common: {
		signOut: string;
		actions: string;
		cancel: string;
		save: string;
		saving: string;
		edit: string;
		delete: string;
		previous: string;
		next: string;
		showing: string;
		to: string;
		of: string;
		select: string;
		required: string;
	};
	auth: {
		login: string;
		email: string;
		password: string;
		title: string;
		subtitle: string;
		contactAdmin: string;
	};
	errors: {
		emailPasswordRequired: string;
		invalidCredentials: string;
		notAuthenticated: string;
		invalidSession: string;
		apiKeyRequired: string;
		invalidApiKey: string;
		invalidAdminToken: string;
		missingAuthHeader: string;
		nameRequired: string;
		orgNotFound: string;
		userNotFound: string;
		emailExists: string;
		emailPasswordOrgRequired: string;
		datastoreNotFound: string;
		recordNotFound: string;
		slugExists: string;
		datastoreRequired: string;
		datastoreIdRequired: string;
		datastoreIdNameRequired: string;
		apiKeyNotFound: string;
		fileUploadsNotConfigured: string;
		noFileProvided: string;
		fileNotFound: string;
		fileNotFoundOrAccessDenied: string;
		fileNotFoundInStorage: string;
		failedToCreateFileRecord: string;
		s3NotConfigured: string;
		forbidden: string;
		authenticationRequired: string;
		dataFieldRequired: string;
		validationFailed: string;
		fieldRequired: string;
		fieldMustBeNumber: string;
		fieldMustBeAtLeast: string;
		fieldMustBeAtMost: string;
		fieldMustBeBoolean: string;
		fieldMustBeValidDate: string;
		fieldMustBeOneOf: string;
		fieldMustBeString: string;
		fieldInvalidFormat: string;
		fieldMustBeFileReference: string;
		fieldMustHaveValidFileId: string;
		fileSizeExceeded: string;
		invalidContentType: string;
	};
	dashboard: {
		title: string;
		subtitle: string;
		noDatastores: string;
		contactAdmin: string;
		columns: string;
	};
	datastore: {
		addRecord: string;
		editRecord: string;
		noRecords: string;
		deleteConfirm: string;
		currentFile: string;
		selectNewFile: string;
		uploading: string;
		createdBy: string;
		createdAt: string;
		updatedBy: string;
		updatedAt: string;
		settings: string;
		cacheSettings: string;
		cacheDurationLabel: string;
		cacheDurationDescription: string;
		cacheDurationPlaceholder: string;
		cacheDurationInvalid: string;
		corsOriginsLabel: string;
		corsOriginsDescription: string;
		corsOriginsPlaceholder: string;
		corsOriginsInvalid: string;
	};
	org: {
		title: string;
		subtitle: string;
		name: string;
		createdAt: string;
		updatedAt: string;
		members: string;
		memberEmail: string;
		memberSince: string;
		readOnlyNotice: string;
		noOrgAccess: string;
		you: string;
	};
}
