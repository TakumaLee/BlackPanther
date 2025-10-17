# Admin Management Components

This directory contains reusable components for the Admin Management system.

## Components

### AdminFormDialog
**File**: `AdminFormDialog.tsx`

**Purpose**: Modal dialog for creating new admins or editing existing ones

**Props**:
```typescript
interface AdminFormDialogProps {
  admin?: Admin;              // Optional: if provided, edit mode
  isOpen: boolean;            // Controls dialog visibility
  onClose: () => void;        // Called when dialog closes
  onSave: (data) => Promise<void>;  // Called on form submit
}
```

**Features**:
- Dual mode: Create vs Edit
- Form validation
- Error handling
- Loading states
- Role selection dropdown
- Active status toggle (edit mode only)

**Usage**:
```tsx
<AdminFormDialog
  admin={editingAdmin}        // undefined for create mode
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onSave={handleSave}
/>
```

---

### ResetPasswordDialog
**File**: `ResetPasswordDialog.tsx`

**Purpose**: Modal dialog for resetting admin passwords

**Props**:
```typescript
interface ResetPasswordDialogProps {
  adminId: string;           // Admin to reset password for
  adminUsername: string;     // Display name
  isOpen: boolean;           // Controls dialog visibility
  onClose: () => void;       // Called when dialog closes
  onReset: (id, password?) => Promise<string>;  // Returns new password
}
```

**Features**:
- Auto-generate random password (recommended)
- Manual password input option
- Copy to clipboard functionality
- One-time password display
- Security warnings

**Usage**:
```tsx
<ResetPasswordDialog
  adminId={admin.id}
  adminUsername={admin.username}
  isOpen={showResetDialog}
  onClose={() => setShowResetDialog(false)}
  onReset={handleResetPassword}
/>
```

---

## Styling

All components use:
- Tailwind CSS for styling
- Existing UI components from `@/components/ui/`
- Consistent color scheme with dashboard
- Responsive design
- Dark mode support (via CSS variables)

## Dependencies

Required UI components:
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`

Required icons (Lucide React):
- `X` - Close button
- `Copy`, `CheckCircle2` - Password copy functionality

## Integration

These components are used by the main Admin Management page:
- Location: `/app/dashboard/admins/page.tsx`
- Can be reused in other admin management contexts if needed

## Future Enhancements

Potential additional components:
- `AdminDetailModal` - Detailed admin info view
- `AdminLogsDialog` - Operation logs viewer
- `BulkActionsBar` - Batch operations toolbar
