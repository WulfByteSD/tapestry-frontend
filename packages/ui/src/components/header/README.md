# Header Component

A flexible, configurable header component with user information, notifications, and menu toggle support. Fully independent from antd.

## Features

- ✅ Props-based configuration (no hard-coded hooks)
- ✅ Avatar with automatic initials fallback
- ✅ Custom notifications slot
- ✅ Responsive hamburger menu
- ✅ Logout button with tooltip
- ✅ Flexible left/right content areas
- ✅ CSS variables for theming

## Basic Usage

```tsx
import { Header } from "@tapestry/ui";
import { useUser, logout } from "@/state/auth";
import { useLayoutStore } from "@/state/layout";
import Notifications from "@/components/Notifications";

export default function AppLayout() {
  const { data: user } = useUser();
  const toggleSideBar = useLayoutStore((state) => state.toggleSideBar);

  return <Header user={user} onLogout={logout} onMenuToggle={toggleSideBar} notifications={<Notifications />} />;
}
```

## Props

| Prop             | Type                   | Default | Description                                                |
| ---------------- | ---------------------- | ------- | ---------------------------------------------------------- |
| `user`           | `HeaderUser`           | -       | User object with `fullName` and optional `profileImageUrl` |
| `onLogout`       | `() => void`           | -       | Callback when logout button is clicked                     |
| `onMenuToggle`   | `() => void`           | -       | Callback when hamburger menu is clicked                    |
| `notifications`  | `ReactNode`            | -       | Optional notifications component to render                 |
| `showMenuToggle` | `boolean`              | `true`  | Whether to show the hamburger menu button                  |
| `avatarSize`     | `"sm" \| "md" \| "lg"` | `"md"`  | Size of the user avatar                                    |
| `leftContent`    | `ReactNode`            | -       | Custom content for left side of header                     |
| `rightContent`   | `ReactNode`            | -       | Custom content for right side (before user)                |
| `className`      | `string`               | -       | Additional CSS class names                                 |

## Types

```typescript
type HeaderUser = {
  fullName: string;
  profileImageUrl?: string | null;
};
```

## Examples

### Minimal Header (No User)

```tsx
<Header onMenuToggle={() => console.log("Toggle menu")} />
```

### Header with Custom Left Content

```tsx
<Header
  user={user}
  onLogout={logout}
  leftContent={
    <div>
      <h1>My Application</h1>
    </div>
  }
/>
```

### Header with Custom Right Content

```tsx
<Header
  user={user}
  onLogout={logout}
  rightContent={
    <>
      <SearchBar />
      <ThemeToggle />
    </>
  }
/>
```

### Header Without Logout

```tsx
<Header user={user} notifications={<Notifications />} />
```

## Styling

The Header uses CSS variables that can be overridden:

```css
.header {
  --header-height: 64px; /* Configurable height */
}
```

To override globally:

```css
:root {
  --header-height: 80px;
}
```

## Responsive Behavior

- **Desktop (> 768px)**: Full layout with all elements visible
- **Mobile (≤ 768px)**: Hamburger menu automatically shown (if `showMenuToggle` is true)

## Avatar Component

The Header uses the Avatar component which:

- Displays user profile image if available
- Falls back to initials (e.g., "John Doe" → "JD")
- Generates consistent color from user name
- Handles image loading errors gracefully

## Migration from Old Header

**Before (using antd and hooks):**

```tsx
<Header pages={[{ title: "Home", link: "/" }]} />
```

**After (props-based):**

```tsx
<Header
  user={{ fullName: "John Doe", profileImageUrl: "/avatar.jpg" }}
  onLogout={() => logout()}
  onMenuToggle={() => toggleSideBar()}
  notifications={<Notifications />}
/>
```

## Notes

- The `Notifications` component is not included and must be passed as a prop
- Breadcrumb functionality has been removed (use `leftContent` for navigation)
- All antd dependencies removed
- Component is fully controlled by props (no internal state management)
