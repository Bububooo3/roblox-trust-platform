# User

> Mapped to `Users`

| Property            | Type     | Description                                                      |
| ------------------- | -------- | ---------------------------------------------------------------- |
| `id`                | BigInt   | DB-unique identifier                                             |
| `rblxUserID`        | BigInt   | ID # associated w/ user's roblox account (unique)                |
| `robloxUsername`    | String   | Username (not display name) associated w/ user's roblox account  |
| `productAccountAge` | Int      | Time in days since Roblox account was registered w/ the platform |
| `robloxAccountAge`  | Int      | Time in days since Roblox account was created                    |
| `lastLogin`         | DateTime | Date of last time user logged into platform                      |

<hr>
<br>

# Transaction

> Mapped to `Transactions`

> Optimized for index by `Status`\
> Optimized for index by `clientId`\
> Optimized for index by `developerId`\
> Optimized for index by `clientId, transactionID`\
> Optimized for index by `developerId, transactionID`\
> Optimized for index by `status`

| Property            | Type      | Description                                                                                   |
| ------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `transactionID`     | BigInt    | Unique identifier for the transaction                                                         |
| `projectName`       | String    | (Mutable) The name of the project associated w/ the transaction                               |
| `amountInCents`     | Int       | (Mutable) The payout stored as a uint in cents for accuracy                                   |
| `clientId`          | BigInt    | The roblox userId of the client                                                               |
| `developerId`       | BigInt    | The roblox userId of the developer                                                            |
| `developerReviewId` | BigInt?   | Unique identifier for the review by developer of the client                                   |
| `clientReviewId`    | BigInt?   | Unique identifier for the review by client of the developer                                   |
| `status`            | Status    | (Mutable -ish) Status of the transaction (updated through PATCH API calls)                    |
| `visible`           | Boolean   | (Mutable) If true anyone can see the transaction. If false only participants can.             |
| `createdAt`         | DateTime  | Date the transaction was initialized (before any confirmation)                                |
| `updatedAt`         | DateTime  | Date the transaction's properties were last changed                                           |
| `completedAt`       | DateTime? | Date the transaction's status became Success                                                  |
| `description`       | String    | (Mutable) Description of the work (editable by either party)                                  |
| `currency`          | String    | (Mutable during Pending) USD for now, but exists for eventual conversion display              |
| `media`             | Media[]   | (Unused, Mutable) Array of built-in references to media objects associated w/ the transaction |
| `clientReview`      | Review?   | Built-in reference to review by client of the developer                                       |
| `developerReview`   | Review?   | Built-in reference to review by developer of the client                                       |

<hr>
<br>

# Review

> Mapped to `Reviews`

> Must have a unique combination of `reviewerId, linkedTransactionId`

> Optimized for index by `revieweeId`\
> Optimized for index by `revieweeId, reviewID`

| Property              | Type         | Description                                                                         |
| --------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `reviewID`            | BigInt       | Unique identifier for the review                                                    |
| `rating`              | Int          | Rating out of 5 of the reviewee by the reviewer                                     |
| `description`         | String       | Feedback/elaboration from the reviewer about the reviewee                           |
| `reviewerId`          | BigInt       | The roblox userId of the person reviewing                                           |
| `revieweeId`          | BigInt       | The roblox userId of the person being reviewed                                      |
| `linkedTransactionId` | BigInt       | The unique identifier for the transaction associated with the review                |
| `asClientReview`      | Transaction? | Built-in reference to transaction where this is stored as a review by the client    |
| `asDeveloperReview`   | Transaction? | Built-in reverence to transaction where this is stored as a review by the developer |

<hr>
<br>

# Media

> Mapped to `Media`

| Property              | Type         | Description                                                                                |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| `mediaId`             | BigInt       | Unique identifier for the media object                                                     |
| `type`                | MediaType    | The type of media associated w/ this media object                                          |
| `linkedTransactionId` | BigInt       | The unique identifier for thhe transaction associated with this media object               |
| `contentID`           | BigInt?      | Identifier for retrieving stored images                                                    |
| `contentString`       | String?      | Hyperlink as a string                                                                      |
| `transaction`         | Transaction? | The transaction this media is associated with (one per instance, but no unique constraint) |

<hr>
<br>

# Application

> Mapped to `Applications`

| Property    | Type     | Description                                                      |
| ----------- | -------- | ---------------------------------------------------------------- |
| `id`        | String   | In-house identifier for the application object (cuid)            |
| `name`      | String   | User-provided name associated w/ API key                         |
| `apiKey`    | String   | The api key itself (crypto-generated hex string)                 |
| `createdAt` | DateTime | Date of creation of the apiKey                                   |
| `active`    | Boolean  | A way to disable an apiKey without deleting it from the database |

<hr>
<br>

# MediaType enum

| Type         | Description                   |
| ------------ | ----------------------------- |
| `Link`       | A link to an external webpage |
| `Picture`    | A roblox image                |
| `Experience` | A roblox experience           |
| `Group`      | A roblox group                |
| `Asset`      | A roblox asset                |

<hr>
<br>

# Status enum

| Type        | Description                                          |
| ----------- | ---------------------------------------------------- |
| `Success`   | The transaction is complete                          |
| `Cancelled` | The transaction was cancelled                        |
| `Reported`  | The transaction was reported/flagged by either party |
| `Pending`   | The transaction has not been accepted yet            |
| `Ongoing`   | The transaction is in the process of being completed |
