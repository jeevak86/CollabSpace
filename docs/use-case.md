# Use Case Diagram

```mermaid
flowchart LR
  Student((Student))
  subgraph CollabSpace
    UC1([Register / Login])
    UC2([View workspace])
    UC3([Create document])
    UC4([Open document])
    UC5([Edit document])
    UC6([Save document])
    UC7([Share document])
    UC8([Lock / Unlock])
    UC9([View activity])
    UC10([View DFA state])
    UC11([Collaborate in real time])
  end
  Student --- UC1
  Student --- UC2
  Student --- UC3
  Student --- UC4
  Student --- UC5
  Student --- UC6
  Student --- UC7
  Student --- UC8
  Student --- UC9
  Student --- UC10
  Student --- UC11
```

The document owner creates and deletes documents and can add collaborators. Owners and collaborators can read and edit unlocked documents. The backend verifies access for every protected operation.
