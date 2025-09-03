# Simplified Strapi Setup for Renovation Works

## What You Need

Based on your frontend, you only need:
- Basic renovation work info
- Simple todos (text + completed status)
- File uploads (just name + file)
- Contractor info (name, phone, email)

## Step 1: Create Components

### 1.1 Create `work.todo` Component
1. Go to **Content-Type Builder** → **Components**
2. Click **Create new component**
3. Category: `work`, Name: `todo`
4. Add fields:
   - `text` (Text, Short text, Required, Max: 500)
   - `completed` (Boolean, Default: false, Required)

### 1.2 Create `work.attachment` Component  
1. Create component: `work` → `attachment`
2. Add fields:
   - `name` (Text, Short text, Required, Max: 200)
   - `file` (Media, Single file, Required, All types)

## Step 2: Create Renovation Work Content Type

1. **Content-Type Builder** → **Collection Types** → **Create new collection type**
2. Display name: `Renovation Work`
3. API ID: `renovation-work`

### Add These Fields:

**Basic Info:**
- `name` (Text, Short text, Required, Max: 100)
- `description` (Text, Long text, Max: 1000)

**Budget & Costs:**
- `budget` (Number, Decimal, Required, Default: 0)
- `actualCost` (Number, Decimal)

**Status & Progress:**
- `status` (Enumeration: active/planned/future/completed, Default: planned, Required)
- `progress` (Number, Integer, Default: 0, Min: 0, Max: 100)
- `canActivate` (Boolean, Default: false)

**Timeline:**
- `timeline` (Enumeration: now/Q1/Q2/Q3/Q4, Default: now, Required)
- `year` (Number, Integer, Min: 2024, Max: 2035)

**Execution:**
- `executionType` (Enumeration: DIY/Contractor/Hybrid, Default: DIY, Required)
- `contractor` (JSON, Default: `{"name": null, "phone": null, "email": null}`)

**Dates:**
- `startDate` (Date)
- `completedAt` (DateTime)

**Work Items:**
- `todos` (Component, work.todo, Repeatable)
- `attachments` (Component, work.attachment, Repeatable)

**Relations:**
- `project` (Relation, Many to One, api::project.project)
- `user` (Relation, Many to One, plugin::users-permissions.user)

## Step 3: Set Permissions

**Settings** → **Users & Permissions** → **Roles** → **Authenticated**:
- ✅ **Renovation-work**: find, findOne, create, update, delete
- ✅ **Upload**: find, upload, destroy (needed for file upload/delete)

## Step 4: Create Information Inquiry Content Type

This stores email addresses from users who want to be notified when various platform features become available (contractor marketplace, cost estimation, etc.).

1. **Content-Type Builder** → **Collection Types** → **Create new collection type**
2. Display name: `Information Inquiry`
3. API ID: `information-inquiry`

### Add These Fields:

**Basic Info:**
- `email` (Email, Required)
- `topic` (Text, Short text, Required, Max: 200 - what feature they're interested in)

**Status & Context:**
- `notified` (Boolean, Default: false)
- `userData` (JSON, Optional - stores user context like work ID, project info)
- `notes` (Text, Long text, Optional - for admin notes)

## Step 5: Set Permissions

**Settings** → **Users & Permissions** → **Roles** → **Public**:
- ✅ **Information-inquiry**: create (allows anonymous email signup)

**Authenticated** (if you want authenticated users to also sign up):
- ✅ **Information-inquiry**: find, findOne, create

## Step 6: Test

### Test Renovation Work:
```json
{
  "name": "Kitchen Renovation",
  "budget": 15000,
  "status": "planned",
  "executionType": "DIY"
}
```

### Test Information Inquiry:
```json
{
  "email": "user@example.com",
  "topic": "contractor-marketplace",
  "userData": {
    "workId": 123,
    "workName": "Kitchen Renovation",
    "executionType": "DIY"
  }
}
```

**Other example topics:**
- `contractor-marketplace`
- `cost-estimation`
- `material-sourcing`
- `project-planning`
- `building-permits`

That's it! You now have both renovation work management and flexible email lead capture for all your future platform features.