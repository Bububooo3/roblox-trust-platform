# Pages

### `/`

> Landing page
>
> Signup/login\
> Site description
>
> Live user count (maybe)\
> Live transaction count (maybe)\
> <br>

<br>
<hr>

### `/auth`

#### `/auth/roblox/login`

> Roblox SSO sendoff

<br>

#### `/auth/roblox/return`

> Roblox SSO callback

<br>
<hr>

### `/users`

#### `/`

> Redirect to `/explore`

<br>

#### `/users/{Roblox UserId}`

> Profile page of specified user or 404 page

<br>

#### `/users/{Roblox UserId}/history`

> Transaction history of specified user

<br>

#### `/users/{Roblox UserId}/reviews`

> Reviews list of specified user

<br>
<hr>

### `/transactions`

#### `/`

> Redirect to `/explore`

<br>

#### `/transactions/{Transaction UUID}`

> Displays all details of specified transaction if it's accessible

<br>
<hr>

### `/explore`

> Browsable list of users\
> A row displays `username`, `average rating`, `#transactions`, `volume` (total earned + spent)
>
> | Query Param | Options                                                    | Default     |
> | ----------- | ---------------------------------------------------------- | ----------- |
> | `?search`   | Username or Roblox UserId                                  | —           |
> | `?sort`     | `username` (A-Z) \| `rating` \| `transactions` \| `volume` | `relevance` |
> | `?page`     | Page number                                                | `1`         |

<hr>
<br>
<br>

# API

> All `/api` routes require API key authentication  
> OAUTH routes also require user authorization (logged-in user)

<br>

### Health

#### `GET /api/health`

> Returns `{ status: "ok" }`

<br>
<hr>

### Users

#### `GET /api/users/self`

> Returns authenticated (logged-in) user's data or http code 404

<br>

#### `GET /api/users/{Roblox UserId}`

> Returns specified user's data

<br>

#### `GET /api/users/{Roblox UserId}/transactions`

> Returns specified user's transaction history (paginated)
>
> | Query Param | Default | Description                  |
> | ----------- | ------- | ---------------------------- |
> | `cursor`    | `0`     | Return records after this ID |

<br>

#### `GET /api/users/{Roblox UserId}/reviews`

> Returns the specified user's review history (paginated)
>
> | Query Param | Default | Description                  |
> | ----------- | ------- | ---------------------------- |
> | `cursor`    | `0`     | Return records after this ID |

<br>
<hr>

### Transactions

#### `GET /api/transactions`

> Returns transaction or array of transactions w/ specified transactionId(s)\
> (For multiple: `/api/transactions?target=1&target=2&target=3`)
>
> Returns http code 404 is any target is missing
>
> | Query Param | Description       |
> | ----------- | ----------------- |
> | `target`    | Transaction ID(s) |

<br>

#### `POST /api/transactions`

> <b>OAUTH REQUIRED</b>\
> Creates a new transaction. Initial status is `Pending`.

<br>

#### `PATCH /api/transactions/{Transaction ID}`

> <b>OAUTH REQUIRED</b>\
> Edits mutable transaction fields (not status)\
> `projectName`, `amountInCents*`, `description`, `currency`, `visible`

<br>

#### `POST /api/transactions/{Transaction ID}/accept`

> <b>OAUTH REQUIRED</b>\
> Developer accepts transaction from Client or vice-versa\
> <b>\*</b> `amountInCents` is no longer mutable
>
> Status: `Pending → Ongoing`\
> <br>

<br>

#### `POST /api/transactions/{Transaction ID}/complete`

> <b>OAUTH REQUIRED</b>\
> Both parties agree that transaction is finished\
> `completedAt` property is updated
>
> Status: `Ongoing → Complete`\
> <br>

<br>

#### `POST /api/transactions/{Transaction ID}/cancel`

> <b>OAUTH REQUIRED</b>\
> Both parties agree to cancel the transaction
>
> Status: `Pending | Ongoing → Cancelled`\
> <br>

<br>

#### `POST /api/transactions/{Transaction ID}/report`

> <b>OAUTH REQUIRED</b>\
> One party flags the transaction as disputed
>
> Status: `Ongoing | Success | Cancelled → Reported`\
> <br>

<br>
<hr>

### Reviews

#### `POST /api/transactions/{Transaction ID}/reviews`

> <b>OAUTH REQUIRED</b>\
> Submits a review for the other party on a transaction
>
> - `Success` transaction status required
> - One review per party per transaction
> - Returns new review and updated transaction\
>   <br>

<br>

#### `GET /api/reviews`

> Returns review or array of reviews w/ specified reviewId(s)\
> (For multiple: `/api/reviews?target=1&target=2&target=3`)
>
> Returns http code 404 is any target is missing
>
> | Query Param | Description  |
> | ----------- | ------------ |
> | `target`    | Review ID(s) |

<br>

#### `PATCH /api/reviews/{Review ID}`

> <b>OAUTH REQUIRED</b>\
> Edits mutable review fields\
> `rating`, `description`

<br>
<hr>

### Media

#### `POST /api/transactions/{Transaction ID}/media`

> <b>OAUTH REQUIRED</b>\
> Creates media object and attaches it to a transaction\
> Media objects are transaction-specific, but duplicate media can of course be stored
>
> | Property        | Required?        | Description                                               |
> | --------------- | ---------------- | --------------------------------------------------------- |
> | `type`          | Always           | `link` \| `picture` \| `experience` \| `group` \| `asset` |
> | `contentString` | `type` is `link` | URL string                                                |
> | `contentID`     | Any other type   | Roblox numeric ID                                         |

<br>

#### `GET /api/transactions/{Transaction ID}/media/{Media ID}`

> Fetches a specific media item on a transaction.

<br>

#### `DELETE /api/transactions/{Transaction ID}/media/{Media ID}`

> <b>OAUTH REQUIRED</b>\
> Removes a media item from a transaction.

<hr>
<br>
<br>

# API Keys

#### `POST /api-keys`

> Generates new API key

<br>

#### `DELETE /api-keys`

> <b>OAUTH REQUIRED</b>\
> Destroys the current API key\
> Obviously, API key is required
