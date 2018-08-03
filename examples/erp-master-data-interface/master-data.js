;(async () => {
  /*

How-to: Allthings Platform Master Data Interface

===============================================================================

On the Allthings Platform, Master Data refers to the basic property-related
things which make up the property-data model. Master Data includes information
about the property location (Property), the structures located on the property
(Group), the units or own-able/rentable sub-divisions within a group (Units), and
who has, is currently, and will occupy or make use of a unit (Utilisation Periods—
often a contract).

We may use the Allthings REST API to create and modify these resources. This
guide will demonstrate how Master Data can be imported via the REST API
using the Allthings NodeJS SDK to aid explanation.

First, we must install the @allthings/sdk NPM package, which requires that
NodeJS and the NPM package manager are already installed:


npm install @allthings/sdk --save


We may now import the Allthings SDK library into our script:

*/

  const allthings = require('@allthings/sdk')

  /*

The REST API is authenticated with OAuth2. The SDK takes care of this for us.
We only need to provide OAuth Client and credential information. By default,
the SDK will look for credentials in environmental variables. It's also possible
to pass them to the restClient() function.

More information about Authentication with the SDK is available here: 
https://github.com/allthings/node-sdk#authentication

Let's instantiate a new client for the Allthings REST API:

*/

  const client = allthings.restClient()

  /*

We're now ready to import some Master Data. First let's look at the
relationships between a Property, Group, Unit, and Utilisation Period which can
be visualised by the following diagram:


 +-App--------------------------------------------------------+
 |                                                            |
 |   +-Property-+                                             |
 |   |          |   +-Group----+                              |
 |   | +-----+  |   |          |   +-Unit-----------------+   |
 |   | |Group+------+ +-----+  |   |                      |   |
 |   | +-----+  |   | |Unit +------+ +------------------+ |   |
 |   |          |   | +-----+  |   | |Utilisation Period| |   |
 |   | +-----+  |   |          |   | +------------------+ |   |
 |   | |Group|  |   | +-----+  |   |                      |   |
 |   | +-----+  |   | |Unit |  |   | +------------------+ |   |
 |   |          |   | +-----+  |   | |Utilisation Period| |   |
 |   | +-----+  |   |          |   | +------------------+ |   |
 |   | |Group|  |   | +-----+  |   |                      |   |
 |   | +-----+  |   | |Unit |  |   | +------------------+ |   |
 |   |          |   | +-----+  |   | |Utilisation Period| |   |
 |   |          |   |          |   | +------------------+ |   |
 |   |          |   |          |   |                      |   |
 |   +----------+   +----------+   +----------------------+   |
 |                                                            |
 +------------------------------------------------------------+


A Property belongs to an App context. A Property may contain many Groups.
A Group may contain many Units. A Unit may contain many Utilisation Periods—
however no period may overlap with another period. Conversely, a Utilisation
Period can belong to exactly one Unit. A Unit belongs to exactly one Group.
A Group belongs to exactly one Property. These relationships are established
upon creation of the resource. We'll see how in a moment.

Let's pretend that we have a large real-estate project featuring multiple
residential towers. In Allthings, we can represent this as a new Property.
We'll called it "Exemplum Towers" and create it using the SDKs
propertyCreate() method.

*/

  const property = await client.propertyCreate(process.env.ALLTHINGS_APP_ID, {
    externalId: 'b12eef3c-45b8-4e49-a34d-364a6ebb92a6',
    name: 'Exemplum Towers',
    timezone: allthings.EnumTimezone.EuropeLondon,
  })

  /*
+---------------- SDK: client.propertyCreate() -----------------+
| 
| POST /api/v1/apps/{appId}/properties
| https://api-doc.allthings.me/#!/Property/post_apps_appID_properties
|
+---------------------------------------------------------------+


We've just created our new Property. A few things to point out:

- ALLTHINGS_APP_ID — A Property is always created within the context of an
  App. An App is the context into which a user (e.g. a tenant) will log in to.
  In this case we are pulling the App ID from the ALLTHINGS_APP_ID
  environment variable.
- externalId — We can supply an "external ID" when creating a resource. This
  let's us provide our own ID so that we can later retrieve the ID of the
  resource within Allthings knowing only our own ID. It let's us map our external
  systems' ID to Allthings resource IDs. We'll explore this further later.

With our Property in hand, we can now create a representation of one of the
building Towers in Allthings. To do this we create a new Group. Let's call
our building "South Tower". South Tower is managed by a Property Manager
identified by the ID we've stored in an environment variable called
ALLTHINGS_APP_PROPERTY_MANAGER_ID to avoid hard-coding it. Usually Property
Managers are set up by Customer Success Representatives, so we'll skip over
creating one programmatically in this guide. 

We have our Property, and will create a new Group, linking it to the Property:


    +-Property-+
    |          |   **Group*****
    | *******  |   *          *
    | *Group+------+          *
    | *******  |   *          *
    |          |   *          *
    +----------+   ************


Let's create the Group now using the SDKs groupCreate() method.

*/

  const group = await client.groupCreate(property.id, {
    externalId: 'ef351710-5c06-496d-ab83-e71b627510ea',
    name: 'South Tower',
    propertyManagerId: process.env.ALLTHINGS_APP_PROPERTY_MANAGER_ID,
  })

  /*
+------------------ SDK: client.groupCreate() ------------------+
| 
| POST /api/v1/properties/{propertyId}/groups
| https://api-doc.allthings.me/#!/Groups/post_properties_propertyID_groups
|
+---------------------------------------------------------------+


Excellent. We now have our Group for the South Tower. Notice how we used the
"id" field from the Property we created before (property.id) to link the Group
with the Property. This let's us establish the parent-child relationship
between the Property and the Group. Again, we also provided our external ID
for this Group. The externalId field is always optional, but unless we keep
track of the newly created Group's ID in our own database, we won't be able to
easily find it again. We also provided the ID of the Property Manager who will
be responsible for the building.

Next we'll create a new Unit in the Group. There are probably hundreds of Units
in the South Tower, but let's start with... Unit 401. You'll notice a pattern
start to emerge:


    +-Property-+
    |          |   +-Group----+
    | +-----+  |   |          |   **Unit******************
    | |Group+------+ *******  |   *                      *
    | +-----+  |   | *Unit +------+                      *
    |          |   | *******  |   *                      *
    |          |   |          |   *                      *
    +----------+   +----------+   ************************


We'll create "Unit 401" in the South Tower with the SDKs unitCreate() method.

*/

  const unit = await client.unitCreate(group.id, {
    externalId: '493865c7-c3a3-43b0-83ca-43839e12ca8e',
    name: 'Unit 401',
    type: allthings.EnumUnitType.rented,
  })

  /*
+------------------- SDK: client.unitCreate() -------------------+
| 
| POST /api/v1/groups/{groupId}/units
| https://api-doc.allthings.me/#!/Units/post_groups_groupID_units
|
+----------------------------------------------------------------+


We've created Unit 401 in our Group. Again, we see that we've used the "id"
field from the Group we created earlier (group.id) to establish the
parent-child relationship between the Group and Unit. We also again gave the
Unit an external ID.

Now we're at the final piece of Master Data—the Utilisation Period. A
Utilisation Period is typically the Allthings representation of a real-world
contract associating a Tenant with a Unit. It represents the period during
which the Tenant (one or more Users) is occupying the Unit, and should thus
have access to the Allthings App for a Unit-Group-Property combination. 


    +-Property-+
    |          |   +-Group----+
    | +-----+  |   |          |   +-Unit-----------------+
    | |Group+------+ +-----+  |   |                      |
    | +-----+  |   | |Unit +------+ ******************** |
    |          |   | +-----+  |   | *Utilisation Period* |
    |          |   |          |   | ******************** |
    |          |   |          |   |                      |
    +----------+   +----------+   +----------------------+


A Utilisation Period has a date-range with a start date and optional
end date. A Unit may have multiple Utilisation Periods, however no Utilisation
Period within a single Unit may have overlapping start and end dates.


+-Unit-----------------------------------------------------------------------+
|                                                                            |
|   +-Utilisation-Period-+                                                   |
|   |                    |                                                   |
|   | Start: 2018-01-01  |                                                   |
|   | End:   2018-12-31  |                                                   |
|   |                    |                                                   |
|   +--------------------+  +-Utilisation-Period-+                           |
|                           |                    |                           |
|                           | Start: 2019-01-01  |                           |
|                           | End:   2022-05-31  |                           |
|                           |                    |                           |
|                           +--------------------+  +-Utilisation-Period-+   |
|                                                   |                    |   |
|                                                   | Start: 2022-06-01  |   |
|                                                   | End:               |   |
|                                                   |                    |   |
|                                                   |                    |   |
+----------------------------------------------------------------------------+


Let's create a new Utilisation Period in Unit 401. We'll use the SDKs
utilisationPeriodCreate() method.

*/

  const currentPeriod = await client.utilisationPeriodCreate(unit.id, {
    endDate: '2022-05-31',
    externalId: '1fd96b30-e07e-47cb-b4a1-2dd8e6555001',
    startDate: '2019-01-01',
  })

  /*
+------------ SDK: client.utilisationPeriodCreate() ------------+
| 
| POST /api/v1/units/{unitId}/utilisation-periods
| https://api-doc.allthings.me/#!/Utilisation32Periods/post_units_unitID_utilisation_periods
|
+---------------------------------------------------------------+

Our Utilisation Period has been created. As before, we've used the "id" field
from the Unit we created earlier (unit.id) to establish the parent-child
relationship between the Unit and Utilisation Period. We also again gave the
Utilisation Period an external ID.

We now want to "check in" a Tenant into this Utilisation Period thus given them
access to our App. Let's pretend that our records indicate that this Tenant
already has a User account from a previous Utilisation Period.


+-Unit-----------------------------------------------------------------------+
|                                                                            |
|   +-Utilisation-Period-+                                                   |
|   |                    |                                                   |
|   | Start: 2018-01-01  |                                                   |
|   | End:   2018-12-31  |                                                   |
|   |                    |                                                   |
|   +--------------------+  +-Utilisation-Period-+                           |
|                           |                    |                           |
|                           | Start: 2019-01-01  |                           |
|                           | End:   2022-05-31  |                           |
|                           |                    |                           |
|                           +-------^------------+  +-Utilisation-Period-+   |
|                                   |               |                    |   |
|                                   |               | Start: 2022-06-01  |   |
|                                   |               | End:               |   |
|                                   |               |                    |   |
|                                   |               |                    |   |
+----------------------------------------------------------------------------+
                                    |
                                    |
                            +-------+-------+
                            | Tenant / User |
                            +---------------+


We don't know the Allthings ID of this User, but we know our own external ID
for them. Assuming that we provided this external ID when the User was
created, we can look up their ID. We'll use the SDKs lookupIds() method to do
this.

*/

  const externalUserId = '68838434-bafc-47e9-a915-557fb0a7c67b'

  const userLookup = await client.lookupIds({
    externalIds: [externalUserId],
    resource: allthings.EnumResource.user,
  })

  /*
+------------------- SDK: client.lookupIds() --------------------+
| 
| POST /api/v1/id-lookup/{appId}/{resource} 
| https://api-doc.allthings.me/#!/Id45Lookup/post_id_lookup_appID_resource
|
+----------------------------------------------------------------+


The look-up returns a map of { externalId: internalId }. If an external ID
was not found, the internal ID will be null.

Knowing the User's Allthings ID, we can now check them into the Utilisation
Period we created earlier. We can use the SDKs userCheckInToUtilisationPeriod()
convenience method to do this.

*/

  await client.userCheckInToUtilisationPeriod(
    userLookup[externalUserId],
    currentPeriod.id,
  )

  /*
+--------- SDK: client.userCheckInToUtilisationPeriod() ---------+
| 
| GET /api/v1/users/{userId} 
| https://api-doc.allthings.me/#!/User/get_users_userId
|
| POST /api/v1/utilisation-periods/{utilisationPeriodId}/users
| https://api-doc.allthings.me/#/Utilisation32Periods
|
+----------------------------------------------------------------+


We've checked-in the existing User to the Utilisation Period. This means
that the User can now access the App, and interact with content channeled
to them through their Unit-Group-Property-App context.

Finally, let's say we have a future Utilisation Period that we want to prepare.
There's no existing User yet within Allthings, and so we will provide the
future Tenant with a Registration Code when they move in to the Unit. A
Registration Code is a unique identifier which allows a Tenant to sign-up to
our App with a new User account, and then be automatically checked-in to their
Utilisation Period.


+-Unit-----------------------------------------------------------------------+
|                                                                            |
|   +-Utilisation-Period-+                                                   |
|   |                    |                                                   |
|   | Start: 2018-01-01  |                                                   |
|   | End:   2018-12-31  |                                                   |
|   |                    |                                                   |
|   +--------------------+  +-Utilisation-Period-+                           |
|                           |                    |                           |
|                           | Start: 2019-01-01  |                           |
|                           | End:   2022-05-31  |                           |
|                           |                    |                           |
|                           +-------+------------+  **Utilisation-Period**   |
|                                   |               *                    *   |
|                                   |               * Start: 2022-06-01  *   |
|                                   |               * End:               *   |
|                                   |               *                    *   |
|                                   |               *       ^            *   |
+----------------------------------------------------------------------------+
                                    |                       |
                                    |                       |
                            +-------+-------+               |
                            | Tenant / User |               |
                            +---------------+               |
                                                            |
                                            ****************+****************
                                            *Registration Code / Future User*
                                            *********************************


We can't remember if we've already created the future Utilisation Period.
But, that's no problem. We can again do a look-up of our external ID to see
if it maps to an Utilisation Period ID in Allthings.

*/

  const externalFuturePeriodId = '2fd96b30-e07e-47cb-b4a1-2dd8e6555002'

  const futurePeriodLookup = await client.lookupIds({
    externalIds: [externalFuturePeriodId],
    resource: allthings.EnumResource.utilisationPeriod,
  })

  /*
+------------------- SDK: client.lookupIds() --------------------+
| 
| POST /api/v1/id-lookup/{appId}/{resource} 
| https://api-doc.allthings.me/#!/Id45Lookup/post_id_lookup_appID_resource
|
+----------------------------------------------------------------+

Performing the look-up we can now test whether or not the Utilisation
Period was already created. If not, then we can create the Utilisation
Period now, followed by creating a new Registration Code for the
Utilisation Period.

*/

  if (typeof futurePeriodLookup[externalFuturePeriodId] === 'string') {
    const futurePeriod = await client.utilisationPeriodCreate(unit.id, {
      externalId: externalFuturePeriodId,
      startDate: '2022-06-01',
    })

    await client.registrationCodeCreate('1234-5678-9000', futurePeriod.id, {
      externalId: 'e3e957c5-0e55-4cbc-b449-2fe82f3044bd',
    })
  }

  /*
+--------- SDK: client.userCheckInToUtilisationPeriod() ---------+
| 
| POST /api/v1/units/{unitId}/utilisation-periods
| https://api-doc.allthings.me/#!/Utilisation32Periods/post_units_unitID_utilisation_periods
|
| POST /api/v1/registration-codes
| https://api-doc.allthings.me/#!/Registration32Code/post_registration_codes
|
+----------------------------------------------------------------+

We've now seen how to create Master Data and how to associate Users with that
Data.

===============================================================================*/
})()
