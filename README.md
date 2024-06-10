# Spatial Frontend

This is the Frontend for spatial


## Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn package manager
- Okta developer account for authentication setup
- Docker installed if you wish to containerize the application

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/toluelemson/spartial-frontendv2.git
```

Change directory to the cloned repository:

```bash
cd spartial-frontendv2
```

Checkout the feature branch:

```bash
git checkout authentication
```

Install the necessary dependencies:

```bash
npm install
```

or if you're using Yarn:

```bash
yarn install
```

## Configuration

Before running Spatial, you need to set up the following environment variables with your Okta configuration details. Create a `.env` file in the root directory
Replace yourOktaClientId, yourOktaIssuerUrl, etc., with actual Okta configuration details. Request them if you don't have this information.

```env
REACT_APP_OKTA_CLIENT_ID=OktaClientId
REACT_APP_OKTA_ISSUER=OktaIssuerUrl
REACT_APP_OKTA_REDIRECT_URI=OktaRedirectUri
REACT_APP_OKTA_SCOPES=OktaScopes
REACT_APP_OKTA_PKCE=OktaPkce
REACT_APP_OKTA_DISABLE_HTTPS_CHECK=OktaDisableHttpsCheck
```

## Running the Application Locally

Start the development server:

```bash
npm start
```

or with Yarn:

```bash
yarn start
```

Spatial will open in your default web browser at `http://localhost:3000`.

## Docker Support

### Building the Docker Image

To build a Docker image of Spatial, run:

```bash
sudo docker-compose build build
```

### Running the Docker Container

To run Spatial Frontend as a Docker container:

```bash
docker-compose up
```

Spatial will now be accessible at `http://localhost:3000`.


### Running the Spatial Backend
To run the Spatial Backend as a Docker container, make sure you have cloned the Maip backend from this repository: [https://github.com/Montimage/maip](https://github.com/Montimage/maip)
```bash 
git clone https://github.com/toluelemson/spatial-backend
```
```bash 
cd client
```

```bash
sudo docker-compose build .
```
```bash
sudo docker-compose up
```

## Contributing

We welcome contributions to this project. Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/Feature`).
3. Make changes and commit them (`git commit -m 'Add some Feature'`).
4. Push to the branch (`git push origin feature/Feature`).
5. Open a Pull Request.# spatial-backend
