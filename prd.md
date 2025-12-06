# Product Requirements Document
## Kids' Raffle Registration System

---

### Document Details

| Field | Details |
|-------|---------|
| **Project Name** | Kids' Raffle Registration System |
| **Version** | 1.0 |
| **Status** | Ready for Development |
| **Platform** | Web (Mobile Responsive) |
| **Last Updated** | December 6, 2024 |
| **Author** | [Khaled Cherif] |

---

## 1. Executive Summary

### 1.1 Overview
A simple, single-page web application for collecting kids' raffle entries with basic parent information. The system will auto-generate sequential raffle IDs, send SMS confirmations, and provide admin access to view and export entries.

### 1.2 Objectives
- Provide a fast, mobile-friendly registration form
- Auto-generate sequential raffle entry numbers (001, 002, 003...)
- Send SMS confirmation with raffle number
- Store all entries securely in Supabase
- Enable admin to view and export entries to Excel

### 1.3 Success Metrics
- Form completion rate > 90%
- SMS delivery success rate > 95%
- Page load time < 2 seconds
- Zero data loss

---

## 2. Scope

### 2.1 In Scope
- Single-page registration form
- SMS notification system
- Supabase database integration
- Simple admin dashboard
- Excel export functionality
- Mobile-responsive design

### 2.2 Out of Scope
- User authentication for parents
- Winner selection functionality
- Email notifications
- Multi-language support
- Payment processing
- Advanced analytics
- Multi-step forms
- Image uploads

---

## 3. User Personas

### 3.1 Primary User: Parent/Guardian
- **Goal**: Quickly register their child for a raffle
- **Needs**: Simple form, confirmation of entry
- **Tech proficiency**: Basic (must work on mobile)

### 3.2 Secondary User: Admin
- **Goal**: Monitor entries and export data
- **Needs**: View all submissions, download Excel file
- **Tech proficiency**: Basic

---

## 4. Functional Requirements

### 4.1 Registration Form

