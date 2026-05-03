import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ActivityItem, CreateEvidenceFileBody, CreateProviderBody, DashboardStats, ErrorResponse, EvidenceFile, FolderNode, HealthStatus, ListEvidenceFilesParams, ListProvidersParams, ListReviewItemsParams, MapProvider, PasteUploadBody, Provider, ProviderDetail, ReviewCounts, ReviewItem, SearchParams, SearchResults, StateCoverage, UpdateEvidenceFileBody, UpdateProviderBody, UpdateReviewItemBody, UploadFileBody, UploadResult } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get dashboard statistics
 */
export declare const getGetDashboardStatsUrl: () => string;
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get recent uploaded evidence files
 */
export declare const getGetRecentUploadsUrl: () => string;
export declare const getRecentUploads: (options?: RequestInit) => Promise<EvidenceFile[]>;
export declare const getGetRecentUploadsQueryKey: () => readonly ["/api/dashboard/recent-uploads"];
export declare const getGetRecentUploadsQueryOptions: <TData = Awaited<ReturnType<typeof getRecentUploads>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentUploads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentUploads>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentUploadsQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentUploads>>>;
export type GetRecentUploadsQueryError = ErrorType<unknown>;
/**
 * @summary Get recent uploaded evidence files
 */
export declare function useGetRecentUploads<TData = Awaited<ReturnType<typeof getRecentUploads>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentUploads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get recent activity feed
 */
