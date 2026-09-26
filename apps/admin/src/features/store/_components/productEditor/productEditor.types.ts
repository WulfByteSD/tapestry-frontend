import type { SelectOption, UseFormReturn } from '@tapestry/ui';
import type { ProductEditorFormValues } from '../../store.types';
import type { useLibraryResources } from '../../_hooks/useStoreProducts';

export type ProductEditorTabProps = {
  form: UseFormReturn<ProductEditorFormValues>;
  disabled: boolean;
};

export type FulfillmentTabProps = ProductEditorTabProps & {
  resourceOptions: SelectOption[];
  resourceQueryState: ReturnType<typeof useLibraryResources>;
};

export type UseProductEditorTabsParams = {
  form: UseFormReturn<ProductEditorFormValues>;
  disabled: boolean;
  resourceOptions: SelectOption[];
  resourceQueryState: ReturnType<typeof useLibraryResources>;
};
