# PCI vs Non-PCI Component Handling

This document describes how Vue components are initialized differently depending on whether they run in **PCI-sensitive contexts** (e.g., checkout) or **non-PCI pages**. It also explains how to extend this setup when adding new PCI-ready components.

---

## Template Configuration

### In Mustache (`_foot.mustache`)

```html
{{#PciMode}}
<!-- PCI pages use runtime-only build -->
<script src="/scripts/vue.runtime.esm.js"></script>
<script src="/scripts/pci-init.js"></script>
{{/PciMode}} {{^PciMode}}
<!-- Non-PCI pages use full compiler build -->
<script src="/scripts/vue.esm.js"></script>
<script src="/scripts/init.js"></script>
{{/PciMode}}
```

### In Razor (`.cshtml`)

For `.cshtml` templates, the same flag is respected through JSON injection:

```json
{
    "PciMode": true
}
```

This ensures both templating systems behave consistently when deciding which Vue build to use.

---

## Component Registry

### In `pci-init.js`

We maintain a dedicated registry of PCI-ready components. Example:

```js
import Vue from "vue";

// PCI-only components
import MCartIcon from "@/components/molecules/cart-icon.vue";
import PaymentForm from "@/components/organisms/payment-form.vue";

const components = {
    "m-cart-icon": MCartIcon,
    "payment-form": PaymentForm
};

// Register globally
Object.entries(components).forEach(([name, component]) => {
    Vue.component(name, component);
});

new Vue({
    el: "#app"
});
```

This file is intentionally kept small and explicit, ensuring only **approved PCI-safe components** are bootstrapped with the runtime-only Vue build.

---

## Adding New PCI Components

When you need to add another PCI-ready component:

1.  **Import it** in `pci-init.js`:

    ```js
    import NewPaymentWidget from "@/components/organisms/new-payment-widget.vue";
    ```

2.  **Register it** in the `components` object:

    ```js
    const components = {
        "new-payment-widget": NewPaymentWidget
        // ... existing PCI components
    };
    ```

3.  **Reference it** in PCI templates (`.hbs` or `.cshtml`):

    ```html
    <new-payment-widget></new-payment-widget>
    ```

4.  Confirm it renders correctly in **runtime-only Vue** (no template compiler).

---

## Rationale

-   **PCI Pages (Checkout, Payment):**  
    Must minimize attack surface. By using the **runtime-only Vue build**, no template compilation is possible at runtime, improving both **security** and **performance**.

-   **Non-PCI Pages (Catalog, Home, PDP, etc.):**  
    Use the full **Vue compiler build** to support flexibility in development and legacy components that rely on runtime template compilation.

-   **Dual Support:**  
    By gating initialization with `PciMode`, we ensure the correct Vue build and component registry are used per page context.

---

## Testing Checklist

-   Checkout renders without blank pages

-   PCI components (payment form, checkout summary, etc.) render in runtime-only mode

-   Non-PCI components render correctly with compiler build

-   Console is free of template compilation errors

-   New PCI components can be added via `pci-init.js` registry

---

With this approach, PCI and non-PCI contexts remain cleanly separated, extensible, and compliant.

---
