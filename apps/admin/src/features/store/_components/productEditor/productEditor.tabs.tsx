'use client';

import { useMemo } from 'react';
import type { TabsItem } from '@tapestry/ui';
import type { UseProductEditorTabsParams } from './productEditor.types';
import BasicsTab from './sections/BasicsTab.component';
import FulfillmentTab from './sections/FulfillmentTab.component';
import PresentationTab from './sections/PresentationTab.component';
import PricingTab from './sections/PricingTab.component';

export function useProductEditorTabs({ form, disabled, resourceOptions, resourceQueryState }: UseProductEditorTabsParams): TabsItem[] {
  return useMemo(
    () => [
      {
        key: 'basics',
        label: 'Basics',
        children: <BasicsTab form={form} disabled={disabled} />,
      },
      {
        key: 'pricing',
        label: 'Pricing',
        children: <PricingTab form={form} disabled={disabled} />,
      },
      {
        key: 'presentation',
        label: 'Presentation',
        children: <PresentationTab form={form} disabled={disabled} />,
      },
      {
        key: 'fulfillment',
        label: 'Fulfillment',
        children: <FulfillmentTab form={form} disabled={disabled} resourceOptions={resourceOptions} resourceQueryState={resourceQueryState} />,
      },
    ],
    [disabled, form, resourceOptions, resourceQueryState]
  );
}
