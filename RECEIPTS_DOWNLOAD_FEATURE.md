# Payment Receipts Download Feature

## Overview
This feature allows admins to download payment receipts for a specific contest within a selected date range. The download includes both an Excel file with receipt details and all receipt images organized by school ID.

## Location
The feature is integrated into the **Fetch All Registrations** page for each contest:
- Path: `/admin/fetchallregistration/[contestId]`
- Button: "Download Receipts" (available on both desktop and mobile views)

## Features

### 1. **Contest-Specific**
- Receipts are filtered by the specific contest
- Contest ID is automatically passed from the page

### 2. **Date Range Selection**
- Interactive calendar UI for selecting start and end dates
- **Pakistan Time (PKT/UTC+5)** timezone handling
- Start date: Automatically set to **00:00:00 PKT**
- End date: Automatically set to **23:59:59 PKT**

### 3. **Comprehensive Download**
The download creates a **ZIP file** containing:
- **Excel file** with receipt details:
  - Serial Number
  - Receipt ID
  - Registration ID
  - School ID
  - School Name
  - Contest Name
  - Image URL
  - Upload Date (in Pakistan Time)
  
- **Images folder** (`receipt_images/`):
  - All receipt images downloaded
  - File naming format: `{schoolId}_receipt_{receiptId}.{extension}`
  - Example: `1234_receipt_abc123.jpg`

### 4. **User Experience**
- Real-time progress notifications
- Loading states during download
- Error handling with clear messages
- Automatic modal close after successful download

## Technical Implementation

### Components

1. **ReceiptsDownloadModal.tsx**
   - Modal dialog with date pickers
   - Handles image downloads and ZIP creation
   - Uses JSZip library for file compression

2. **API Endpoint**: `/api/receipts/download-by-contest`
   - Filters receipts by contest ID and date range
   - Converts Pakistan Time to UTC for database queries
   - Returns receipts with related registration, school, and contest data

### Dependencies Added
- `jszip`: ^3.10.1 (for creating ZIP files)

### File Structure
```
app/
├── (routes)/
│   └── admin/
│       └── fetchallregistration/
│           └── [id]/
│               ├── page.tsx (updated)
│               └── ReceiptsDownloadModal.tsx (new)
└── api/
    └── receipts/
        └── download-by-contest/
            └── route.ts (new)
```

## Usage Instructions

1. Navigate to the contest's registration page:
   - Dashboard → Contest → View Registrations

2. Click the **"Download Receipts"** button

3. In the modal:
   - Select **Start Date** using the calendar
   - Select **End Date** using the calendar
   - Review the selected date range (displayed in Pakistan Time)

4. Click **"Download"** button

5. Wait for the process to complete:
   - Fetching receipts
   - Downloading images
   - Creating ZIP file

6. The ZIP file will be automatically downloaded with filename format:
   - `{contestName}_receipts_{startDate}_to_{endDate}.zip`

## Example Output

### ZIP File Contents:
```
IKMC_2024_receipts_2024-01-01_to_2024-01-31.zip
│
├── receipts_2024-01-01_to_2024-01-31.xlsx
│
└── receipt_images/
    ├── 1234_receipt_abc123.jpg
    ├── 1234_receipt_def456.png
    ├── 5678_receipt_ghi789.jpg
    └── ...
```

### Excel File Structure:
| S.No | Receipt ID | Registration ID | School ID | School Name | Contest Name | Image URL | Upload Date |
|------|-----------|----------------|-----------|-------------|-------------|-----------|-------------|
| 1 | abc123 | reg001 | 1234 | ABC School | IKMC 2024 | https://... | 1/15/2024, 2:30:00 PM |

## Pakistan Time Handling

The system correctly handles Pakistan Standard Time (PKT = UTC+5):

- **User selects**: January 15, 2024
- **Start time**: January 15, 2024 00:00:00 PKT
- **Database query**: January 14, 2024 19:00:00 UTC
- **End time**: January 15, 2024 23:59:59 PKT
- **Database query**: January 15, 2024 18:59:59 UTC

This ensures all receipts uploaded during the selected day in Pakistan time are included.

## Error Handling

The system handles various error scenarios:
- No dates selected
- Invalid date range (start > end)
- No receipts found
- Image download failures (logged, doesn't stop process)
- Network errors
- Server errors

All errors are displayed to the user via toast notifications.

## Installation

To use this feature, ensure the following package is installed:

```bash
npm install jszip@^3.10.1
```

Or if using pnpm:
```bash
pnpm add jszip@^3.10.1
```

## Notes

- Images are downloaded with CORS proxy if needed (handled by axios)
- Large downloads may take time depending on number of receipts and image sizes
- The feature requires Admin role access
- All timestamps are displayed in Pakistan Time for user convenience
