### Transaction
- Project Name (string)
- USD Payment (number)
- ClientID (User > Roblox account ID)
- EmployeeID (User > Roblox account ID)
- Employee review of Client (Review ID)
- Client review of Employee (Review ID)
- Status (Status enum)
- Media (Media ID[ ])
- Published (boolean)
- UUID (number)

<hr>
### User
- Roblox Username (string)
- Product Account Age (number)
- Roblox Account Age
- Roblox account ID (number)
	- (We can get and store Roblox username and Roblox account age once the account ownership is verified)
- Rating (number)
- Work history (Transaction ID[ ])

<hr>
### MediaType enum
*(Likely unused)*
- pictureID (for number)
- linkID (for number)
- experienceID (for number)
- groupID (for number)
- assetID (for number)

<hr>
### Status enum
- Success
- Cancelled
- Reported
- Pending
- Ongoing

<hr>
### Review
- Rating (number)
- Description (string)
- UUID (number)