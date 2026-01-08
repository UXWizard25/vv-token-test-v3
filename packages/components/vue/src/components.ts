/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from '@marioschmidt/design-system-components';

import { defineCustomElement as defineDsButton } from '@marioschmidt/design-system-components/dist/components/ds-button.js';
import { defineCustomElement as defineDsCard } from '@marioschmidt/design-system-components/dist/components/ds-card.js';
import { defineCustomElement as defineDsIcon } from '@marioschmidt/design-system-components/dist/components/ds-icon.js';


export const DsButton: StencilVueComponent<JSX.DsButton> = /*@__PURE__*/ defineContainer<JSX.DsButton>('ds-button', defineDsButton, [
  'variant',
  'disabled',
  'icon',
  'iconPosition'
]);


export const DsCard: StencilVueComponent<JSX.DsCard> = /*@__PURE__*/ defineContainer<JSX.DsCard>('ds-card', defineDsCard, [
  'surface',
  'cardTitle'
]);


export const DsIcon: StencilVueComponent<JSX.DsIcon> = /*@__PURE__*/ defineContainer<JSX.DsIcon>('ds-icon', defineDsIcon, [
  'name',
  'basePath'
]);

