# Momentum Portal - Front End Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![@KineticData KineticData](https://img.shields.io/badge/GitHub%20-KineticData-lightgrey.svg?style=flat-square)](https://github.com/kineticdata/momentum-portal)

The Momentum Portal is a fully-functional demo that brings the capabilities of the Kinetic Experience Platform to life. This codebase implements the Momentum Portal.

## Table of Contents

- [Quick Start](#quick-start)
- [Included Libraries](#included-libraries)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## Quick Start

### Clone the Repository

```
git clone https://github.com/kineticdata/kinetic-enablement-playground-v7
```

The front end code can be found in the `portal` directory of the repo.

### Install Dependencies

```bash
# make sure you are in the `portal` directory
$ yarn install
```

Requires `node` `v20` or later, and `yarn` `v1`.

### Start Local Dev Server

```bash
# starts the dev server with hot reload at http://localhost:3000
$ yarn start
```

The first time you run the above command, you will be prompted to enter a URL to a Kinetic Platform server, which the dev server will proxy to. This URL will be stores in the `.env.development.local` file and can later be changed there.

The local server will be available at [http://localhost:3000](http://localhost:3000). Changes to source files will update automatically.

### Create Production Build

```bash
# build for production with minification
$ yarn build
```

The build artifacts will be stored in the `build/` directory.

## Included Libraries

The following list summarizes the different libraries that have been used to create this project.

[Vite](https://vite.dev/): Build tooling for the project.  
[React](https://react.dev/): Framework for building out the application.  
[React Router](https://reactrouter.com/en/main): Routing library.  
[Redux Toolkit](https://redux-toolkit.js.org/) + [ReactRedux](https://react-redux.js.org/): Global state storage.  
[Ark UI](https://ark-ui.com/): Headless component library.  
[Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework.  
[Tabler Icons](https://tabler.io/icons): Icon library.  
[@kineticdata/react](https://components.kineticdata.com/apis): Kinetic API helpers, authentication, form rendering, and i18n.  
[date-fns](https://date-fns.org/): Date utility library.  
[immer](https://immerjs.github.io/immer/): Immutable data helper.  
[clsx](https://github.com/lukeed/clsx): Class name helper.

## Project Structure

```
kinetic-enablement-playground-v7/portal
├── src/                    # project source code
│   ├── assets/             # static assets (e.g. styles, fonts)
│   ├── atoms/              # design system components
│   ├── components/         # components used by pages
│   ├── helpers/            # helper functions
│   ├── pages/              # pages within the app
│   │
│   ├── App.jsx             # app renderer
│   ├── index.jsx           # javascript root
│   ├── redux.js            # redux toolkit setup
│   └── setupEnv.cjs        # prestart script to set up local env file
│
├── .env.development        # dev environment variables
├── .env.development.local  # local dev environment variables
├── .env.production         # prod environment variables
├── index.html              # html root
├── package.json
├── vite.config.js          # vite config (Tailwind 4 is wired in here via
│                           #   @tailwindcss/vite — no postcss/tailwind config)
└── yarn.lock               # dependency lock file - DO NOT EDIT OR DELETE
```

## Documentation

[Kinetic Widgets Documentation &#x2B9E;](src/components/kinetic-form/widgets/README.md)

See the [Kinetic Data Documentation Library](https://docs.kineticdata.com/) for more information.

### License

Code released under [the MIT license](https://github.com/coreui/coreui-free-react-admin-template/blob/main/LICENSE).
