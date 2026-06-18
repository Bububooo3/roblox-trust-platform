### Transaction
- Project Name (string)
- AmountInCents (int)
- ClientID (User > Roblox account ID)
- EmployeeID (User > Roblox account ID)
- Employee review of Client (Review ID)
- Client review of Employee (Review ID)
- Status (Status enum)
- Visible (boolean)
- UUID (number)
- CreatedAt (number)
- UpdatedAt (number)
- CompletedAt (number)
- Description (string)
- Currency (string) <- just gonna use USD rn

<hr>

### User
- Roblox Username (string)
- Product Account Age (number)
- Roblox Account Age (number)
- Roblox account ID (number)
	- (We can get and store Roblox username and Roblox account age once the account ownership is verified)

<hr>

### Media
- Type (MediaType)
- TransactionID (number)
- MediaID (number)

<hr>

### MediaType enum
- picture (for number)
- link (for number)
- experience (for number)
- group (for number)
- asset (for number)

<hr>

### Status enum
- Success
- Cancelled
- (Reported)
- Pending
- Ongoing

<hr>

### Review
- Rating (number)
- Description (string)
- UUID (number)
- ReviewerID (number)
- RevieweeID (number)
- TransactionID (number)