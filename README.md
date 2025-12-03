# DMARC Report Generator

A client-side tool to generate realistic DMARC aggregate reports (XML) for QA and testing purposes. Built with Vue 3, Vite, and Tailwind CSS.

## Features

- **Client-Side Generation**: All data is generated locally in your browser. No data is sent to any server.
- **Realistic Data**: Uses `faker` to generate random but realistic source IPs, authentication results (SPF/DKIM), and report metadata.
- **Flexible Filtering**: Generate reports based on a specific number of **Days** (historical data) or a specific count of **Reports**.
- **Standard Compliance**: Outputs valid XML files adhering to the DMARC aggregate report schema.
- **Batch Export**: Automatically zips multiple reports into a single download for easy testing.

## Tech Stack

- **Framework**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Libraries**:
  - `jszip`: For creating ZIP archives.
  - `file-saver`: For client-side file downloads.
  - `@faker-js/faker`: For generating mock data.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    Open the local URL (e.g., `http://localhost:5173`) in your browser.

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    The output will be in the `dist/` directory.

## How to Use

1.  Enter the **Domain** you want the reports to be associated with (e.g., `example.com`).
2.  Select the **Generation Mode**:
    -   **Days of Data**: Generates one report per day for the last *N* days.
    -   **Number of Reports**: Generates *N* unique reports (distributed over the last 30 days).
3.  Enter the **Count** (max 30).
4.  Click **Generate Report**. A `.zip` file containing the XML reports will automatically download.

## License

MIT
