# SPATIAL-FRONTEND
This discusses the directory structure of the whole project and their contents.

## Folders
- **`Public`**

    The static resources used by the project
    - Main `index.html` file where all the components are loaded once we run the project.

- **`src`**

    Main project files acting as the backbone for the application.

    - **`api`**

        `index.ts` - main file containing code that is responsible for interacting with the backend api and handling responses.

    - **`components`**

        Reusable `tsx` components used in the UI for SPATIAL frontend.
    - **`config`**

        `oktaConfig.ts` - File handling configuration with [OKTA](https://www.okta.com/customer-identity/single-sign-on/) used an authentication package for the application.

    - **`context`**

        `context.tsx` - SPATIAL platform uses numerous context switches along the operations of the use cases. This file acts as a single repo for handling the context swtiches.

    - **`layout`**
        Basic layout files for the SPATIAL UI

    - **`pages`**
        A collection of page components which cotains differnt props and components used for the seamless UI for the application.

    - **`routes`**

        `AppRoutes.tsx` - Single file where all the different routes available for the application is written.

    - **`types`**
        
        Custom type interfaces used in differnt operations for the application.

    - **`views`**
        
        Some necessary UI files.


## Files

- **`.env`**
    
    Declaration of `Environment Variables` used in runtime for the project.

- **`clean.sh`**
    
    Shell script to clean the project. E.g. removal of past log files. Later on this might be removed and the cleaning might be handled by services managing logs and errors.

- **`install.sh`**
    
    Shell script for initializing the project once a new dev onboards into the project.

- **`package.json`**
    
    Where the third-party packages used for the project.

- **`start-client.sh`**
    
    Shell script for automating the start of the client application.

- **`start-maip`**
    
    Shell script for automating the start of the spatial-backend api application.

- **`tsconfig.json`**
    
    Just as the name suggests, custom typescript configuration for the whole project.

