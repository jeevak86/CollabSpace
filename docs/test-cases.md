# Test Cases

| ID | Test | Steps | Expected result |
|---|---|---|---|
| TC01 | Registration | Submit valid name/email/password | User created |
| TC02 | Duplicate registration | Register same email twice | HTTP 409 |
| TC03 | Login | Submit correct credentials | JWT returned |
| TC04 | Invalid login | Wrong password | HTTP 401 |
| TC05 | Create document | POST valid title | MongoDB document created |
| TC06 | List documents | GET documents | Owner/collaborator docs returned |
| TC07 | Update document | PUT current version | Content persisted and version incremented |
| TC08 | Stale update | PUT old version | HTTP 409; no overwrite |
| TC09 | Lock | Apply LOCK from valid state | State becomes LOCKED |
| TC10 | Edit while locked | Attempt edit as another user | Rejected |
| TC11 | Unlock | Lock holder/owner applies UNLOCK | State becomes SAVED |
| TC12 | Invalid DFA transition | EDIT from LOCKED | HTTP 400; state unchanged |
| TC13 | Sharing | Owner shares with registered email | Collaborator gains access |
| TC14 | Real-time update | Two browsers join same document; edit | Other browser receives update |
| TC15 | Refresh persistence | Save and refresh | MongoDB content is restored |
| TC16 | Delete | Owner deletes document | Document and activity records removed |

Record actual result, pass/fail, date and screenshot after executing each test. Do not mark tests as passed until run.
