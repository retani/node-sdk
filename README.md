Allthings Node/Javascript SDK

## Contents

1.  [Installation & Usage](#installation--usage)
1.  [Configuration](#configuration)
    1.  [Options](#configuration-options)
1.  [Example](#example)
1.  [API](#api)

## Installation & Usage

```sh
yarn add @allthings/sdk
```

## Configuration

```javascript
const allthingsRestSdk = require('@allthings/sdk/rest')

const api = allthingsRestSdk({
  accessToken: 'foobar',
})
```

### Configuration Options

The available configuration options are outlined here:

| Option           | Default | Description                                                                                             |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| **accessToken**  |         | API Access Token                                                                                        |
| **clientId**     |         | OAuth 2.0 clientId                                                                                      |
| **clientSecret** |         | OAuth 2.0 client secret                                                                                 |
| **username**     |         | Username to use with OAuth 2.0 Password Grant authentication flow                                       |
| **password**     |         | Password to use with OAuth 2.0 Password Grant authentication flow                                       |
| **concurrency**  |         | Number of concurrent requests to perform in parallel. Default behavior is burst of 30/s, 1/s thereafter |



## Example

```javascript
const allthingsSdk = require('@allthings/sdk/rest')

const allthings = allthingsSdk({
  accessToken: '043dab7447450772example1214b552838003522',
})

allthings.getCurrentUser().then(viewer => 
  console.log(`Welcome back ${viewer.username}!`)
)
```


<!--
```javascript
const allthingsSdk = require('@allthings/sdk')

const allthings = allthingsSdk({
  accessToken: '043dab7447450772example1214b552838003522',
})

allthings.query.viewer().then(viewer => 
  console.log(`Welcome back ${viewer.username}!`)
)
```
-->

## API

### AllthingsSDK module

* [`allthingsApi()`](#api-@TODO)


---

<a name="api-@TODO" />

### allthings(configurationOptions): @TODO

@TODO

```javascript
const allthingsApi = require('@allthings/sdk')

@TODO
```

```typescript
// Describes the API wrapper's resulting interface
export interface InterfaceAllthingsRestApi {
  readonly delete: MethodHttpDelete
  readonly get: MethodHttpGet
  readonly post: MethodHttpPost
  readonly patch: MethodHttpPatch

  // Agent

  /**
   * Create a new agent. This is a convenience function around
   * creating a user and adding that user to a property-manager's team
   */
  readonly createAgent: MethodCreateAgent

  /**
   * Create agent permissions. This is a convenience function around
   * creating two user permission's: one "admin" and the other "pinboard"
   */
  readonly createAgentPermissions: MethodCreateAgentPermissions

  // App

  /**
   * Create a new App.
   */
  readonly createApp: MethodCreateApp

  // ID Lookup

  /**
   * Map one or more externalId's to API ObjectId's within the scope of a specified App
   */
  readonly createIdLookup: MethodCreateIdLookup

  // Group

  /**
   * Create a new group within a property
   */
  readonly createGroup: MethodCreateGroup

  /**
   * Get a group by it's ID
   */
  readonly getGroupById: MethodGetGroupById

  /**
   * Update a group by it's ID
   */
  readonly updateGroupById: MethodUpdateGroupById

  // Property

  /**
   * Create a new property
   */
  readonly createProperty: MethodCreateProperty

  /**
   * Get a property by it's ID
   */
  readonly getPropertyById: MethodGetPropertyById

  /**
   * Update a property by it's ID
   */
  readonly updatePropertyById: MethodUpdatePropertyById

  // Registration Code

  /**
   * Create a new registration code
   */
  readonly createRegistrationCode: MethodCreateRegistrationCode

  // Unit

  /**
   * Create a unit within a group
   */
  readonly createUnit: MethodCreateUnit

  /**
   * Get a unit by it's ID
   */
  readonly getUnitById: MethodGetUnitById

  /**
   * Update a unit by it's ID
   */
  readonly updateUnitById: MethodUpdateUnitById

  // User

  /**
   * Create a new User.
   */
  readonly createUser: MethodCreateUser

  /**
   * Give a user a permission/role on an given object of specified type
   */
  readonly createUserPermission: MethodCreateUserPermission

  /**
   * Delete a user a permission/role on an given object of specified type
   */
  readonly deleteUserPermission: MethodDeleteUserPermission

  /**
   * Get a list of users
   */
  readonly getUsers: MethodGetUsers

  /**
   * Get the current user from active session
   */
  readonly getCurrentUser: MethodGetCurrentUser

  /**
   * Get a user by their ID
   */
  readonly getUserById: MethodGetUserById

  /**
   * Get a list of user's permissions
   */
  readonly getUserPermissions: MethodGetUserPermissions

  /**
   * Update a user by their ID
   */
  readonly updateUserById: MethodUpdateUserById

  // Utilisation Period

  /**
   * Create a new utilisation period within a Unit
   */
  readonly createUtilisationPeriod: MethodCreateUtilisationPeriod

  /**
   * Get a utilisation period by it's ID
   */
  readonly getUtilisationPeriodById: MethodGetUtilisationPeriodById

  /**
   * Update a utilisation period by it's ID
   */
  readonly updateUtilisationPeriodById: MethodUpdateUtilisationPeriodById
}
```