#### 4.1.1 Form Fields (All Required)
| Field Name | Type | Validation |
|------------|------|------------|
| Kid Name | Text | Min 2 characters, letters only |
| Date of Birth | Date Picker | Valid date, must be in the past |
| Grade | Dropdown | Pre-populated options (see 4.1.2) |
| Parent Name | Text | Min 2 characters |
| Parent Phone | Tel | 10-11 digits, numbers only (egyptian numbers, allow users to enter numbers like this 01140289944 or like this 201140289944 or like this 1140289944, but do a check on the mobile and normalize it |

#### 4.1.2 Grade Options
- Pre-K
- Kindergarten
- Year 1
- Year 2
- Year 3
- Year 4
- Year 5
- Year 6


#### 4.1.3 Form Behavior
- All fields are required (display asterisk *)
- Display inline validation errors in real-time
- "Submit" button disabled until all fields are valid
- Show loading state during submission
- Prevent double submission

#### 4.1.4 Success State
Upon successful submission, display:
- "Congratulations! You entered the raffle"
- Large, prominent display of the raffle ID (e.g., "#042")
- Message: "An SMS has been sent to [phone number] with your raffle number"
- "Register Another Child" button to reset form

### 4.2 SMS Notification

#### 4.2.1 SMS Content
```
Congratulations! [Kid Name] is entered in the raffle. Your raffle number is: [XXX]
```

#### 4.2.2 SMS Specifications
- Send immediately after successful form submission
- Sequential number format: 001, 002, 003... 999, 1000+
- If SMS fails, still save entry to database (log error)

### 4.3 Database (Supabase)

#### 4.3.1 Table: `raffle_entries`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | Primary Key, Auto-generated |
| raffle_number | integer | Sequential, Unique, NOT NULL |
| kid_name | varchar(255) | NOT NULL |
| date_of_birth | date | NOT NULL |
| grade | varchar(50) | NOT NULL |
| parent_name | varchar(255) | NOT NULL |
| parent_phone | varchar(20) | NOT NULL |
| created_at | timestamp | Default: now() |
| sms_sent | boolean | Default: false |
| sms_sent_at | timestamp | Nullable |

#### 4.3.2 Database Rules
raffle_number auto-increments starting from 1
Multiple entries allowed per phone number (for parents with multiple children)
Each child gets a unique raffle number
Soft delete not required

### 4.4 Admin Dashboard

#### 4.4.1 Access
- Simple password protection (no user management)
- Route: `/admin`
- Single admin password stored in environment variable

#### 4.4.2 Dashboard Features
- **Header**: "Raffle Entries Admin"
- **Statistics Card**: 
  - Total Entries
- **Data Table**: Display all entries with columns:
  - Raffle #
  - Kid Name
  - Grade
  - Parent Name
  - Parent Phone
  - Submitted Date/Time
  - SMS Status (✓ Sent / ✗ Failed)
- **Sort**: By raffle number (descending by default)
- **Search**: Filter by kid name or parent name
- **Export Button**: "Export to Excel"

#### 4.4.3 Excel Export
- Filename format: `raffle_entries_YYYY-MM-DD.xlsx`
- Include all columns from database
- Format dates as MM/DD/YYYY
- Format phone as text (preserve leading zeros)

---

## 5. Non-Functional Requirements

### 5.1 Design Specifications

#### 5.1.1 Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: Regular (400), Medium (500), Semi-Bold (600)

#### 5.1.2 Color Palette
- **Primary**: #000000 (Black)
- **Secondary**: #FFFFFF (White)
- **Gray Scale**:
  - Light Gray: #F5F5F5 (backgrounds)
  - Medium Gray: #A0A0A0 (borders, disabled states)
  - Dark Gray: #333333 (secondary text)

#### 5.1.3 Design Principles
- Minimal, clean interface
- No gradients or shadows
- High contrast for accessibility
- Generous white space
- Clear visual hierarchy

### 5.2 Responsive Design
- **Mobile First**: Optimized for 320px - 768px
- **Tablet**: 769px - 1024px
- **Desktop**: 1025px+
- Single column layout on mobile
- Touch-friendly buttons (min 44x44px)

### 5.3 Performance
- Page load time: < 2 seconds
- Form submission: < 3 seconds
- SMS delivery: < 10 seconds



### 5.5 Security
- HTTPS only
- Environment variables for sensitive data
- SQL injection prevention (use Supabase parameterized queries)
- Rate limiting on form submission (max 5 per phone number per day)
- Admin password hashed/secured

### 5.6 Accessibility
- WCAG 2.1 Level AA compliance
- Semantic HTML
- Proper form labels
- Keyboard navigation support
- Screen reader compatible

---

## 6. Technical Specifications

### 6.1 Technology Stack

#### Frontend
- **Framework**: React (with Vite) or Next.js
- **Styling**: Tailwind CSS (black/white/gray utilities only)
- **Form Handling**: React Hook Form or native HTML5 validation
- **Date Picker**: Native HTML5 date input or simple library

#### Backend
- **Database**: Supabase (PostgreSQL)
- **SMS Service**: leave this feature at the end 
- **Hosting**: Netlify

#### Dependencies
- `@supabase/supabase-js` - Database client
- `xlsx` or `exceljs` - Excel export
- Google Fonts (Inter)

### 6.2 Environment Variables
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SMS_API_KEY=
SMS_API_SECRET=
SMS_SENDER_NUMBER=
ADMIN_PASSWORD=
```



## 7. User Flows

### 7.1 Registration Flow
1. User lands on registration page
2. User fills out form fields
3. User clicks "Submit"
4. System validates input
5. System generates sequential raffle number
6. System saves entry to Supabase
7. System sends SMS with raffle number
8. System displays success message with raffle ID
9. User can register another child or close page

### 7.2 Admin Flow
1. Admin navigates to `/admin`
2. Admin enters password
3. Admin views dashboard with all entries
4. Admin can search/filter entries
5. Admin clicks "Export to Excel"
6. Excel file downloads automatically

---

## 8. Error Handling

### 8.1 Form Validation Errors
- Display inline error messages in red text
- Prevent form submission
- Messages:
  - "Please enter a valid name"
  - "Date of birth is required"
  - "Please select a grade"
  - "Phone number must be 10 digits"

### 8.2 Submission Errors
- Database error: "Registration failed. Please try again."
- SMS error: "Registration saved, but SMS failed to send."
- Network error: "Connection error. Please check your internet."

### 8.3 Admin Errors
- Invalid password: "Incorrect password"
- Export failure: "Export failed. Please try again."

---

## 9. Data & Privacy

### 9.1 Data Retention
- Store entries indefinitely until raffle concludes
- Admin can manually delete entries if needed

### 9.2 Privacy Considerations
- No data shared with third parties (except SMS provider)
- Phone numbers used only for raffle confirmation
- Display privacy notice on form: "Your information will only be used for this raffle"

### 9.3 Legal Compliance
- Basic terms of service link
- Privacy policy link
- Checkbox: "I agree to receive SMS notification" (optional)

---

## 10. Testing Requirements

### 10.1 Test Cases

#### Registration Form
- [ ] All fields required validation works
- [ ] Date picker prevents future dates
- [ ] Phone number accepts only digits
- [ ] Form cannot be submitted twice
- [ ] Success message displays correct raffle ID
- [ ] SMS is sent with correct raffle number
- [ ] Entry is saved to database correctly

#### Admin Dashboard
- [ ] Password protection works
- [ ] All entries display correctly
- [ ] Search/filter functions work
- [ ] Excel export includes all data
- [ ] Excel export formats correctly

#### Responsive Design
- [ ] Form works on mobile (320px width)
- [ ] Form works on tablet (768px width)
- [ ] Form works on desktop (1920px width)
- [ ] Touch targets are minimum 44x44px on mobile

---

## 11. Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase database created with correct schema
- [ ] SMS service account set up and tested
- [ ] Admin password set
- [ ] HTTPS certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented

---

## 12. Future Enhancements (Not in V1)

- Email notifications in addition to SMS
- Automated winner selection
- QR code for quick registration
- Multi-language support
- Advanced analytics dashboard
- Bulk SMS to all entrants
- Integration with other raffle platforms

---

## 13. Appendix

### 13.1 Sample Form Layout (Wireframe Description)

```
+----------------------------------+
|     Kids' Raffle Registration    |
+----------------------------------+
|                                  |
|  Kid Name*                       |
|  [_________________________]     |
|                                  |
|  Date of Birth*                  |
|  [_________________________]     |
|                                  |
|  Grade*                          |
|  [Select Grade ▼___________]     |
|                                  |
|  Parent Name*                    |
|  [_________________________]     |
|                                  |
|  Parent Phone Number*            |
|  [_________________________]     |
|                                  |
|          [Submit Entry]          |
|                                  |
+----------------------------------+
```

### 13.2 Sample Success Screen

```
+----------------------------------+
|              ✓                   |
|                                  |
|   Congratulations!               |
|   You entered the raffle         |
|                                  |
|   Your Raffle Number:            |
|          #042                    |
|                                  |
|   An SMS has been sent to        |
|   (123) 456-7890                 |
|                                  |
|   [Register Another Child]       |
|                                  |
+----------------------------------+
```

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| Developer | | | |

---

**End of Document**