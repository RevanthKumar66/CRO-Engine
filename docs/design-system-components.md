# Shopify CRO Opportunity Engine - UI Component Documentation

This document provides a Storybook-style specification for the reusable UI component library.

---

## Typography Components

### 1. Heading
* **Purpose**: Displays layout headers (`h1` through `h4`) with standard sizing hierarchy and Outfit font styling.
* **Props**:
  - `level` ('h1' | 'h2' | 'h3' | 'h4'): Controls font sizes and tag sizes.
  - `as` ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): Customizes semantic HTML heading.
* **Usage**:
  ```tsx
  import { Heading } from '@/components/typography';
  <Heading level="h1">Dashboard Audit</Heading>
  ```
* **Accessibility**: Always uses semantic HTML heading elements to declare document outline hierarchies.

### 2. Text
* **Purpose**: Renders standard paragraphs, spans, or inline text descriptions.
* **Props**:
  - `variant` ('body' | 'muted' | 'description' | 'bold'): Typography styling options.
  - `as` ('p' | 'span' | 'div'): Semantic HTML wrapper defaults to `<p>`.
* **Usage**:
  ```tsx
  import { Text } from '@/components/typography';
  <Text variant="muted">Analyzed at 12:00 PM</Text>
  ```

---

## Button Components

### 1. Button
* **Purpose**: Standard clickable button trigger styled via design tokens.
* **Props**:
  - `variant` ('primary' | 'secondary' | 'ghost' | 'destructive'): Sizing styles.
  - `size` ('sm' | 'default' | 'lg'): Sizing scale.
* **Usage**:
  ```tsx
  import { Button } from '@/components/ui';
  <Button variant="primary">Start Analysis</Button>
  ```
* **Accessibility**: Fully keyboard focusable. Includes native support for `disabled` states.

### 2. IconButton
* **Purpose**: Compact square button containing visual icons with required accessible labels.
* **Props**:
  - `aria-label` (string): Enforced accessibility labels.
* **Usage**:
  ```tsx
  import { IconButton } from '@/components/ui';
  import { Play } from 'lucide-react';
  <IconButton aria-label="Run audit"><Play /></IconButton>
  ```

---

## Form & Input Components

### 1. Input
* **Purpose**: Captures text inputs (such as storefront URLs) with active borders and error states.
* **Props**:
  - `error` (boolean): Applies red validation borders if true.
* **Usage**:
  ```tsx
  import { Input } from '@/components/forms';
  <Input placeholder="Enter URL" error={true} />
  ```
* **Accessibility**: Maps visible focus rings and invalid properties (`aria-invalid="true"`) automatically when validation exceptions occur.

### 2. Form context wrappers
* **Purpose**: Integrates React Hook Form controllers with standard Zod validation schemas.
* **Components**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.
* **Usage**:
  ```tsx
  <FormField
    control={form.control}
    name="url"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Store URL</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  ```

---

## Card Components

### 1. MetricCard
* **Purpose**: Renders dashboard score gauges, metrics, or statistics with status indicators.
* **Props**:
  - `title` (string)
  - `value` (string | number)
  - `description` (string)
  - `trend` ({ value: number; type: 'positive' | 'negative' | 'neutral' })
* **Usage**:
  ```tsx
  import { MetricCard } from '@/components/ui';
  <MetricCard title="Conversion Rate" value="3.4%" trend={{ value: "+0.4%", type: "positive" }} />
  ```

### 2. EmptyStateCard
* **Purpose**: Displays empty checklist templates when no data is parsed.
* **Props**:
  - `icon` (ReactNode)
  - `title` (string)
  - `description` (string)
  - `actionText` (string)
  - `onAction` (() => void)
* **Usage**:
  ```tsx
  import { EmptyStateCard } from '@/components/ui';
  <EmptyStateCard title="No Audits" description="Submit a URL above." />
  ```

---

## Feedback Components

### 1. Skeleton
* **Purpose**: Render layout skeletons using light pulse animations during API scrapes.
* **Usage**:
  ```tsx
  import { Skeleton } from '@/components/feedback';
  <Skeleton className="h-6 w-32" />
  ```

### 2. Progress
* **Purpose**: Visual step indicator bars.
* **Props**:
  - `value` (number): Boundary ranges between 0 and 100.
* **Usage**:
  ```tsx
  import { Progress } from '@/components/feedback';
  <Progress value={65} />
  ```

---

## Dialogs & Overlays

### 1. Modal
* **Purpose**: Focus-trapped accessible viewport overlay dialog.
* **Props**:
  - `isOpen` (boolean)
  - `onClose` (() => void)
  - `title` (string)
  - `footer` (ReactNode)
* **Usage**:
  ```tsx
  import { Modal } from '@/components/overlays';
  <Modal isOpen={true} onClose={closeHandler} title="Details">Content</Modal>
  ```
* **Accessibility**: Listens to Esc key clicks to close, intercepts body scroll, and supports aria accessibility descriptors.
