# FEMS Database Design (MongoDB)

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ FIRE_EXTINGUISHER : registers
    USER ||--o{ INSPECTION : schedules
    USER ||--o{ INSPECTION : performs
    USER ||--o{ MAINTENANCE : performs
    USER ||--o{ NOTIFICATION : receives
    FIRE_EXTINGUISHER ||--o{ INSPECTION : has
    FIRE_EXTINGUISHER ||--o{ MAINTENANCE : has

    USER {
        ObjectId _id PK
        string firstName
        string lastName
        string email UK
        string password
        enum role
        boolean isActive
        string passwordResetToken
        date passwordResetExpires
    }

    FIRE_EXTINGUISHER {
        ObjectId _id PK
        string serialNumber UK
        string location
        enum type
        enum size
        date installationDate
        date expiryDate
        enum status
        ObjectId registeredBy FK
    }

    INSPECTION {
        ObjectId _id PK
        ObjectId fireExtinguisher FK
        ObjectId scheduledBy FK
        ObjectId assignedInspector FK
        date inspectionDate
        string inspectionTime
        enum status
        string result
        string notes
    }

    MAINTENANCE {
        ObjectId _id PK
        ObjectId fireExtinguisher FK
        ObjectId performedBy FK
        string actionTaken
        date maintenanceDate
        string issuesIdentified
        string notesAndRecommendations
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK
        string title
        string message
        enum type
        boolean isRead
    }
```

## Collections & Indexes

| Collection | Unique Constraints | Indexes |
|------------|-------------------|---------|
| users | email | email, role |
| fireextinguishers | serialNumber | serialNumber, status, expiryDate, location |
| inspections | — | fireExtinguisher, inspectionDate+status, status |
| maintenances | — | fireExtinguisher, maintenanceDate |
| notifications | — | recipient, isRead, createdAt |

## Microservice Data Ownership

| Service | Collections |
|---------|-------------|
| User Management / Auth | users |
| Fire Extinguisher Management | fireextinguishers |
| Inspection & Maintenance | inspections, maintenances |
| Notification | notifications |
| Reporting | read-only aggregates across all |
