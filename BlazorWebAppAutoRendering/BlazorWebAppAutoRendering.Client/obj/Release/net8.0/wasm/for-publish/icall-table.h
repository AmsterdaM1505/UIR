#define ICALL_TABLE_corlib 1

static int corlib_icall_indexes [] = {
192,
201,
202,
203,
204,
205,
206,
207,
208,
211,
212,
309,
310,
311,
340,
341,
342,
362,
363,
364,
365,
482,
483,
484,
487,
522,
523,
525,
527,
529,
531,
536,
544,
545,
546,
547,
548,
549,
550,
551,
552,
645,
646,
712,
718,
721,
723,
728,
729,
731,
732,
736,
737,
739,
741,
742,
745,
746,
747,
750,
752,
755,
757,
759,
768,
833,
835,
837,
847,
848,
849,
851,
857,
858,
859,
860,
861,
869,
870,
871,
875,
876,
878,
880,
1069,
1248,
1249,
6949,
6950,
6952,
6953,
6954,
6955,
6956,
6958,
6960,
6962,
6973,
6975,
6980,
6982,
6984,
6986,
7037,
7038,
7040,
7041,
7042,
7043,
7044,
7046,
7048,
8035,
8039,
8041,
8042,
8043,
8044,
8293,
8294,
8295,
8296,
8314,
8315,
8316,
8318,
8359,
8418,
8420,
8422,
8431,
8432,
8433,
8434,
8828,
8833,
8834,
8860,
8878,
8885,
8892,
8903,
8906,
8926,
9000,
9002,
9011,
9013,
9014,
9021,
9035,
9055,
9056,
9064,
9066,
9073,
9074,
9077,
9079,
9084,
9090,
9091,
9098,
9100,
9112,
9115,
9116,
9117,
9128,
9137,
9143,
9144,
9145,
9147,
9148,
9165,
9167,
9181,
9198,
9225,
9255,
9256,
9742,
9834,
9835,
10035,
10036,
10043,
10044,
10045,
10050,
10125,
10512,
10513,
10735,
10745,
11431,
11452,
11454,
11456,
};
void ves_icall_System_Array_InternalCreate (int,int,int,int,int);
int ves_icall_System_Array_GetCorElementTypeOfElementTypeInternal (int);
int ves_icall_System_Array_CanChangePrimitive (int,int,int);
int ves_icall_System_Array_FastCopy (int,int,int,int,int);
int ves_icall_System_Array_GetLengthInternal_raw (int,int,int);
int ves_icall_System_Array_GetLowerBoundInternal_raw (int,int,int);
void ves_icall_System_Array_GetGenericValue_icall (int,int,int);
void ves_icall_System_Array_GetValueImpl_raw (int,int,int,int);
void ves_icall_System_Array_SetGenericValue_icall (int,int,int);
void ves_icall_System_Array_SetValueImpl_raw (int,int,int,int);
void ves_icall_System_Array_SetValueRelaxedImpl_raw (int,int,int,int);
void ves_icall_System_Runtime_RuntimeImports_ZeroMemory (int,int);
void ves_icall_System_Runtime_RuntimeImports_Memmove (int,int,int);
void ves_icall_System_Buffer_BulkMoveWithWriteBarrier (int,int,int,int);
int ves_icall_System_Delegate_AllocDelegateLike_internal_raw (int,int);
int ves_icall_System_Delegate_CreateDelegate_internal_raw (int,int,int,int,int);
int ves_icall_System_Delegate_GetVirtualMethod_internal_raw (int,int);
void ves_icall_System_Enum_GetEnumValuesAndNames_raw (int,int,int,int);
void ves_icall_System_Enum_InternalBoxEnum_raw (int,int,int64_t,int);
int ves_icall_System_Enum_InternalGetCorElementType (int);
void ves_icall_System_Enum_InternalGetUnderlyingType_raw (int,int,int);
int ves_icall_System_Environment_get_ProcessorCount ();
int ves_icall_System_Environment_get_TickCount ();
int64_t ves_icall_System_Environment_get_TickCount64 ();
void ves_icall_System_Environment_FailFast_raw (int,int,int,int);
void ves_icall_System_GC_register_ephemeron_array_raw (int,int);
int ves_icall_System_GC_get_ephemeron_tombstone_raw (int);
void ves_icall_System_GC_SuppressFinalize_raw (int,int);
void ves_icall_System_GC_ReRegisterForFinalize_raw (int,int);
void ves_icall_System_GC_GetGCMemoryInfo (int,int,int,int,int,int);
int ves_icall_System_GC_AllocPinnedArray_raw (int,int,int);
int ves_icall_System_Object_MemberwiseClone_raw (int,int);
double ves_icall_System_Math_Ceiling (double);
double ves_icall_System_Math_Cos (double);
double ves_icall_System_Math_Floor (double);
double ves_icall_System_Math_Log10 (double);
double ves_icall_System_Math_Pow (double,double);
double ves_icall_System_Math_Sin (double);
double ves_icall_System_Math_Sqrt (double);
double ves_icall_System_Math_Tan (double);
double ves_icall_System_Math_ModF (double,int);
void ves_icall_RuntimeMethodHandle_ReboxFromNullable_raw (int,int,int);
void ves_icall_RuntimeMethodHandle_ReboxToNullable_raw (int,int,int,int);
int ves_icall_RuntimeType_GetCorrespondingInflatedMethod_raw (int,int,int);
void ves_icall_RuntimeType_make_array_type_raw (int,int,int,int);
void ves_icall_RuntimeType_make_byref_type_raw (int,int,int);
void ves_icall_RuntimeType_make_pointer_type_raw (int,int,int);
void ves_icall_RuntimeType_MakeGenericType_raw (int,int,int,int);
int ves_icall_RuntimeType_GetMethodsByName_native_raw (int,int,int,int,int);
int ves_icall_RuntimeType_GetPropertiesByName_native_raw (int,int,int,int,int);
int ves_icall_RuntimeType_GetConstructors_native_raw (int,int,int);
int ves_icall_System_RuntimeType_CreateInstanceInternal_raw (int,int);
void ves_icall_System_RuntimeType_AllocateValueType_raw (int,int,int,int);
void ves_icall_RuntimeType_GetDeclaringMethod_raw (int,int,int);
void ves_icall_System_RuntimeType_getFullName_raw (int,int,int,int,int);
void ves_icall_RuntimeType_GetGenericArgumentsInternal_raw (int,int,int,int);
int ves_icall_RuntimeType_GetGenericParameterPosition (int);
int ves_icall_RuntimeType_GetEvents_native_raw (int,int,int,int);
int ves_icall_RuntimeType_GetFields_native_raw (int,int,int,int,int);
void ves_icall_RuntimeType_GetInterfaces_raw (int,int,int);
int ves_icall_RuntimeType_GetNestedTypes_native_raw (int,int,int,int,int);
void ves_icall_RuntimeType_GetDeclaringType_raw (int,int,int);
void ves_icall_RuntimeType_GetName_raw (int,int,int);
void ves_icall_RuntimeType_GetNamespace_raw (int,int,int);
int ves_icall_RuntimeType_FunctionPointerReturnAndParameterTypes_raw (int,int);
int ves_icall_RuntimeTypeHandle_GetAttributes (int);
int ves_icall_RuntimeTypeHandle_GetMetadataToken_raw (int,int);
void ves_icall_RuntimeTypeHandle_GetGenericTypeDefinition_impl_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_GetCorElementType (int);
int ves_icall_RuntimeTypeHandle_HasInstantiation (int);
int ves_icall_RuntimeTypeHandle_IsInstanceOfType_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_HasReferences_raw (int,int);
int ves_icall_RuntimeTypeHandle_GetArrayRank_raw (int,int);
void ves_icall_RuntimeTypeHandle_GetAssembly_raw (int,int,int);
void ves_icall_RuntimeTypeHandle_GetElementType_raw (int,int,int);
void ves_icall_RuntimeTypeHandle_GetModule_raw (int,int,int);
void ves_icall_RuntimeTypeHandle_GetBaseType_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_type_is_assignable_from_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_IsGenericTypeDefinition (int);
int ves_icall_RuntimeTypeHandle_GetGenericParameterInfo_raw (int,int);
int ves_icall_RuntimeTypeHandle_is_subclass_of_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_IsByRefLike_raw (int,int);
void ves_icall_System_RuntimeTypeHandle_internal_from_name_raw (int,int,int,int,int,int);
int ves_icall_System_String_FastAllocateString_raw (int,int);
int ves_icall_System_Type_internal_from_handle_raw (int,int);
int ves_icall_System_ValueType_InternalGetHashCode_raw (int,int,int);
int ves_icall_System_ValueType_Equals_raw (int,int,int,int);
int ves_icall_System_Threading_Interlocked_CompareExchange_Int (int,int,int);
void ves_icall_System_Threading_Interlocked_CompareExchange_Object (int,int,int,int);
int ves_icall_System_Threading_Interlocked_Decrement_Int (int);
int ves_icall_System_Threading_Interlocked_Increment_Int (int);
int64_t ves_icall_System_Threading_Interlocked_Increment_Long (int);
int ves_icall_System_Threading_Interlocked_Exchange_Int (int,int);
void ves_icall_System_Threading_Interlocked_Exchange_Object (int,int,int);
int64_t ves_icall_System_Threading_Interlocked_CompareExchange_Long (int,int64_t,int64_t);
int64_t ves_icall_System_Threading_Interlocked_Exchange_Long (int,int64_t);
int ves_icall_System_Threading_Interlocked_Add_Int (int,int);
void ves_icall_System_Threading_Monitor_Monitor_Enter_raw (int,int);
void mono_monitor_exit_icall_raw (int,int);
void ves_icall_System_Threading_Monitor_Monitor_pulse_raw (int,int);
void ves_icall_System_Threading_Monitor_Monitor_pulse_all_raw (int,int);
int ves_icall_System_Threading_Monitor_Monitor_wait_raw (int,int,int,int);
void ves_icall_System_Threading_Monitor_Monitor_try_enter_with_atomic_var_raw (int,int,int,int,int);
void ves_icall_System_Threading_Thread_InitInternal_raw (int,int);
int ves_icall_System_Threading_Thread_GetCurrentThread ();
void ves_icall_System_Threading_InternalThread_Thread_free_internal_raw (int,int);
int ves_icall_System_Threading_Thread_GetState_raw (int,int);
void ves_icall_System_Threading_Thread_SetState_raw (int,int,int);
void ves_icall_System_Threading_Thread_ClrState_raw (int,int,int);
void ves_icall_System_Threading_Thread_SetName_icall_raw (int,int,int,int);
int ves_icall_System_Threading_Thread_YieldInternal ();
void ves_icall_System_Threading_Thread_SetPriority_raw (int,int,int);
void ves_icall_System_Runtime_Loader_AssemblyLoadContext_PrepareForAssemblyLoadContextRelease_raw (int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_GetLoadContextForAssembly_raw (int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFile_raw (int,int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalInitializeNativeALC_raw (int,int,int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFromStream_raw (int,int,int,int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalGetLoadedAssemblies_raw (int);
int ves_icall_System_GCHandle_InternalAlloc_raw (int,int,int);
void ves_icall_System_GCHandle_InternalFree_raw (int,int);
int ves_icall_System_GCHandle_InternalGet_raw (int,int);
void ves_icall_System_GCHandle_InternalSet_raw (int,int,int);
int ves_icall_System_Runtime_InteropServices_Marshal_GetLastPInvokeError ();
void ves_icall_System_Runtime_InteropServices_Marshal_SetLastPInvokeError (int);
void ves_icall_System_Runtime_InteropServices_Marshal_StructureToPtr_raw (int,int,int,int);
int ves_icall_System_Runtime_InteropServices_Marshal_SizeOfHelper_raw (int,int,int);
int ves_icall_System_Runtime_InteropServices_NativeLibrary_LoadByName_raw (int,int,int,int,int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalGetHashCode_raw (int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalTryGetHashCode_raw (int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetObjectValue_raw (int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetUninitializedObjectInternal_raw (int,int);
void ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InitializeArray_raw (int,int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetSpanDataFrom_raw (int,int,int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_SufficientExecutionStack ();
int ves_icall_System_Reflection_Assembly_GetEntryAssembly_raw (int);
int ves_icall_System_Reflection_Assembly_InternalLoad_raw (int,int,int,int);
int ves_icall_System_Reflection_Assembly_InternalGetType_raw (int,int,int,int,int,int);
int ves_icall_System_Reflection_AssemblyName_GetNativeName (int);
int ves_icall_MonoCustomAttrs_GetCustomAttributesInternal_raw (int,int,int,int);
int ves_icall_MonoCustomAttrs_GetCustomAttributesDataInternal_raw (int,int);
int ves_icall_MonoCustomAttrs_IsDefinedInternal_raw (int,int,int);
int ves_icall_System_Reflection_FieldInfo_internal_from_handle_type_raw (int,int,int);
int ves_icall_System_Reflection_FieldInfo_get_marshal_info_raw (int,int);
int ves_icall_System_Reflection_LoaderAllocatorScout_Destroy (int);
void ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceNames_raw (int,int,int);
void ves_icall_System_Reflection_RuntimeAssembly_GetExportedTypes_raw (int,int,int);
void ves_icall_System_Reflection_RuntimeAssembly_GetInfo_raw (int,int,int,int);
int ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceInternal_raw (int,int,int,int,int);
void ves_icall_System_Reflection_Assembly_GetManifestModuleInternal_raw (int,int,int);
void ves_icall_System_Reflection_RuntimeCustomAttributeData_ResolveArgumentsInternal_raw (int,int,int,int,int,int,int);
void ves_icall_RuntimeEventInfo_get_event_info_raw (int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_System_Reflection_EventInfo_internal_from_handle_type_raw (int,int,int);
int ves_icall_RuntimeFieldInfo_ResolveType_raw (int,int);
int ves_icall_RuntimeFieldInfo_GetParentType_raw (int,int,int);
int ves_icall_RuntimeFieldInfo_GetFieldOffset_raw (int,int);
int ves_icall_RuntimeFieldInfo_GetValueInternal_raw (int,int,int);
void ves_icall_RuntimeFieldInfo_SetValueInternal_raw (int,int,int,int);
int ves_icall_RuntimeFieldInfo_GetRawConstantValue_raw (int,int);
int ves_icall_reflection_get_token_raw (int,int);
void ves_icall_get_method_info_raw (int,int,int);
int ves_icall_get_method_attributes (int);
int ves_icall_System_Reflection_MonoMethodInfo_get_parameter_info_raw (int,int,int);
int ves_icall_System_MonoMethodInfo_get_retval_marshal_raw (int,int);
int ves_icall_System_Reflection_RuntimeMethodInfo_GetMethodFromHandleInternalType_native_raw (int,int,int,int);
int ves_icall_RuntimeMethodInfo_get_name_raw (int,int);
int ves_icall_RuntimeMethodInfo_get_base_method_raw (int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_InternalInvoke_raw (int,int,int,int,int);
void ves_icall_RuntimeMethodInfo_GetPInvoke_raw (int,int,int,int,int);
int ves_icall_RuntimeMethodInfo_MakeGenericMethod_impl_raw (int,int,int);
int ves_icall_RuntimeMethodInfo_GetGenericArguments_raw (int,int);
int ves_icall_RuntimeMethodInfo_GetGenericMethodDefinition_raw (int,int);
int ves_icall_RuntimeMethodInfo_get_IsGenericMethodDefinition_raw (int,int);
int ves_icall_RuntimeMethodInfo_get_IsGenericMethod_raw (int,int);
void ves_icall_InvokeClassConstructor_raw (int,int);
int ves_icall_InternalInvoke_raw (int,int,int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_System_Reflection_RuntimeModule_ResolveMethodToken_raw (int,int,int,int,int,int);
void ves_icall_RuntimePropertyInfo_get_property_info_raw (int,int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_System_Reflection_RuntimePropertyInfo_internal_from_handle_type_raw (int,int,int);
void ves_icall_DynamicMethod_create_dynamic_method_raw (int,int,int,int,int);
void ves_icall_AssemblyBuilder_basic_init_raw (int,int);
void ves_icall_AssemblyBuilder_UpdateNativeCustomAttributes_raw (int,int);
void ves_icall_ModuleBuilder_basic_init_raw (int,int);
void ves_icall_ModuleBuilder_set_wrappers_type_raw (int,int,int);
int ves_icall_ModuleBuilder_getUSIndex_raw (int,int,int);
int ves_icall_ModuleBuilder_getToken_raw (int,int,int,int);
int ves_icall_ModuleBuilder_getMethodToken_raw (int,int,int,int);
void ves_icall_ModuleBuilder_RegisterToken_raw (int,int,int,int);
int ves_icall_TypeBuilder_create_runtime_class_raw (int,int);
int ves_icall_System_IO_Stream_HasOverriddenBeginEndRead_raw (int,int);
int ves_icall_System_IO_Stream_HasOverriddenBeginEndWrite_raw (int,int);
int ves_icall_System_Diagnostics_StackFrame_GetFrameInfo (int,int,int,int,int,int,int,int);
void ves_icall_System_Diagnostics_StackTrace_GetTrace (int,int,int,int);
int ves_icall_Mono_RuntimeClassHandle_GetTypeFromClass (int);
void ves_icall_Mono_RuntimeGPtrArrayHandle_GPtrArrayFree (int);
int ves_icall_Mono_SafeStringMarshal_StringToUtf8 (int);
void ves_icall_Mono_SafeStringMarshal_GFree (int);
static void *corlib_icall_funcs [] = {
// token 192,
ves_icall_System_Array_InternalCreate,
// token 201,
ves_icall_System_Array_GetCorElementTypeOfElementTypeInternal,
// token 202,
ves_icall_System_Array_CanChangePrimitive,
// token 203,
ves_icall_System_Array_FastCopy,
// token 204,
ves_icall_System_Array_GetLengthInternal_raw,
// token 205,
ves_icall_System_Array_GetLowerBoundInternal_raw,
// token 206,
ves_icall_System_Array_GetGenericValue_icall,
// token 207,
ves_icall_System_Array_GetValueImpl_raw,
// token 208,
ves_icall_System_Array_SetGenericValue_icall,
// token 211,
ves_icall_System_Array_SetValueImpl_raw,
// token 212,
ves_icall_System_Array_SetValueRelaxedImpl_raw,
// token 309,
ves_icall_System_Runtime_RuntimeImports_ZeroMemory,
// token 310,
ves_icall_System_Runtime_RuntimeImports_Memmove,
// token 311,
ves_icall_System_Buffer_BulkMoveWithWriteBarrier,
// token 340,
ves_icall_System_Delegate_AllocDelegateLike_internal_raw,
// token 341,
ves_icall_System_Delegate_CreateDelegate_internal_raw,
// token 342,
ves_icall_System_Delegate_GetVirtualMethod_internal_raw,
// token 362,
ves_icall_System_Enum_GetEnumValuesAndNames_raw,
// token 363,
ves_icall_System_Enum_InternalBoxEnum_raw,
// token 364,
ves_icall_System_Enum_InternalGetCorElementType,
// token 365,
ves_icall_System_Enum_InternalGetUnderlyingType_raw,
// token 482,
ves_icall_System_Environment_get_ProcessorCount,
// token 483,
ves_icall_System_Environment_get_TickCount,
// token 484,
ves_icall_System_Environment_get_TickCount64,
// token 487,
ves_icall_System_Environment_FailFast_raw,
// token 522,
ves_icall_System_GC_register_ephemeron_array_raw,
// token 523,
ves_icall_System_GC_get_ephemeron_tombstone_raw,
// token 525,
ves_icall_System_GC_SuppressFinalize_raw,
// token 527,
ves_icall_System_GC_ReRegisterForFinalize_raw,
// token 529,
ves_icall_System_GC_GetGCMemoryInfo,
// token 531,
ves_icall_System_GC_AllocPinnedArray_raw,
// token 536,
ves_icall_System_Object_MemberwiseClone_raw,
// token 544,
ves_icall_System_Math_Ceiling,
// token 545,
ves_icall_System_Math_Cos,
// token 546,
ves_icall_System_Math_Floor,
// token 547,
ves_icall_System_Math_Log10,
// token 548,
ves_icall_System_Math_Pow,
// token 549,
ves_icall_System_Math_Sin,
// token 550,
ves_icall_System_Math_Sqrt,
// token 551,
ves_icall_System_Math_Tan,
// token 552,
ves_icall_System_Math_ModF,
// token 645,
ves_icall_RuntimeMethodHandle_ReboxFromNullable_raw,
// token 646,
ves_icall_RuntimeMethodHandle_ReboxToNullable_raw,
// token 712,
ves_icall_RuntimeType_GetCorrespondingInflatedMethod_raw,
// token 718,
ves_icall_RuntimeType_make_array_type_raw,
// token 721,
ves_icall_RuntimeType_make_byref_type_raw,
// token 723,
ves_icall_RuntimeType_make_pointer_type_raw,
// token 728,
ves_icall_RuntimeType_MakeGenericType_raw,
// token 729,
ves_icall_RuntimeType_GetMethodsByName_native_raw,
// token 731,
ves_icall_RuntimeType_GetPropertiesByName_native_raw,
// token 732,
ves_icall_RuntimeType_GetConstructors_native_raw,
// token 736,
ves_icall_System_RuntimeType_CreateInstanceInternal_raw,
// token 737,
ves_icall_System_RuntimeType_AllocateValueType_raw,
// token 739,
ves_icall_RuntimeType_GetDeclaringMethod_raw,
// token 741,
ves_icall_System_RuntimeType_getFullName_raw,
// token 742,
ves_icall_RuntimeType_GetGenericArgumentsInternal_raw,
// token 745,
ves_icall_RuntimeType_GetGenericParameterPosition,
// token 746,
ves_icall_RuntimeType_GetEvents_native_raw,
// token 747,
ves_icall_RuntimeType_GetFields_native_raw,
// token 750,
ves_icall_RuntimeType_GetInterfaces_raw,
// token 752,
ves_icall_RuntimeType_GetNestedTypes_native_raw,
// token 755,
ves_icall_RuntimeType_GetDeclaringType_raw,
// token 757,
ves_icall_RuntimeType_GetName_raw,
// token 759,
ves_icall_RuntimeType_GetNamespace_raw,
// token 768,
ves_icall_RuntimeType_FunctionPointerReturnAndParameterTypes_raw,
// token 833,
ves_icall_RuntimeTypeHandle_GetAttributes,
// token 835,
ves_icall_RuntimeTypeHandle_GetMetadataToken_raw,
// token 837,
ves_icall_RuntimeTypeHandle_GetGenericTypeDefinition_impl_raw,
// token 847,
ves_icall_RuntimeTypeHandle_GetCorElementType,
// token 848,
ves_icall_RuntimeTypeHandle_HasInstantiation,
// token 849,
ves_icall_RuntimeTypeHandle_IsInstanceOfType_raw,
// token 851,
ves_icall_RuntimeTypeHandle_HasReferences_raw,
// token 857,
ves_icall_RuntimeTypeHandle_GetArrayRank_raw,
// token 858,
ves_icall_RuntimeTypeHandle_GetAssembly_raw,
// token 859,
ves_icall_RuntimeTypeHandle_GetElementType_raw,
// token 860,
ves_icall_RuntimeTypeHandle_GetModule_raw,
// token 861,
ves_icall_RuntimeTypeHandle_GetBaseType_raw,
// token 869,
ves_icall_RuntimeTypeHandle_type_is_assignable_from_raw,
// token 870,
ves_icall_RuntimeTypeHandle_IsGenericTypeDefinition,
// token 871,
ves_icall_RuntimeTypeHandle_GetGenericParameterInfo_raw,
// token 875,
ves_icall_RuntimeTypeHandle_is_subclass_of_raw,
// token 876,
ves_icall_RuntimeTypeHandle_IsByRefLike_raw,
// token 878,
ves_icall_System_RuntimeTypeHandle_internal_from_name_raw,
// token 880,
ves_icall_System_String_FastAllocateString_raw,
// token 1069,
ves_icall_System_Type_internal_from_handle_raw,
// token 1248,
ves_icall_System_ValueType_InternalGetHashCode_raw,
// token 1249,
ves_icall_System_ValueType_Equals_raw,
// token 6949,
ves_icall_System_Threading_Interlocked_CompareExchange_Int,
// token 6950,
ves_icall_System_Threading_Interlocked_CompareExchange_Object,
// token 6952,
ves_icall_System_Threading_Interlocked_Decrement_Int,
// token 6953,
ves_icall_System_Threading_Interlocked_Increment_Int,
// token 6954,
ves_icall_System_Threading_Interlocked_Increment_Long,
// token 6955,
ves_icall_System_Threading_Interlocked_Exchange_Int,
// token 6956,
ves_icall_System_Threading_Interlocked_Exchange_Object,
// token 6958,
ves_icall_System_Threading_Interlocked_CompareExchange_Long,
// token 6960,
ves_icall_System_Threading_Interlocked_Exchange_Long,
// token 6962,
ves_icall_System_Threading_Interlocked_Add_Int,
// token 6973,
ves_icall_System_Threading_Monitor_Monitor_Enter_raw,
// token 6975,
mono_monitor_exit_icall_raw,
// token 6980,
ves_icall_System_Threading_Monitor_Monitor_pulse_raw,
// token 6982,
ves_icall_System_Threading_Monitor_Monitor_pulse_all_raw,
// token 6984,
ves_icall_System_Threading_Monitor_Monitor_wait_raw,
// token 6986,
ves_icall_System_Threading_Monitor_Monitor_try_enter_with_atomic_var_raw,
// token 7037,
ves_icall_System_Threading_Thread_InitInternal_raw,
// token 7038,
ves_icall_System_Threading_Thread_GetCurrentThread,
// token 7040,
ves_icall_System_Threading_InternalThread_Thread_free_internal_raw,
// token 7041,
ves_icall_System_Threading_Thread_GetState_raw,
// token 7042,
ves_icall_System_Threading_Thread_SetState_raw,
// token 7043,
ves_icall_System_Threading_Thread_ClrState_raw,
// token 7044,
ves_icall_System_Threading_Thread_SetName_icall_raw,
// token 7046,
ves_icall_System_Threading_Thread_YieldInternal,
// token 7048,
ves_icall_System_Threading_Thread_SetPriority_raw,
// token 8035,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_PrepareForAssemblyLoadContextRelease_raw,
// token 8039,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_GetLoadContextForAssembly_raw,
// token 8041,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFile_raw,
// token 8042,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalInitializeNativeALC_raw,
// token 8043,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFromStream_raw,
// token 8044,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalGetLoadedAssemblies_raw,
// token 8293,
ves_icall_System_GCHandle_InternalAlloc_raw,
// token 8294,
ves_icall_System_GCHandle_InternalFree_raw,
// token 8295,
ves_icall_System_GCHandle_InternalGet_raw,
// token 8296,
ves_icall_System_GCHandle_InternalSet_raw,
// token 8314,
ves_icall_System_Runtime_InteropServices_Marshal_GetLastPInvokeError,
// token 8315,
ves_icall_System_Runtime_InteropServices_Marshal_SetLastPInvokeError,
// token 8316,
ves_icall_System_Runtime_InteropServices_Marshal_StructureToPtr_raw,
// token 8318,
ves_icall_System_Runtime_InteropServices_Marshal_SizeOfHelper_raw,
// token 8359,
ves_icall_System_Runtime_InteropServices_NativeLibrary_LoadByName_raw,
// token 8418,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalGetHashCode_raw,
// token 8420,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalTryGetHashCode_raw,
// token 8422,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetObjectValue_raw,
// token 8431,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetUninitializedObjectInternal_raw,
// token 8432,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InitializeArray_raw,
// token 8433,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetSpanDataFrom_raw,
// token 8434,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_SufficientExecutionStack,
// token 8828,
ves_icall_System_Reflection_Assembly_GetEntryAssembly_raw,
// token 8833,
ves_icall_System_Reflection_Assembly_InternalLoad_raw,
// token 8834,
ves_icall_System_Reflection_Assembly_InternalGetType_raw,
// token 8860,
ves_icall_System_Reflection_AssemblyName_GetNativeName,
// token 8878,
ves_icall_MonoCustomAttrs_GetCustomAttributesInternal_raw,
// token 8885,
ves_icall_MonoCustomAttrs_GetCustomAttributesDataInternal_raw,
// token 8892,
ves_icall_MonoCustomAttrs_IsDefinedInternal_raw,
// token 8903,
ves_icall_System_Reflection_FieldInfo_internal_from_handle_type_raw,
// token 8906,
ves_icall_System_Reflection_FieldInfo_get_marshal_info_raw,
// token 8926,
ves_icall_System_Reflection_LoaderAllocatorScout_Destroy,
// token 9000,
ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceNames_raw,
// token 9002,
ves_icall_System_Reflection_RuntimeAssembly_GetExportedTypes_raw,
// token 9011,
ves_icall_System_Reflection_RuntimeAssembly_GetInfo_raw,
// token 9013,
ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceInternal_raw,
// token 9014,
ves_icall_System_Reflection_Assembly_GetManifestModuleInternal_raw,
// token 9021,
ves_icall_System_Reflection_RuntimeCustomAttributeData_ResolveArgumentsInternal_raw,
// token 9035,
ves_icall_RuntimeEventInfo_get_event_info_raw,
// token 9055,
ves_icall_reflection_get_token_raw,
// token 9056,
ves_icall_System_Reflection_EventInfo_internal_from_handle_type_raw,
// token 9064,
ves_icall_RuntimeFieldInfo_ResolveType_raw,
// token 9066,
ves_icall_RuntimeFieldInfo_GetParentType_raw,
// token 9073,
ves_icall_RuntimeFieldInfo_GetFieldOffset_raw,
// token 9074,
ves_icall_RuntimeFieldInfo_GetValueInternal_raw,
// token 9077,
ves_icall_RuntimeFieldInfo_SetValueInternal_raw,
// token 9079,
ves_icall_RuntimeFieldInfo_GetRawConstantValue_raw,
// token 9084,
ves_icall_reflection_get_token_raw,
// token 9090,
ves_icall_get_method_info_raw,
// token 9091,
ves_icall_get_method_attributes,
// token 9098,
ves_icall_System_Reflection_MonoMethodInfo_get_parameter_info_raw,
// token 9100,
ves_icall_System_MonoMethodInfo_get_retval_marshal_raw,
// token 9112,
ves_icall_System_Reflection_RuntimeMethodInfo_GetMethodFromHandleInternalType_native_raw,
// token 9115,
ves_icall_RuntimeMethodInfo_get_name_raw,
// token 9116,
ves_icall_RuntimeMethodInfo_get_base_method_raw,
// token 9117,
ves_icall_reflection_get_token_raw,
// token 9128,
ves_icall_InternalInvoke_raw,
// token 9137,
ves_icall_RuntimeMethodInfo_GetPInvoke_raw,
// token 9143,
ves_icall_RuntimeMethodInfo_MakeGenericMethod_impl_raw,
// token 9144,
ves_icall_RuntimeMethodInfo_GetGenericArguments_raw,
// token 9145,
ves_icall_RuntimeMethodInfo_GetGenericMethodDefinition_raw,
// token 9147,
ves_icall_RuntimeMethodInfo_get_IsGenericMethodDefinition_raw,
// token 9148,
ves_icall_RuntimeMethodInfo_get_IsGenericMethod_raw,
// token 9165,
ves_icall_InvokeClassConstructor_raw,
// token 9167,
ves_icall_InternalInvoke_raw,
// token 9181,
ves_icall_reflection_get_token_raw,
// token 9198,
ves_icall_System_Reflection_RuntimeModule_ResolveMethodToken_raw,
// token 9225,
ves_icall_RuntimePropertyInfo_get_property_info_raw,
// token 9255,
ves_icall_reflection_get_token_raw,
// token 9256,
ves_icall_System_Reflection_RuntimePropertyInfo_internal_from_handle_type_raw,
// token 9742,
ves_icall_DynamicMethod_create_dynamic_method_raw,
// token 9834,
ves_icall_AssemblyBuilder_basic_init_raw,
// token 9835,
ves_icall_AssemblyBuilder_UpdateNativeCustomAttributes_raw,
// token 10035,
ves_icall_ModuleBuilder_basic_init_raw,
// token 10036,
ves_icall_ModuleBuilder_set_wrappers_type_raw,
// token 10043,
ves_icall_ModuleBuilder_getUSIndex_raw,
// token 10044,
ves_icall_ModuleBuilder_getToken_raw,
// token 10045,
ves_icall_ModuleBuilder_getMethodToken_raw,
// token 10050,
ves_icall_ModuleBuilder_RegisterToken_raw,
// token 10125,
ves_icall_TypeBuilder_create_runtime_class_raw,
// token 10512,
ves_icall_System_IO_Stream_HasOverriddenBeginEndRead_raw,
// token 10513,
ves_icall_System_IO_Stream_HasOverriddenBeginEndWrite_raw,
// token 10735,
ves_icall_System_Diagnostics_StackFrame_GetFrameInfo,
// token 10745,
ves_icall_System_Diagnostics_StackTrace_GetTrace,
// token 11431,
ves_icall_Mono_RuntimeClassHandle_GetTypeFromClass,
// token 11452,
ves_icall_Mono_RuntimeGPtrArrayHandle_GPtrArrayFree,
// token 11454,
ves_icall_Mono_SafeStringMarshal_StringToUtf8,
// token 11456,
ves_icall_Mono_SafeStringMarshal_GFree,
};
static uint8_t corlib_icall_flags [] = {
0,
0,
0,
0,
4,
4,
0,
4,
0,
4,
4,
0,
0,
0,
4,
4,
4,
4,
4,
0,
4,
0,
0,
0,
4,
4,
4,
4,
4,
0,
4,
4,
0,
0,
0,
0,
0,
0,
0,
0,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
0,
0,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
0,
0,
0,
0,
0,
0,
0,
0,
0,
0,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
0,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
0,
0,
0,
0,
0,
};
