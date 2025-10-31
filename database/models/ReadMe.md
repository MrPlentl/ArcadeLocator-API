CRUD Methods for Database models
These methods perform fundamental operations on the database.

Create:
create(data) → Inserts a new record into the database.

Update:
update(id, data) → Updates an existing record.

Delete:
delete(id) → Removes a record from the database.

Read
getAll() → Retrieves all records.
getById(id) → Fetches a single record by its primary key.

---

findOne(condition) → Fetches a single record based on a condition.
findAll(condition) → Retrieves multiple records based on a condition.

Filtering & Searching:
findByName(name) → Retrieves records that match a given name.
findByYear(year) → Retrieves movies from a specific year.
search(query) → Performs a search on multiple fields.
Aggregation & Counting:

count() → Returns the total number of records.
countByCondition(condition) → Counts records matching a condition.
Sorting & Pagination:

getSorted(column, order = 'ASC') → Fetches records sorted by a column.
paginate(limit, offset) → Retrieves a paginated subset of records.
Existence Checks:

exists(id) → Returns true if a record exists.
findOrCreate(data) → Retrieves a record if it exists or creates it if not.
