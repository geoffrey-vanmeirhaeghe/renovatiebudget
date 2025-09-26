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

## Step 6: Create User Profile Content Type

This stores basic user information collected during onboarding.

1. **Content-Type Builder** → **Collection Types** → **Create new collection type**
2. Display name: `User Profile`
3. API ID: `user-profile`

### Add These Fields:

**Personal Info:**
- `firstName` (Text, Short text, Required, Max: 100)
- `lastName` (Text, Short text, Required, Max: 100)
- `phone` (Text, Short text, Max: 20)
- `preferredLanguage` (Enumeration: nl/fr/en/de, Default: en)
- `notificationPreferences` (JSON, Optional - for future notification settings)
- `hasCompletedOnboarding` (Boolean, Default: false)

**Relation:**
- `user` (Relation, One to One, plugin::users-permissions.user)

## Step 7: Create Project Content Type

This stores project and property information. Each user can have multiple projects.

1. **Content-Type Builder** → **Collection Types** → **Create new collection type**
2. Display name: `Project`
3. API ID: `project`

### Add These Fields:

**Project Info:**
- `ProjectID` (UID, Required - auto-generated unique identifier)
- `ProjectName` (Text, Short text, Required, Max: 200)
- `Description` (Text, Long text, Max: 1000)

**Property Address:**
- `PropertyAddress` (JSON, Required - stores full address object with street, number, postalCode, municipality, region)

**Property Details:**
- `PropertyType` (Enumeration: house/apartment/townhouse/studio/loft/commercial/mixed-use/other, Required)
- `PropertyOwnership` (Enumeration: owner/renter/looking-to-buy/investor, Required)
- `PropertySize` (Number, Integer - property size in m²)
- `YearBuilt` (Number, Integer, Min: 1800, Max: 2025)

**Renovation Plans:**
- `RenovationScope` (Enumeration: complete-renovation/partial-renovation/single-room/cosmetic-updates/maintenance/extension/energy-upgrade, Required)
- `ProjectTimeline` (Enumeration: immediate/this-quarter/this-year/next-year/2-3-years/planning-phase, Required)
- `EstimatedBudget` (Enumeration: under-10k/10k-25k/25k-50k/50k-100k/100k-200k/200k-500k/over-500k/not-determined)
- `ActualBudget` (Number, Decimal - actual budget in EUR)
- `ProjectInterests` (JSON - array of renovation interests for this project)

**Project Status:**
- `ProjectStatus` (Enumeration: planning/design-phase/permit-pending/in-progress/on-hold/completed/cancelled, Default: planning)
- `StartDate` (Date)
- `CompletionDate` (Date)
- `IsPrimary` (Boolean, Default: false - is this the user's active project)

**3D & Technical:**
- `GeneralAttributes` (JSON - 3D model general attributes)
- `Notes` (Rich text)

**Relations:**
- `user` (Relation, Many to One, plugin::users-permissions.user)
- `building` (Relation, One to One, api::building.building)
- `renovationWorks` (Relation, One to Many, api::renovation-work.renovation-work, mappedBy: project)

## Step 8: Set Final Permissions

**Settings** → **Users & Permissions** → **Roles**:

**Authenticated:**
- ✅ **User-profile**: find, findOne, create, update (users manage their own profiles)
- Keep all other authenticated permissions from previous steps

## Step 9: Test

### Test User Profile:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+32 123 456 789",
  "preferredLanguage": "en",
  "hasCompletedOnboarding": true
}
```

### Test Project:
```json
{
  "ProjectName": "Kitchen Renovation",
  "Description": "Complete kitchen makeover with new cabinets and appliances",
  "PropertyAddress": {
    "street": "Rue de la Loi",
    "number": "42",
    "postalCode": "1000",
    "municipality": "Brussels",
    "region": "brussels"
  },
  "PropertyType": "apartment",
  "PropertyOwnership": "owner",
  "RenovationScope": "single-room",
  "ProjectTimeline": "this-quarter",
  "EstimatedBudget": "25k-50k",
  "ProjectInterests": ["kitchen", "energy-efficiency"],
  "IsPrimary": true
}
```

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

## Data Architecture Summary

The new structure separates concerns properly:

**User Profile**: Personal information only (name, phone, language preferences)
**Projects**: Property details, renovation plans, and project-specific information
**Renovation Works**: Individual renovation tasks within projects
**Information Inquiries**: Lead capture for future features

This allows:
- Users to have multiple projects
- Each project to have its own property details and renovation scope
- Proper separation of user data vs project data
- Scalable architecture for future features

That's it! You now have a properly structured system with user profiles, project management, renovation work tracking, and flexible email lead capture for all your future platform features.