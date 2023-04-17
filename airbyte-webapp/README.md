
# airbyte-webapp

This module contains the Airbyte Webapp. It is a React app written in TypeScript. It runs in a Docker container. A very lightweight nginx server runs in that Docker container and serves the webapp.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.<br />

### `npm run build`

Builds the app for production to the `build` folder.<br />

### VERSION=yourtag ./gradlew :airbyte-webapp:assemble

Builds the app and Docker image and tags the image with `yourtag`.
Note: needs to be run from the root directory of the Airbyte project.

## Entrypoints
* `airbyte-webapp/src/App.tsx` is the entrypoint into the OSS version of the webapp.
* `airbyte-webapp/src/packages/cloud/App.tsx` is the entrypoint into the Cloud version of the webapp.


## Change log:
#### 2023.04.17
1. Fixed react-intl compiling without HTML tag `<b>`
#### 2023.04.13
1. Update select scrollBar style
#### 2023.04.04
1. Settings/Change password UI
2. Settings/Account UI
3. Settings/Support UI
#### 2023.03.31
1. Email & verify screen UI
2. Readjust the Source/Destination/Connection TestConnection component to remove scrolling
3. Copy Source/Destination flows add test endpoint(check_connection_for_update)
#### 2023.03.29
1. BugFixed：plans run out modal error message
2. Change BillingWarningBanner component style
3. Change the sign out icon
4. Update translation
#### 2023.03.28
1. Add Fullstory snippet to webapp
#### 2023.03.27
1. Link to documentation(Sidebar)
#### 2023.03.24
1. Optimization when plan runs out(connection/config page/add modal)
#### 2023.03.23
1. UI Too many paginations(connection page)
#### 2023.03.22
1. Connection config update
2. UI when there is no source/destination
#### 2023.03.21
1. Indicate integration authentication status
2. Center the form in the Sign in page
3. Fix the select/breadcuumbs text is too long and not hidden
#### 2023.03.17
1. UI related changes - stream table
#### 2023.03.16
1. UI related changes - add new user
2. UI related changes - error message popup
3. Readjust ConnectorDocumentationLayout height
#### 2023.03.15
1. Sign up / sign in page responsiveness
2. UI related changes - add new user
#### 2023.03.14
1. Add a source page UI optimization
2. UI related changes - source/destination testing page
#### 2023.03.13
1. Frontend translation update
2. UI related changes - config page UI(create_connection bgColor)
#### 2023.03.10
1. UI related changes - change plan page(add back button)
2. UI related changes - modal size(change CancelPlanModal/DeleteUserModal/ChangeRoleModal)
#### 2023.03.09
1. Sign out confirmation message.
2. UI related changes - sign out button location
3. UI related changes - add/edit source/destination page (Change the phrase to: Expand this form to continue setting up your integration )
#### 2023.03.08
1. Overall size improvements
#### 2023.03.07
1. Bugfix:Table&page scroll style
#### 2023.03.06
1. New UI content update
2. Bugfix:Table&page scroll style
3. Connection page UI improvements
#### 2023.03.02
1. Error UI
2. Fix the problem that the Tab component on the Source/Destination page is not selected.
3. Cancel left and right sliding fixed style
#### 2023.03.01
1. Supplementary modal styles and adjust some background colors.
#### 2023.02.28
1. Change source/destination/connection ui
#### 2023.02.21
1. Change sidebar settings style as same as other buttons(files:sidebar.tsx)
2. User management page, small screen automatic adaptation problem (files.CustomSelect.tsx)
#### 2023.01.31
1. change wording in Alpha connectors (file: link.ts&en.json&WarningMessage.tsx)
#### 2023.01.13
1. Hide sync log (file: components/JobItem/JobItem.tsx)
2. Change link in connection config (file:links.ts(syncModeLink))
#### 2022.12.29
1. Add copy function for ource/destination page
#### 2022.12.28
1. Show source & destination pages (file: views/layout/sideBar)
#### 2022.12.27
1. Add an edit icon to the connections page (file: EntityTable/ConnectionTable.tsx&EntityTable/components/ConnectionSettingsCell.tsx&Switch/Switch.tsx)
2. Displays notification Settings (file: SettingsPage/SettingsPage.tsx&SettingsPage/pages/NotificationPage/NotificationPage.tsx)
#### 2022.12.14
1. Add sign out button in sidebar (file: en.json&SideBar.tsx)
#### 2022.12.13
1. Airbtyte replaced by Daspire (file: en.json)
2. Hide error log (file: ConnectorCard.tsx)
#### 2022.12.12
1. Add privacy & terms jump link for webapp registration page(file：links.ts&SignupForm.tsx)