export declare const getGetDashboardActivityUrl: () => string;
export declare const getDashboardActivity: (options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetDashboardActivityQueryKey: () => readonly ["/api/dashboard/activity"];
export declare const getGetDashboardActivityQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardActivity>>>;
export type GetDashboardActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent activity feed
 */
export declare function useGetDashboardActivity<TData = Awaited<ReturnType<typeof getDashboardActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List evidence files
 */
export declare const getListEvidenceFilesUrl: (params?: ListEvidenceFilesParams) => string;
export declare const listEvidenceFiles: (params?: ListEvidenceFilesParams, options?: RequestInit) => Promise<EvidenceFile[]>;
export declare const getListEvidenceFilesQueryKey: (params?: ListEvidenceFilesParams) => readonly ["/api/evidence", ...ListEvidenceFilesParams[]];
export declare const getListEvidenceFilesQueryOptions: <TData = Awaited<ReturnType<typeof listEvidenceFiles>>, TError = ErrorType<unknown>>(params?: ListEvidenceFilesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEvidenceFiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEvidenceFiles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEvidenceFilesQueryResult = NonNullable<Awaited<ReturnType<typeof listEvidenceFiles>>>;
export type ListEvidenceFilesQueryError = ErrorType<unknown>;
/**
 * @summary List evidence files
 */
export declare function useListEvidenceFiles<TData = Awaited<ReturnType<typeof listEvidenceFiles>>, TError = ErrorType<unknown>>(params?: ListEvidenceFilesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEvidenceFiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create evidence file record (after upload)
 */
export declare const getCreateEvidenceFileUrl: () => string;
export declare const createEvidenceFile: (createEvidenceFileBody: CreateEvidenceFileBody, options?: RequestInit) => Promise<EvidenceFile>;
export declare const getCreateEvidenceFileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvidenceFile>>, TError, {
        data: BodyType<CreateEvidenceFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEvidenceFile>>, TError, {
    data: BodyType<CreateEvidenceFileBody>;
}, TContext>;
export type CreateEvidenceFileMutationResult = NonNullable<Awaited<ReturnType<typeof createEvidenceFile>>>;
export type CreateEvidenceFileMutationBody = BodyType<CreateEvidenceFileBody>;
export type CreateEvidenceFileMutationError = ErrorType<unknown>;
/**
 * @summary Create evidence file record (after upload)
 */
export declare const useCreateEvidenceFile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvidenceFile>>, TError, {
        data: BodyType<CreateEvidenceFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEvidenceFile>>, TError, {
    data: BodyType<CreateEvidenceFileBody>;
}, TContext>;
/**
 * @summary Get evidence file by ID
 */
export declare const getGetEvidenceFileUrl: (id: number) => string;
export declare const getEvidenceFile: (id: number, options?: RequestInit) => Promise<EvidenceFile>;
export declare const getGetEvidenceFileQueryKey: (id: number) => readonly [`/api/evidence/${number}`];
export declare const getGetEvidenceFileQueryOptions: <TData = Awaited<ReturnType<typeof getEvidenceFile>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEvidenceFile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEvidenceFile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEvidenceFileQueryResult = NonNullable<Awaited<ReturnType<typeof getEvidenceFile>>>;
export type GetEvidenceFileQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get evidence file by ID
 */
export declare function useGetEvidenceFile<TData = Awaited<ReturnType<typeof getEvidenceFile>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEvidenceFile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update evidence file metadata
 */
export declare const getUpdateEvidenceFileUrl: (id: number) => string;
export declare const updateEvidenceFile: (id: number, updateEvidenceFileBody: UpdateEvidenceFileBody, options?: RequestInit) => Promise<EvidenceFile>;
export declare const getUpdateEvidenceFileMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEvidenceFile>>, TError, {
        id: number;
        data: BodyType<UpdateEvidenceFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEvidenceFile>>, TError, {
    id: number;
    data: BodyType<UpdateEvidenceFileBody>;
}, TContext>;
export type UpdateEvidenceFileMutationResult = NonNullable<Awaited<ReturnType<typeof updateEvidenceFile>>>;
export type UpdateEvidenceFileMutationBody = BodyType<UpdateEvidenceFileBody>;
export type UpdateEvidenceFileMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update evidence file metadata
 */
export declare const useUpdateEvidenceFile: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEvidenceFile>>, TError, {
        id: number;
        data: BodyType<UpdateEvidenceFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEvidenceFile>>, TError, {
    id: number;
    data: BodyType<UpdateEvidenceFileBody>;
}, TContext>;
/**
 * @summary Delete evidence file
 */
export declare const getDeleteEvidenceFileUrl: (id: number) => string;
export declare const deleteEvidenceFile: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEvidenceFileMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEvidenceFile>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEvidenceFile>>, TError, {
    id: number;
}, TContext>;
export type DeleteEvidenceFileMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEvidenceFile>>>;
export type DeleteEvidenceFileMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete evidence file
 */
export declare const useDeleteEvidenceFile: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEvidenceFile>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEvidenceFile>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get folder tree structure for evidence library
 */
export declare const getGetEvidenceFolderTreeUrl: () => string;
export declare const getEvidenceFolderTree: (options?: RequestInit) => Promise<FolderNode[]>;
export declare const getGetEvidenceFolderTreeQueryKey: () => readonly ["/api/evidence/folder-tree"];
export declare const getGetEvidenceFolderTreeQueryOptions: <TData = Awaited<ReturnType<typeof getEvidenceFolderTree>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEvidenceFolderTree>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEvidenceFolderTree>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEvidenceFolderTreeQueryResult = NonNullable<Awaited<ReturnType<typeof getEvidenceFolderTree>>>;
export type GetEvidenceFolderTreeQueryError = ErrorType<unknown>;
/**
 * @summary Get folder tree structure for evidence library
 */
export declare function useGetEvidenceFolderTree<TData = Awaited<ReturnType<typeof getEvidenceFolderTree>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEvidenceFolderTree>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Upload a file (multipart/form-data)
 */
export declare const getUploadFileUrl: () => string;
export declare const uploadFile: (uploadFileBody: UploadFileBody, options?: RequestInit) => Promise<UploadResult>;
export declare const getUploadFileMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadFile>>, TError, {
        data: BodyType<UploadFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadFile>>, TError, {
    data: BodyType<UploadFileBody>;
}, TContext>;
export type UploadFileMutationResult = NonNullable<Awaited<ReturnType<typeof uploadFile>>>;
export type UploadFileMutationBody = BodyType<UploadFileBody>;
export type UploadFileMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Upload a file (multipart/form-data)
 */
export declare const useUploadFile: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadFile>>, TError, {
        data: BodyType<UploadFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadFile>>, TError, {
    data: BodyType<UploadFileBody>;
}, TContext>;
/**
 * @summary Upload pasted text or notes
 */
export declare const getUploadPastedTextUrl: () => string;
export declare const uploadPastedText: (pasteUploadBody: PasteUploadBody, options?: RequestInit) => Promise<UploadResult>;
export declare const getUploadPastedTextMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadPastedText>>, TError, {
        data: BodyType<PasteUploadBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadPastedText>>, TError, {
    data: BodyType<PasteUploadBody>;
}, TContext>;
export type UploadPastedTextMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPastedText>>>;
export type UploadPastedTextMutationBody = BodyType<PasteUploadBody>;
export type UploadPastedTextMutationError = ErrorType<unknown>;
/**
 * @summary Upload pasted text or notes
 */
export declare const useUploadPastedText: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadPastedText>>, TError, {
        data: BodyType<PasteUploadBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadPastedText>>, TError, {
    data: BodyType<PasteUploadBody>;
}, TContext>;
/**
 * @summary List providers
 */
export declare const getListProvidersUrl: (params?: ListProvidersParams) => string;
export declare const listProviders: (params?: ListProvidersParams, options?: RequestInit) => Promise<Provider[]>;
export declare const getListProvidersQueryKey: (params?: ListProvidersParams) => readonly ["/api/providers", ...ListProvidersParams[]];
export declare const getListProvidersQueryOptions: <TData = Awaited<ReturnType<typeof listProviders>>, TError = ErrorType<unknown>>(params?: ListProvidersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProviders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProviders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProvidersQueryResult = NonNullable<Awaited<ReturnType<typeof listProviders>>>;
export type ListProvidersQueryError = ErrorType<unknown>;
/**
 * @summary List providers
 */
export declare function useListProviders<TData = Awaited<ReturnType<typeof listProviders>>, TError = ErrorType<unknown>>(params?: ListProvidersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProviders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a provider record
 */
export declare const getCreateProviderUrl: () => string;
export declare const createProvider: (createProviderBody: CreateProviderBody, options?: RequestInit) => Promise<Provider>;
export declare const getCreateProviderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProvider>>, TError, {
        data: BodyType<CreateProviderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProvider>>, TError, {
    data: BodyType<CreateProviderBody>;
}, TContext>;
export type CreateProviderMutationResult = NonNullable<Awaited<ReturnType<typeof createProvider>>>;
export type CreateProviderMutationBody = BodyType<CreateProviderBody>;
export type CreateProviderMutationError = ErrorType<unknown>;
/**
 * @summary Create a provider record
 */
export declare const useCreateProvider: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProvider>>, TError, {
        data: BodyType<CreateProviderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProvider>>, TError, {
    data: BodyType<CreateProviderBody>;
}, TContext>;
/**
 * @summary Get provider by ID
 */
export declare const getGetProviderUrl: (id: number) => string;
export declare const getProvider: (id: number, options?: RequestInit) => Promise<ProviderDetail>;
export declare const getGetProviderQueryKey: (id: number) => readonly [`/api/providers/${number}`];
export declare const getGetProviderQueryOptions: <TData = Awaited<ReturnType<typeof getProvider>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProvider>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProvider>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProviderQueryResult = NonNullable<Awaited<ReturnType<typeof getProvider>>>;
export type GetProviderQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get provider by ID
 */
export declare function useGetProvider<TData = Awaited<ReturnType<typeof getProvider>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProvider>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update provider record
 */
export declare const getUpdateProviderUrl: (id: number) => string;
export declare const updateProvider: (id: number, updateProviderBody: UpdateProviderBody, options?: RequestInit) => Promise<Provider>;
export declare const getUpdateProviderMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProvider>>, TError, {
        id: number;
        data: BodyType<UpdateProviderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProvider>>, TError, {
    id: number;
    data: BodyType<UpdateProviderBody>;
}, TContext>;
export type UpdateProviderMutationResult = NonNullable<Awaited<ReturnType<typeof updateProvider>>>;
export type UpdateProviderMutationBody = BodyType<UpdateProviderBody>;
export type UpdateProviderMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update provider record
 */
export declare const useUpdateProvider: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProvider>>, TError, {
        id: number;
        data: BodyType<UpdateProviderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProvider>>, TError, {
    id: number;
    data: BodyType<UpdateProviderBody>;
}, TContext>;
/**
 * @summary Get providers with location data for map display
 */
export declare const getGetProvidersForMapUrl: () => string;
export declare const getProvidersForMap: (options?: RequestInit) => Promise<MapProvider[]>;
export declare const getGetProvidersForMapQueryKey: () => readonly ["/api/providers/map"];
export declare const getGetProvidersForMapQueryOptions: <TData = Awaited<ReturnType<typeof getProvidersForMap>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProvidersForMap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProvidersForMap>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProvidersForMapQueryResult = NonNullable<Awaited<ReturnType<typeof getProvidersForMap>>>;
export type GetProvidersForMapQueryError = ErrorType<unknown>;
/**
 * @summary Get providers with location data for map display
 */
export declare function useGetProvidersForMap<TData = Awaited<ReturnType<typeof getProvidersForMap>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProvidersForMap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get coverage statistics by state
 */
export declare const getGetStatesCoverageUrl: () => string;
export declare const getStatesCoverage: (options?: RequestInit) => Promise<StateCoverage[]>;
export declare const getGetStatesCoverageQueryKey: () => readonly ["/api/providers/states-coverage"];
export declare const getGetStatesCoverageQueryOptions: <TData = Awaited<ReturnType<typeof getStatesCoverage>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatesCoverage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStatesCoverage>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStatesCoverageQueryResult = NonNullable<Awaited<ReturnType<typeof getStatesCoverage>>>;
export type GetStatesCoverageQueryError = ErrorType<unknown>;
/**
 * @summary Get coverage statistics by state
 */
export declare function useGetStatesCoverage<TData = Awaited<ReturnType<typeof getStatesCoverage>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatesCoverage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List review queue items
 */
export declare const getListReviewItemsUrl: (params?: ListReviewItemsParams) => string;
export declare const listReviewItems: (params?: ListReviewItemsParams, options?: RequestInit) => Promise<ReviewItem[]>;
export declare const getListReviewItemsQueryKey: (params?: ListReviewItemsParams) => readonly ["/api/review", ...ListReviewItemsParams[]];
export declare const getListReviewItemsQueryOptions: <TData = Awaited<ReturnType<typeof listReviewItems>>, TError = ErrorType<unknown>>(params?: ListReviewItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listReviewItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listReviewItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListReviewItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listReviewItems>>>;
export type ListReviewItemsQueryError = ErrorType<unknown>;
/**
 * @summary List review queue items
 */
export declare function useListReviewItems<TData = Awaited<ReturnType<typeof listReviewItems>>, TError = ErrorType<unknown>>(params?: ListReviewItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listReviewItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get review item by ID
 */
export declare const getGetReviewItemUrl: (id: number) => string;
export declare const getReviewItem: (id: number, options?: RequestInit) => Promise<ReviewItem>;
export declare const getGetReviewItemQueryKey: (id: number) => readonly [`/api/review/${number}`];
export declare const getGetReviewItemQueryOptions: <TData = Awaited<ReturnType<typeof getReviewItem>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReviewItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReviewItem>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReviewItemQueryResult = NonNullable<Awaited<ReturnType<typeof getReviewItem>>>;
export type GetReviewItemQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get review item by ID
 */
export declare function useGetReviewItem<TData = Awaited<ReturnType<typeof getReviewItem>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReviewItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update review item (approve, reject, edit)
 */
export declare const getUpdateReviewItemUrl: (id: number) => string;
export declare const updateReviewItem: (id: number, updateReviewItemBody: UpdateReviewItemBody, options?: RequestInit) => Promise<ReviewItem>;
export declare const getUpdateReviewItemMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateReviewItem>>, TError, {
        id: number;
        data: BodyType<UpdateReviewItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateReviewItem>>, TError, {
    id: number;
    data: BodyType<UpdateReviewItemBody>;
}, TContext>;
export type UpdateReviewItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateReviewItem>>>;
export type UpdateReviewItemMutationBody = BodyType<UpdateReviewItemBody>;
export type UpdateReviewItemMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update review item (approve, reject, edit)
 */
export declare const useUpdateReviewItem: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateReviewItem>>, TError, {
        id: number;
        data: BodyType<UpdateReviewItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateReviewItem>>, TError, {
    id: number;
    data: BodyType<UpdateReviewItemBody>;
}, TContext>;
/**
 * @summary Get review queue counts by status
 */
export declare const getGetReviewCountsUrl: () => string;
export declare const getReviewCounts: (options?: RequestInit) => Promise<ReviewCounts>;
export declare const getGetReviewCountsQueryKey: () => readonly ["/api/review/counts"];
export declare const getGetReviewCountsQueryOptions: <TData = Awaited<ReturnType<typeof getReviewCounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReviewCounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReviewCounts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReviewCountsQueryResult = NonNullable<Awaited<ReturnType<typeof getReviewCounts>>>;
export type GetReviewCountsQueryError = ErrorType<unknown>;
/**
 * @summary Get review queue counts by status
 */
export declare function useGetReviewCounts<TData = Awaited<ReturnType<typeof getReviewCounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReviewCounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Smart search across providers and evidence
 */
export declare const getSearchUrl: (params: SearchParams) => string;
export declare const search: (params: SearchParams, options?: RequestInit) => Promise<SearchResults>;
export declare const getSearchQueryKey: (params?: SearchParams) => readonly ["/api/search", ...SearchParams[]];
export declare const getSearchQueryOptions: <TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(params: SearchParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData> & {
    queryKey: QueryKey;
};
export type SearchQueryResult = NonNullable<Awaited<ReturnType<typeof search>>>;
export type SearchQueryError = ErrorType<unknown>;
/**
 * @summary Smart search across providers and evidence
 */
export declare function useSearch<TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(params: SearchParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map